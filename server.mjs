import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.sql':'text/plain; charset=utf-8'};
createServer(async (req,res)=>{
  try {
    const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const safe = normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
    let file = join(root, safe === '/' ? 'index.html' : safe.replace(/^[/\\]/,''));
    if ((await stat(file)).isDirectory()) file = join(file,'index.html');
    res.writeHead(200, {'Content-Type':types[extname(file).toLowerCase()] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(8000,'127.0.0.1',()=>console.log('Amberflo: http://127.0.0.1:8000'));
