const models = require('../models/query/Query')
const fs = require("fs");
const qs = require("qs");
const url = require("url");
let formidable = require('formidable');
const sessionControllers = require('./sessionControllers')
const cookie = require("cookie");
const util = require('util');

module.exports = {
    readFile: (path, statusCode, res) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            res.writeHead(statusCode, {'Content-type': 'text/html'});
            res.write(data);
            res.end();
        });
    },
    add: (req, res) => {

        var form = new formidable.IncomingForm();

        // form.parse analyzes the incoming stream data, picking apart the different fields and files for you.

        form.parse(req, function (err, fields, files) {

            if (err) {
                console.error(err.message);
                return;
            }
            form.uploaddir = 'public/upload/'
            let tmpPath = files.avatar.filepath;
            let newPath = form.uploaddir + files.avatar.originalFilename;
            let avatarPath = form.uploaddir + files.avatar.originalFilename;
            models.add({...fields, avatarPath})
                .then(result => {
                })
            fs.rename(tmpPath, newPath, (err) => {
                if (err) throw err;
                let fileType = files.avatar.mimeType;
                let mimeTypes = ["image/jpeg", "image/jpg", "image/png"];
                if (mimeTypes.indexOf(fileType) === -1) {
                    res.writeHead(200, {"Content-Type": "text/html"});
                    return res.end('The file is not in the correct format: png, jpeg, jpg');
                }
            });
            res.writeHead(301, {location: '/product/render'})
            res.end();


        });

    },
    render: (req, res) => {
        models.pagination()
            .then(result => {
                let offset = 0;
                let a = Math.ceil(result[0].count / 5);
                let currentPage = 1;
                if (url.parse(req.url).query) {
                    currentPage = url.parse(req.url)?.query?.slice(5, 6)
                    offset = (currentPage - 1) * 5;
                }
                let data = '';
                req.on('data', chunk => data += chunk)
                req.on('end', () => {
                    fs.readFile('./views/render.html', 'utf-8', (err, data) => {
                        models.select(offset).then(result => {
                            let html = '';
                            let htmlPage = '';

                            result.forEach((data, index) => {

                                html += '<tr>';
                                html += `<td>${index + 1}</td>`;
                                html += `<td><img src="${data.avatarPath}" class="rounded-circle mb-3"
  style="width: 150px;" alt=""></td>`;
                                html += `<td>${data.name}</td>`;
                                html += `<td>${data.type}</td>`;
                                html += `<td>${data.price}</td>`;
                                html += `<td>${data.detail}</td>`;
                                html += `<td><a class="btn btn-primary"href="/product/edit?id=${data.id}">Edit</a><a class="btn btn-danger"href="/product/delete-data?id=${data.id}">Delete</a></td>`
                                html += `</tr>`;
                            })
                            htmlPage += `<li class="page-item"><a class="page-link" href="/product/render?page=${Number(currentPage) - 1}">Previous</a></li>
                            <li class="page-item"><a class="page-link" href="/product/render?page=${Number(currentPage) + 1}">Next</a></li>`

                            data = data.replace('{render}', html);
                            data = data.replace('{page}', htmlPage);
                            res.writeHead(200, {'Content-type': 'text/html'});
                            res.write(data);
                            res.end();
                        });
                    });
                });
            })

    },

    delete: (req, res) => {
        let urlPath = url.parse(req.url, true)
        let id = (qs.parse(urlPath.query)).id;
        models.delete(id)
            .then(result => {
                res.writeHead(301, {
                    Location: '/product/render'
                });
                res.end();
            })
    },
    getEdit: (req, res) => {
        fs.readFile('./views/edit.html', 'utf8', (err, dataEdit) => {
            let url1 = url.parse(req.url, true)
            let id = (qs.parse(url1.query)).id;
            models.getEdit(id)
                .then(result => {
                    res.writeHead(200, {'content-type': 'text/html'})
                    dataEdit = dataEdit.replace('<input type="text" id="name" name="nameEdit">',
                        `<input type="text" name="nameEdit" id="name" value ='${result[0].name}'>`
                    );
                    dataEdit = dataEdit.replace('<input type="text" id="type" name="typeEdit">',
                        `<input type="text" name="typeEdit" id="type" value ='${result[0].type}'>`
                    );
                    dataEdit = dataEdit.replace('    <input type="text" id="price" name="priceEdit">',
                        `<input type="text" name="priceEdit" id="price" value ='${result[0].price}'>`
                    );
                    dataEdit = dataEdit.replace('<textarea name="detailEdit" id="detail" ></textarea>',
                        `<textarea name="detailEdit" id="detail" form = 'form'  >${result[0].detail}</textarea>`)
                    res.write(dataEdit)
                    res.end();
                });
        });
    },
    edit: (req, res) => {
        let data = '';
        req.on('data', (chunk) => data += chunk);
        req.on('end', () => {
            let url1 = url.parse(req.url, true)
            let id = (qs.parse(url1.query)).id;
            let dataEdit = qs.parse(data);
            models.edit(dataEdit, id)
                .then(result => {
                    res.writeHead(301, {
                        Location: '/product/render'
                    });
                    res.end();
                })
        })
    },
    login: (req, res) => {
        if (req.method === 'GET') {
            let cookies = (cookie.parse(req.headers.cookie || ''))
            let nameCookie = '';
            if (cookies.cookie_user) {
                nameCookie = (JSON.parse(cookies.cookie_user)).session_name_file
                fs.exists('./token/' + nameCookie + '.txt', (exists) => {
                    if (exists) {
                        res.writeHead(301, {location: '/render'});
                        res.end();
                    } else {
                        this.readFile(req, res, './views/login.html')
                    }
                });

            } else {

                this.readFile('./views/login.html',)
            }
        } else {
            let data = '';
            req.on('data', (chunk) => data += chunk);
            req.on('end', () => {
                let dataLogin = qs.parse(data);
                models.checkAccount(dataLogin)
                    .then(result => {
                        if (result.length > 0) {
                            let nameFile = Date.now();
                            let sessionLogin = {
                                'session_name_file': nameFile,
                                'data_user_login': result[0]
                            };
                            let cookieLogin = {
                                'session_name_file': nameFile
                            }
                            res.setHeader('Set-Cookie', cookie.serialize('cookie_user', JSON.stringify(cookieLogin)));
                            if (result[0].role === '1') {
                                res.writeHead(301, {location: '/home'})
                                res.end();
                            } else if (result[0].role === '2') {
                                res.writeHead(301, {location: '/render'})
                                res.end();
                            }
                            fs.writeFile('./token/' + nameFile, JSON.stringify(sessionLogin), err => {
                                if (err) {
                                    throw new Error(err.message);
                                }
                            })
                        } else {
                            fs.readFile('./views/login.html', 'utf-8', (err, data) => {
                                data = data.replace('<small hidden>hi</small>', '<small style="color: red">Wrong username!!</small>');
                                data = data.replace('<small hidden>ha</small>', '<small style="color: red">Wrong password!!</small>');
                                res.writeHead(301, {
                                    Location: '/login'
                                });
                                res.writeHead(200, {'Content-type': 'text/html'})
                                res.write(data);
                                res.end();
                            })
                        }
                    })
            })
        }
    },
    login2: (req, res) => {
        if (req.method === 'GET') {
            fs.readFile('./views/login.html', 'utf8', ((err, data) => {
                if (err) {
                    throw new Error(err.message)
                }

                res.writeHead(200, {'Content-type': 'text/html'})
                res.write(data);
                res.end();
            }))
        } else {
            let data = '';
            req.on('data', chunk => data += chunk);
            req.on('end', () => {
                let dataLogin = qs.parse(data);
                models.checkAccount(dataLogin)
                    .then(result => {
                        if (result.length > 0) {
                            let sessionUser = {
                                sessionLogin: {
                                    user: {
                                        name: dataLogin.name,
                                        email: dataLogin.email,
                                    }
                                }
                            }
                            let nameFileSession = Date.now();
                            fs.writeFile(`./token/${nameFileSession}.txt`, JSON.stringify(sessionUser), err => {
                                if (err) {
                                    throw new Error(err.message)
                                }
                                console.log('created session success!')
                            })

                            let cookieOfSession = {
                                name_file_session: nameFileSession
                            }

                            res.setHeader('set-cookie', cookie.serialize('name', JSON.stringify(cookieOfSession)))
                            if (result[0].role === '1') {
                                res.writeHead(301, {Location: '/product/home'})
                                res.end()
                            } else {
                                res.writeHead(301, {Location: '/product/render'})
                                res.end()
                            }
                        }
                    })
            })
        }
    },
    register: (req, res) => {
        let data = '';
        req.on('data', chunk => data += chunk)
        req.on('end', () => {
            let dataRegister = qs.parse(data);
            let expires = Date.now() + 1000 * 60 * 60;
            let tokenSession = "{\"name\":\"" + data.name + "\",\"email\":\"" + data.email + "\",\"password\":\"" + data.password + "\",\"expires\":" + expires + "}";
            let tokenId = sessionControllers.createRandomString(20);
            let fileName = './token/' + tokenId;
            fs.writeFile(fileName, tokenSession, err => {
            })
            fs.writeFile(fileName, data, err => {

            })
            models.addAccount(dataRegister)
                .then(result => {
                    res.writeHead(301, {
                        Location: '/login'
                    });
                    res.end()
                })
        });
    },
    home: (req, res) => {
        models.pagination()
            .then(result=>{
                let offset = 0;
                let a = Math.ceil(result[0].count / 5);
                let currentPage = 1;
                if (url.parse(req.url).query) {
                    currentPage = url.parse(req.url)?.query?.slice(5, 6)
                    offset = (currentPage - 1) * 5;
                }
                let data = '';
                req.on('data', chunk => data += chunk)
                req.on('end', () => {
                    fs.readFile('./views/home.html', 'utf-8', (err, data) => {
                        models.select(offset).then(result => {
                            let html = '';
                            result.forEach((data, index) => {
                                html += `<tr>`;
                                html += `<td>${index + 1}</td>`
                                html += `<td><img src="${data.avatarPath}" class="rounded-circle mb-3" style="width: 150px;" alt=""></td>`;
                                html += `<td>${data.name}</td>`
                                html += `<td>${data.type}</td>`
                                html += `<td>${data.price}</td>`
                                html += `<td>${data.detail}</td>`
                                html += `<td><a href="">Add</a></td>`
                                html += `</tr>`;
                            })
                            let htmlPage = ''
                            htmlPage += `<li class="page-item"><a class="page-link" href="/product/home?page=${Number(currentPage) - 1}">Previous</a></li>
                            <li class="page-item"><a class="page-link" href="/product/home?page=${Number(currentPage) + 1}">Next</a></li>`
                            data = data.replace('{render}', html);
                            data = data.replace('{page}', htmlPage);

                            res.writeHead(200, {'Content-type': 'text/html'});
                            res.write(data);
                            res.end();
                        });
                    });
                });

            })

    },
    checkLogin: (req, res) => {
        let cookieReq = req.headers.cookie

        if (cookieReq) {
            let cookieObj = cookie.parse(cookieReq);
            if (cookieObj.name) {
                return true;

            }
            return false
        }
        return false;
    },
    pagination: (req, res) => {
        models.pagination()
            .then(result => {
                let a = result[0].count / 5;
                let curPage = url.parse(req.url).query.slice(5, 6)
                return (curPage - 1) * 5;
            })
    },



};
