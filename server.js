'use strict';
const shopSchema = "CREATE TABLE IF NOT EXISTS offers (\n id TEXT PRIMARY KEY NOT NULL, owner TEXT NOT NULL, title TEXT NOT NULL,\n category TEXT NOT NULL, cents INTEGER NOT NULL, description TEXT NOT NULL,\n length_cm REAL, weight_g REAL, photos TEXT NOT NULL DEFAULT '[]', created INTEGER NOT NULL, version INTEGER NOT NULL DEFAULT 1\n);\n\nCREATE INDEX IF NOT EXISTS offers_created ON offers(created DESC);\n\nCREATE TABLE IF NOT EXISTS ratings (\n offer_id TEXT NOT NULL REFERENCES offers(id) ON DELETE CASCADE, user_id TEXT NOT NULL,\n stars INTEGER NOT NULL CHECK(stars BETWEEN 1 AND 5), PRIMARY KEY(offer_id,user_id)\n);\r\n";

const categories=['amphibien','knorpelfische','knochenfische','kopffuesser','food','rods','other'];
function fail(code,status){throw Object.assign(new Error(code),{status})}
function response(value,status=200){return Response.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}
const idPattern=/^[0-9a-f-]{36}$/;
function identity(request,env){
 const user=request.headers.get('oai-authenticated-user-id')||'';
 const email=(request.headers.get('oai-authenticated-user-email')||'').trim().toLowerCase();
 const admin=!!user&&!!email&&(env.BIGBEN_ADMIN_EMAILS||'').split(',').some(e=>e.trim().toLowerCase()===email);
 return {user,admin};
}
function parseFields(form){
 function field(k,max){const s=String(form.get(k)||'').trim();if(!s||s.length>max)fail('invalid',400);return s}
 function measure(k){const v=form.get(k);if(v==null||v==='')return null;const n=Number(v);if(!Number.isFinite(n)||n<=0||n>1e9)fail('invalid',400);return n}
 const title=field('title',100),description=field('description',3000),category=field('category',25);
 const price=String(form.get('price')??'').replace(',','.');if(!categories.includes(category)||!/^\d{1,8}(\.\d{1,2})?$/.test(price))fail('invalid',400);
 return {title,description,category,cents:Math.round(Number(price)*100),length:measure('length'),weight:measure('weight')};
}
async function jpegUpload(files,bucket,offerId){
 if(files.length>4)fail('photoLimit',400);
 const blobs=[];
 for(const f of files){if(!f||typeof f.arrayBuffer!=='function'||f.size>600000||f.size<4)fail('photo',400);const bytes=new Uint8Array(await f.arrayBuffer());if(bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)fail('photo',400);blobs.push(bytes)}
 const keys=[];try{for(const bytes of blobs){const key=offerId+'/'+crypto.randomUUID();await bucket.put(key,bytes,{httpMetadata:{contentType:'image/jpeg'}});keys.push(key)}return keys}catch(e){if(keys.length)await bucket.delete(keys);throw e}
}
async function handleCommunity(request,env,ctx){
 const url=new URL(request.url),path=url.pathname.split('/').filter(Boolean),method=request.method,{user,admin}=identity(request,env);
 const db=env.DB;const [api,resource,id,action]=path;
 if(resource==='photos'&&method==='GET'&&idPattern.test(id)&&idPattern.test(action)){
  const rec=await db.prepare('SELECT photos FROM offers WHERE id=?').bind(id).first(),key=id+'/'+action;
  if(!rec||!JSON.parse(rec.photos).includes(key))fail('missing',404);
  const file=await env.BUCKET.get(key);if(!file)fail('missing',404);
  return new Response(file.body,{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, max-age=60','X-Content-Type-Options':'nosniff'}});
 }
 if(resource!=='offers')fail('missing',404);
 if(!id&&method==='GET'){
  const result=await db.prepare(`SELECT o.*, (SELECT AVG(stars) FROM ratings r WHERE r.offer_id=o.id) AS average,
  (SELECT COUNT(*) FROM ratings r WHERE r.offer_id=o.id) AS votes,
  (SELECT stars FROM ratings r WHERE r.offer_id=o.id AND r.user_id=?) AS myRating FROM offers o ORDER BY created DESC, id`).bind(user).all();
  const items=result.results.map(({owner,photos,...o})=>({...o,own:!!user&&owner===user,photos:JSON.parse(photos).map(k=>'/api/photos/'+k)}));
  return response({signed:!!user,admin,items});
 }
 if(!user)fail('signin',401);
 if(request.headers.get('Origin')!==url.origin)fail('forbidden',403);
 if(id&&!idPattern.test(id))fail('missing',404);
 const row=id?await db.prepare('SELECT owner,photos,version FROM offers WHERE id=?').bind(id).first():null;
 if(id&&!row)fail('missing',404);
 if(id&&action==='rating'&&method==='PUT'){
  if(row.owner===user)fail('ownRating',403);const {stars}=await request.json();if(!Number.isInteger(stars)||stars<1||stars>5)fail('invalid',400);
  await db.prepare('INSERT INTO ratings (offer_id,user_id,stars) VALUES (?,?,?) ON CONFLICT(offer_id,user_id) DO UPDATE SET stars=excluded.stars').bind(id,user,stars).run();return response({ok:true});
 }
 if(id&&!action&&method==='DELETE'){
  if(!admin&&row.owner!==user)fail('forbidden',403);
  const deleted=await db.prepare('DELETE FROM offers WHERE id=? AND version=?').bind(id,row.version).run();if(!deleted.meta.changes)fail('changed',409);
  const keys=JSON.parse(row.photos);if(keys.length)ctx.waitUntil(env.BUCKET.delete(keys));return response({ok:true});
 }
 const create=!id&&method==='POST',edit=id&&!action&&method==='PUT';
 if(!create&&!edit)fail('method',405);if(edit&&!admin)fail('forbidden',403);
 if(Number(request.headers.get('Content-Length'))>2600000)fail('photoLimit',413);
 const form=await request.formData(),fields=parseFields(form),offerId=id||crypto.randomUUID(),oldPhotos=JSON.parse(row?.photos||'[]');
 if(edit&&Number(form.get('version'))!==row.version)fail('changed',409);
 const retained=edit?oldPhotos.filter(k=>form.getAll('keep').includes('/api/photos/'+k)):[];
 const files=form.getAll('photos');if(files.length+retained.length>4)fail('photoLimit',400);
 const fresh=await jpegUpload(files,env.BUCKET,offerId),images=JSON.stringify([...retained,...fresh]);
 const values=[fields.title,fields.category,fields.cents,fields.description,fields.length,fields.weight,images];
 try{
  if(create){await db.prepare('INSERT INTO offers (id,owner,title,category,cents,description,length_cm,weight_g,photos,created) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(offerId,user,...values,Date.now()).run()}
  else{const changed=await db.prepare('UPDATE offers SET title=?,category=?,cents=?,description=?,length_cm=?,weight_g=?,photos=?,version=version+1 WHERE id=? AND version=?').bind(...values,offerId,row.version).run();if(!changed.meta.changes)fail('changed',409)}
 }catch(e){if(fresh.length)await env.BUCKET.delete(fresh);throw e}
 const removed=oldPhotos.filter(k=>!retained.includes(k));if(removed.length)ctx.waitUntil(env.BUCKET.delete(removed));
 return response({id:offerId},create?201:200);
}
async function communityApi(request,env,ctx){try{return await handleCommunity(request,env,ctx)}catch(e){return response({error:e.status?e.message:'unavailable'},e.status||503)}}



// BigBenShop für das eigene WLAN. Neben index.html speichern und mit node server.js starten.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { randomBytes, createHash } = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const root = fs.existsSync(path.join(__dirname, 'index.html')) ? __dirname : path.join(__dirname, 'dist');
if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error('Bitte server.js in den entpackten Shopordner neben index.html legen.');
  process.exit(1);
}
const port = Number(process.env.PORT || 3000);
const folder = path.join(__dirname, '.bigben-daten');
fs.mkdirSync(folder, { recursive: true });
const db = new DatabaseSync(path.join(folder, 'community.sqlite'));
db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
db.exec(shopSchema);
db.exec(`CREATE TABLE IF NOT EXISTS sessions (digest TEXT PRIMARY KEY, member TEXT NOT NULL, admin INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE IF NOT EXISTS pictures (key TEXT PRIMARY KEY, data BLOB NOT NULL);`);

// Dieselben Angebote und Berechtigungen wie im gehosteten Shop, mit lokaler SQLite-Datenbank.
const env = {
  BIGBEN_ADMIN_EMAILS: 'admin@bigben.invalid',
  DB: {prepare(sql) {
    const statement = db.prepare(sql);
    return {bind(...values) {return {
      first: () => statement.get(...values),
      all: () => ({results: statement.all(...values)}),
      run: () => ({meta: statement.run(...values)})
    }}};
  }},
  BUCKET: {
    put(key, data) { db.prepare('INSERT INTO pictures VALUES (?, ?)').run(key, data); },
    get(key) { const row = db.prepare('SELECT data FROM pictures WHERE key=?').get(key); return row && {body: row.data}; },
    delete(keys) { for (const key of keys) db.prepare('DELETE FROM pictures WHERE key=?').run(key); }
  }
};
const adminCode = randomBytes(18).toString('hex');
const digest = token => createHash('sha256').update(token).digest('hex');
function browserSession(req, res) {
  const token = /(?:^|;\s*)bigben_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
  if (token) {
    const row = db.prepare('SELECT member, admin, digest FROM sessions WHERE digest=?').get(digest(token));
    if (row) return row;
  }
  const fresh = randomBytes(32).toString('hex');
  const session = {member: crypto.randomUUID(), admin: 0, digest: digest(fresh)};
  db.prepare('INSERT INTO sessions (digest, member) VALUES (?, ?)').run(session.digest, session.member);
  res.setHeader('Set-Cookie', 'bigben_session=' + fresh + '; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000');
  return session;
}
async function readBody(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Zu grosse Anfrage'), {status: 413});
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.svg':'image/svg+xml','.jpg':'image/jpeg','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
const assets = new Set(('index.html favicon.svg shop.css atlas.css bigben.css banner.css data.js species.js equipment.js equipment-credits.js credits.js measurements.js specs.js community.js shop.js commerce.js').split(' '));
function finish(res, status, type, content) {
  res.writeHead(status, {'Content-Type': type});
  res.end(content);
}
const app = http.createServer(async (req, res) => {
  try {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const origin = 'http://' + req.headers.host;
    const url = new URL(req.url, origin);
    if (url.origin !== origin) return finish(res, 400, 'text/plain', 'Ungültige Adresse');
    const get = req.method === 'GET' || req.method === 'HEAD';
    if (!get && req.headers.origin !== origin) return finish(res, 403, 'text/plain', 'Zugriff verweigert');
    if (url.pathname === '/verwaltung') {
      if (url.hostname !== 'localhost' || req.socket.remoteAddress !== '127.0.0.1') return finish(res, 403, 'text/plain', 'Nur am Server-PC über localhost.');
      res.setHeader('Cache-Control', 'no-store');
      if (req.method === 'GET') return finish(res, 200, mime['.html'], '<!doctype html><html lang="de"><meta charset="utf-8"><title>BigBenShop Verwaltung</title><h1>Verwaltung aktivieren</h1><form method="post"><label>Code aus dem Serverfenster <input type="password" name="code" required></label> <button>Aktivieren</button></form></html>');
      if (req.method !== 'POST') return finish(res, 405, 'text/plain', '');
      if (new URLSearchParams((await readBody(req, 512)).toString()).get('code') !== adminCode) return finish(res, 403, 'text/plain', 'Ungültiger Code');
      const session = browserSession(req, res);
      db.prepare('UPDATE sessions SET admin=1 WHERE digest=?').run(session.digest);
      res.writeHead(303, {Location: '/#community'}); return res.end();
    }
    if (url.pathname.startsWith('/api/')) {
      const session = browserSession(req, res);
      const headers = new Headers({'oai-authenticated-user-id': session.member});
      if (session.admin) headers.set('oai-authenticated-user-email', env.BIGBEN_ADMIN_EMAILS);
      for (const name of ['content-type','origin']) if (req.headers[name]) headers.set(name, req.headers[name]);
      const request = new Request(url, {method: req.method, headers, body: get ? undefined : await readBody(req, 2600000)});
      const reply = await communityApi(request, env, {waitUntil: job => Promise.resolve(job).catch(console.error)});
      res.writeHead(reply.status, Object.fromEntries(reply.headers));
      return res.end(Buffer.from(await reply.arrayBuffer()));
    }
    if (!get) return finish(res, 405, 'text/plain', '');
    const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const photo = /^(wildlife|equipment-photos)\/[\w-]+\.jpg$/.test(file);
    const font = /^fonts\/[\w.-]+\.(ttf|txt)$/.test(file);
    if (!assets.has(file) && !photo && !font) return finish(res, 404, 'text/plain', '');
    const data = await fs.promises.readFile(path.join(root, file));
    finish(res, 200, mime[path.extname(file)], req.method === 'HEAD' ? undefined : data);
  } catch (error) {
    const status = error.status || (error.code === 'ENOENT' ? 404 : 500);
    if (status === 500) console.error(error.message);
    finish(res, status, 'text/plain', 'Anfrage fehlgeschlagen');
  }
});
app.on('error', error => {console.error(error.code === 'EADDRINUSE' ? 'Der gewählte Port ist bereits belegt.' : error.message); process.exitCode = 1;});
app.listen(port, '0.0.0.0', () => {
  const active = app.address().port;
  console.log('Auf diesem Computer: http://localhost:' + active);
  for (const info of Object.values(os.networkInterfaces()).flat()) {
    if (info && info.family === 'IPv4' && !info.internal) console.log('Im selben WLAN: http://' + info.address + ':' + active);
  }
  console.log('Verwaltung am Server-PC: http://localhost:' + active + '/verwaltung');
  console.log('Persönlicher Verwaltungscode (nur für dich): ' + adminCode);
});
