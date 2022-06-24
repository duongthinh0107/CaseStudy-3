const models = require('../models/query/Query')
const fs = require("fs");
const qs = require("qs");
const url = require("url");
let formidable = require('formidable');
const sessionControllers = require('./sessionControllers')
const cookie = require("qs");

module.exports = {
    readFile: (path, statusCode, res) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            res.writeHead(statusCode, {'Content-type': 'text/html'});
            res.write(data);
            res.end();
        });
    },
    add: (req, res) => {
        let data = '';
        req.on('data', chunk => data += chunk)
        req.on('end', () => {
            let data1 = qs.parse(data);
            models.add(data1)
                .then(result => {
                    res.writeHead(301, {
                        Location: '/render' // This is your url which you want
                    });
                    res.end();
                })
        })
    },
    render: (req, res) => {
        let data = '';
        req.on('data', chunk => data += chunk)
        req.on('end', () => {
            fs.readFile('./views/render.html', 'utf-8', (err, data) => {
                models.select().then(result => {
                    // let page = (url.parse(req.url).query)
                    // let perPage = 5;
                    // let start = (page - 1) * perPage;
                    // let end = page * perPage;
                    // result = result.slice(start, end);
                    // console.log(page)
                    let html = '';
                    result.forEach((data, index) => {
                        html += '<tr>';
                        html += `<td>${index + 1}</td>`;
                        html += `<td>${data.name}</td>`;
                        html += `<td>${data.type}</td>`;
                        html += `<td>${data.price}</td>`;
                        html += `<td>${data.detail}</td>`;
                        html += `<td><a class="btn btn-primary"href="/edit?id=${data.id}">Edit</a><a class="btn btn-danger"href="/delete-data?id=${data.id}">Delete</a></td>`
                        html += `</tr>`;
                    })
                    // let htmlPage = '';
                    // htmlPage += `<nav aria-label="Page navigation example">`
                    // htmlPage += `        <ul class="pagination">`
                    // htmlPage += `<li class="page-item"><a class="page-link" href="render?=${perPage -1}">Previous</a></li>`
                    // htmlPage += `<li class="page-item"><a class="page-link" href="${perPage + 1}">Next</a></li>`
                    // htmlPage += `</ul>`
                    // htmlPage += `</nav>`
                    data = data.replace('{render}', html);
                    // data = data.replace('{page}', htmlPage);
                    res.writeHead(200, {'Content-type': 'text/html'});
                    res.write(data);
                    res.end();
                });
            });
        });
    },

    delete: (req, res) => {
        let urlPath = url.parse(req.url, true)
        let id = (qs.parse(urlPath.query)).id;
        models.delete(id)
            .then(result => {
                console.log(result)
                res.writeHead(301, {
                    Location: '/render'
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
                    console.log(result);
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
            console.log(dataEdit)
            models.edit(dataEdit, id)
                .then(result => {
                    console.log(result);
                    res.writeHead(301, {
                        Location: '/render'
                    });
                    res.end();
                })
        })
    },
    login: (req, res) => {
        if (req.method === 'GET') {

            let cookies = (cookie.parse(req.headers.cookie || ''))
            console.log(cookies)
            let nameCookie = '';
            if (cookies.cookie_user) {
                nameCookie = (JSON.parse(cookies.cookie_user)).session_name_file
                fs.exists('./token/' + nameCookie + '.txt', (exists) => {
                    if (exists) {
                        console.log(exists)
                        res.writeHead(301, {location: '/render'});
                        res.end();
                    } else {
                        this.readFile(req, res, './views/login.html')
                    }
                });

            } else {

                this.readFile('./views/login.html',)
            }
        }
        let data = '';
        req.on('data', (chunk) => data += chunk);
        req.on('end', () => {
            let dataLogin = qs.parse(data);
            console.log(dataLogin)
            models.checkAccount(dataLogin)
                .then(result => {
                    console.log(result)
                    if (result.length > 0 && result[0].role === '1') {
                        res.writeHead(301, {
                            Location: '/home'
                        });
                        res.end();
                    } else if (result.length > 0 && result[0].role === '2') {
                        res.writeHead(301, {
                            Location: '/render'
                        });
                        res.end();
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
                    console.log(result);
                    res.writeHead(301, {
                        Location: '/login'
                    });
                    res.end()
                })
        });
    },
    upload: (req, res) => {
        let form = new formidable.IncomingForm();
        //parse a file upload
        form.uploadDir = "./uploads";
        form.keepExtension = true;
        form.maxFieldsSize = 10 * 1024 * 1024;// 10mb
        form.multiples = true;
        form.parse(req, (err, field, files) => {
            let arrOfImages = files[""];
            if (arrOfImages.length > 0) {
                let arr = [];
                arr.forEach(eachFile => {
                    arr.push(eachFile.path);
                })
                res.end('ok')
            } else {
                res.end('err')
            }
        })
    },
    home: (req, res) => {
        let data = '';
        req.on('data', chunk => data += chunk)
        req.on('end', () => {
            fs.readFile('./views/home.html', 'utf-8', (err, data) => {
                models.select().then(result => {
                    console.log(result)
                    let html = '';
                    result.forEach((data, index) => {
                        html += `<tr>`;
                        html += `<td>${index + 1}</td>`
                        html += `<td>${data.name}</td>`
                        html += `<td>${data.type}</td>`
                        html += `<td>${data.price}</td>`
                        html += `<td>${data.detail}</td>`
                        html += `<td><a href="">Add</a></td>`
                        html += `</tr>`;
                    })
                    data = data.replace('{render}', html);
                    res.writeHead(200, {'Content-type': 'text/html'});
                    res.write(data);
                    res.end();
                });
            });
        });
    },

};
