const http = require('http');
const url = require('url');
const fs = require('fs');


http.createServer( (request, response) => {
    let addr = request.url;
    let q = url.parse(addr, true);
    let filePath = '';

    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (error) => {
        if (error) {
            console.log(error);
        }else {
            console.log('added to log.txt')
        }
    })

    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    }else {
        filePath = 'index.html';
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            throw error;
        }

        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    })
    
}).listen(8080);

console.log('My first Node test server is running on port 8080');
