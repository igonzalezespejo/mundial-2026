import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 4173;
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    
    // Normalize url
    let urlPath = req.url === '/' ? '/index.html' : req.url;
    // Remove query params
    urlPath = urlPath.split('?')[0];

    const filePath = path.join(process.cwd(), urlPath);
    const extname = path.extname(filePath).toLowerCase();

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found', 'utf-8');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Server Error: ${err.code}`, 'utf-8');
            }
        } else {
            const contentType = MIME_TYPES[extname] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running locally at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop.');
});
