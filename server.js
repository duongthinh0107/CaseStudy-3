const http = require('http');
const PORT = 8080;
const conn = require('./models/db/conectDB');
const controllers = require('./controllers/controller')
const sessionControllers = require('./controllers/sessionControllers')
const url = require("url");
const fs = require('fs');
const path2 = require('path');

const mimeTypes = {
    "html": "text/html",
    "js": "text/javascript",
    "css": "text/css",
    "jpeg": "image/jpeg",
    "svg": "image/svg+xml",
    "png": "image/png",
    "jpg": "image/jpg"
};


conn.connect(err => {
    if (err) {
        throw Error(err.message);
    } else {
        console.log('connect success!!!');
    }
});


const server = http.createServer((req, res) => {
    let parseUrl = url.parse(req.url, true);
    if (parseUrl.pathname === '/') {
        controllers.readFile('./views/home.html', 200, res);
    }
    const filesDefences = req.url.match(/\.js$|.css$|.jpeg$|.svg$|.png$|.jpg$/);
    if (filesDefences) {
        const extension = mimeTypes[filesDefences[0].toString().split('.')[1]];
        res.writeHead(200, { 'Content-Type': extension });
        let fileName = path2.basename(req.url)
        let pathSrc = path2.join("./","public", fileName);

        fs.createReadStream(pathSrc).pipe(res)
    }



    let path = parseUrl.pathname;
    let trimPath = path.replace(/^\/+|\/+$/g, '');

    let chosenHandler = (typeof (router[trimPath]) !== 'undefined') ? router[trimPath] : handlers.notFound;
    chosenHandler(req, res);


});

server.listen(PORT, () => {
    console.log('server listening on port ' + PORT);
});

//router
let handlers = {};

handlers.home = (req, res) => {
    controllers.home(req,res)
}

handlers.login = (req, res) => {
    let urlLogin = url.parse(req.url).pathname;

    if (urlLogin === '/login') {
        if (req.method === 'GET') {
            controllers.readFile('./views/login.html', 200, res);
        } else {
            controllers.login(req, res);
        }
    }
};

handlers.register = (req, res) => {
    if (req.method === 'GET') {
        controllers.readFile('./views/register.html', 200, res)
    } else {
        controllers.register(req, res);
    }
}

handlers.add = (req, res) => {
    if (req.method === 'GET') {
        controllers.readFile('./views/add.html', 200, res);
    } else {
        controllers.add(req, res);
    }
};

handlers.edit = (req, res) => {
    if (req.method === 'GET') {
        controllers.getEdit(req, res);
    } else {
        controllers.edit(req, res);
    }
}

handlers.render = (req, res) => {
    controllers.render(req, res);
};

handlers.delete = (req, res) => {
    controllers.delete(req, res);
};

handlers.upload = (req, res) => {
    controllers.upload(req,res)
}


handlers.notFound = (req, res) => {
    controllers.readFile('./views/404.html', 404, res);
};


const router = {
    'home': handlers.home,
    'login': handlers.login,
    'add': handlers.add,
    'edit': handlers.edit,
    'render': handlers.render,
    'delete-data': handlers.delete,
    'register': handlers.register,
    'upload-image': handlers.upload
};

