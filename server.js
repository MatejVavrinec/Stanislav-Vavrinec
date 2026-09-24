const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const BLOG_FILE = path.join(ROOT, 'blog-posts.json');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg'
};

function readPosts() {
  try {
    const posts = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
    return Array.isArray(posts) ? posts : [];
  } catch (error) {
    return [];
  }
}

function writePosts(posts) {
  fs.writeFileSync(BLOG_FILE, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body is too large.'));
        request.destroy();
      }
    });

    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function serveStatic(request, response, pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(ROOT, `.${requestedPath}`);

  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  response.writeHead(200, {
    'Content-Type': contentTypes[extension] || 'application/octet-stream',
    'Cache-Control': 'no-cache'
  });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (requestUrl.pathname === '/api/posts') {
    if (request.method === 'GET') {
      sendJson(response, 200, readPosts());
      return;
    }

    if (request.method === 'PUT') {
      try {
        const posts = JSON.parse(await readRequestBody(request));
        if (!Array.isArray(posts)) {
          sendJson(response, 400, { error: 'Posts must be an array.' });
          return;
        }

        writePosts(posts);
        sendJson(response, 200, { ok: true, posts });
      } catch (error) {
        sendJson(response, 400, { error: 'Invalid posts payload.' });
      }
      return;
    }

    response.writeHead(405, { Allow: 'GET, PUT' });
    response.end();
    return;
  }

  serveStatic(request, response, requestUrl.pathname);
});

server.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
  console.log(`Blog storage: ${BLOG_FILE}`);
});
