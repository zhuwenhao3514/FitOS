import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {networkInterfaces} from 'node:os';
const root=resolve('.');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const requested=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);const file=resolve(root,'.'+requested);if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end('Forbidden');return;}const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'}).end(body);}catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Not found');}});
const port=Number(process.env.PORT)||4173;
server.listen(port,'0.0.0.0',()=>{console.log(`FitOS available at http://localhost:${port}`);for(const entries of Object.values(networkInterfaces()))for(const item of entries||[])if(item.family==='IPv4'&&!item.internal)console.log(`Phone on the same Wi-Fi: http://${item.address}:${port}/`);});

