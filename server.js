'use strict';
// BigBenShop Lernprototyp – Node.js 20+, keine npm-Abhängigkeiten.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(crypto.scrypt);
const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const PUBLIC = path.join(ROOT, 'public');
const UPLOADS = path.join(DATA, 'uploads');
const DB = path.join(DATA, 'marketplace.json');
const PRODUCTS = path.join(DATA, 'products.json');
const LEGAL = path.join(DATA, 'legal.json');
const GROUPS = path.join(DATA, 'groups.json');
const PORT = Number(process.env.PORT || 3000);
// Sessions are stored as SHA-256 hashes in data/marketplace.json, so login survives restarts.
const tokenHash = token => crypto.createHash('sha256').update(token).digest('hex');
const loginAttempts = new Map();
let mutationQueue = Promise.resolve();
const catalogSeed = [
  {
    "id": "tier-1",
    "tierId": 1,
    "tiergruppeId": 1,
    "name": "Axolotl",
    "scientificName": "Ambystoma mexicanum",
    "category": "Amphibien",
    "description": "Lebt in Süsswasserkanälen in Xochimilco, Mexiko. Der Salamander hat aussenliegende Kiemen und lebt auch als erwachsenes Tier im Wasser.",
    "priceCHF": 52,
    "imageUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Ambystoma_mexicanum_photo.jpg?width=900",
    "imageCreditUrl": "https://commons.wikimedia.org/wiki/File:Ambystoma_mexicanum_photo.jpg",
    "imageNote": "Artfoto",
    "type": "tier",
    "source": "shop"
  },
  {
    "id": "tier-2",
    "tierId": 2,
    "tiergruppeId": 2,
    "name": "Tigerhai",
    "scientificName": "Galeocerdo cuvier",
    "category": "Knorpelfische",
    "description": "Lebt in tropischen und subtropischen Meeren, häufig in Küstennähe. Die dunklen Querstreifen junger Tiere verblassen mit dem Alter.",
    "priceCHF": 15000,
    "imageUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Galeocerdo_cuvier01.jpg?width=900",
    "imageCreditUrl": "https://commons.wikimedia.org/wiki/File:Galeocerdo_cuvier01.jpg",
    "imageNote": "Artfoto",
    "type": "tier",
    "source": "shop"
  },
  {
    "id": "tier-3",
    "tierId": 3,
    "tiergruppeId": 3,
    "name": "Blobfisch",
    "scientificName": "Psychrolutes microporos",
    "category": "Knochenfische",
    "description": "Lebt in der Tiefsee des Südwestpazifiks. Das bekannte Exemplar «Mr Blobby» wurde in über 1’000 Metern Tiefe gefangen.",
    "priceCHF": 2500,
    "imageUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Two_Psychrolutes_marcidus.jpg?width=900",
    "imageCreditUrl": "https://commons.wikimedia.org/wiki/File:Two_Psychrolutes_marcidus.jpg",
    "imageNote": "Foto einer verwandten Blobfisch-Art (Psychrolutes marcidus)",
    "type": "tier",
    "source": "shop"
  },
  {
    "id": "tier-4",
    "tierId": 4,
    "tiergruppeId": 3,
    "name": "Erbsenkugelfisch",
    "scientificName": "Carinotetraodon travancoricus",
    "category": "Knochenfische",
    "description": "Lebt in Süssgewässern in Südwestindien. Er ist ein kleiner Kugelfisch und frisst unter anderem kleine Schnecken.",
    "priceCHF": 16.49,
    "imageUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Carinotetraodon_travancoricus_by_OpenCage.jpg?width=900",
    "imageCreditUrl": "https://commons.wikimedia.org/wiki/File:Carinotetraodon_travancoricus_by_OpenCage.jpg",
    "imageNote": "Artfoto",
    "type": "tier",
    "source": "shop"
  },
  {
    "id": "tier-5",
    "tierId": 5,
    "tiergruppeId": 3,
    "name": "Laternenfisch",
    "scientificName": "Myctophum phengodes",
    "category": "Knochenfische",
    "description": "Lebt im offenen Meer und besitzt kleine Leuchtorgane am Körper.",
    "priceCHF": 350,
    "imageUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Scopelus_phengodes_from_Lütken_1892.jpg?width=900",
    "imageCreditUrl": "https://commons.wikimedia.org/wiki/File:Scopelus_phengodes_from_Lütken_1892.jpg",
    "imageNote": "Historische Artzeichnung, kein Foto",
    "type": "tier",
    "source": "shop"
  },
  {
    "id": "tier-6",
    "tierId": 6,
    "tiergruppeId": 3,
    "name": "Riemenfisch (Heringskönig)",
    "scientificName": "Regalecus glesne",
    "category": "Knochenfische",
    "description": "Lebt in tieferem Wasser im offenen Meer. Er hat einen langen, bandförmigen Körper und schwimmt mithilfe seiner langen Rückenflosse.",
    "priceCHF": 8000,
    "imageUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Regalecus_glesne_297924803.jpg?width=900",
    "imageCreditUrl": "https://commons.wikimedia.org/wiki/File:Regalecus_glesne_297924803.jpg",
    "imageNote": "Artfoto",
    "type": "tier",
    "source": "shop"
  },
  {
    "id": "tier-7",
    "tierId": 7,
    "tiergruppeId": 3,
    "name": "Atlantischer Blauflossen-Thunfisch",
    "scientificName": "Thunnus thynnus",
    "category": "Knochenfische",
    "description": "Lebt im Atlantik und im Mittelmeer. Er ist ein grosser Raubfisch, der weite Strecken im offenen Meer zurücklegt.",
    "priceCHF": 4500,
    "imageUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Thunnus_thynnus_2.jpg?width=900",
    "imageCreditUrl": "https://commons.wikimedia.org/wiki/File:Thunnus_thynnus_2.jpg",
    "imageNote": "Artfoto",
    "type": "tier",
    "source": "shop"
  },
  {
    "id": "tier-8",
    "tierId": 8,
    "tiergruppeId": 4,
    "name": "Gewöhnlicher Oktopus",
    "scientificName": "Octopus vulgaris",
    "category": "Kopffüsser",
    "description": "Lebt in Küstengewässern des östlichen Atlantiks und des Mittelmeers. Er hat acht Arme und kann seine Hautfarbe zur Tarnung ändern.",
    "priceCHF": 250,
    "imageUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Octopus-vulgaris-1.jpg?width=900",
    "imageCreditUrl": "https://commons.wikimedia.org/wiki/File:Octopus-vulgaris-1.jpg",
    "imageNote": "Artfoto",
    "type": "tier",
    "source": "shop"
  },
  {
    "id": "futter-1",
    "name": "Fischfutter – Flocken 100 g",
    "category": "Fischfutter",
    "description": "Trockenfutter für viele Zierfische. Musterartikel für den Shop.",
    "priceCHF": 9.9,
    "imageUrl": "/images/fish-placeholder.svg",
    "type": "futter",
    "source": "shop"
  },
  {
    "id": "futter-2",
    "name": "Fischfutter – Granulat 250 g",
    "category": "Fischfutter",
    "description": "Granulat für Aquarienfische. Musterartikel für den Shop.",
    "priceCHF": 17.5,
    "imageUrl": "/images/fish-placeholder.svg",
    "type": "futter",
    "source": "shop"
  }
];
const groupsSeed = [{"id": 1, "name": "Amphibien"}, {"id": 2, "name": "Knorpelfische"}, {"id": 3, "name": "Knochenfische"}, {"id": 4, "name": "Kopffüsser"}];
const legalSeed = {
  imprint: 'MUSTERIMPRESSUM – Vor Veröffentlichung mit den tatsächlichen Betreiberangaben (Firma/Name, Adresse, Kontakt und weiteren Pflichtangaben) ersetzen.',
  terms: 'MUSTER-AGB – Dies ist nur ein Platzhalter. Vor echtem Betrieb rechtlich prüfen lassen.'
};
async function readJsonFile(filename) { return JSON.parse(await fs.readFile(filename, 'utf8')); }
async function ensureFile(filename, contents) {
  try { await fs.access(filename); }
  catch (e) {
    if (e.code !== 'ENOENT') throw e;
    await fs.writeFile(filename, JSON.stringify(contents, null, 2) + '\n', { flag: 'wx' });
  }
}
async function initialize() {
  await fs.mkdir(UPLOADS, { recursive: true });
  let oldDb = {};
  try { oldDb = await readJsonFile(DB); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  await ensureFile(PRODUCTS, Array.isArray(oldDb.products) && oldDb.products.length ? oldDb.products : catalogSeed);
  await ensureFile(LEGAL, oldDb.legal || legalSeed);
  await ensureFile(GROUPS, groupsSeed);
  await ensureFile(DB, { users: [], offers: [], sessions: [] });
}
function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(value));
}
function fail(res, status, error) { json(res, status, { error }); }
async function bodyJson(req, max = 16000) {
  let length = 0; const buffers = [];
  for await (const chunk of req) { length += chunk.length; if (length > max) { const e = new Error('Anfrage zu gross.'); e.status = 413; throw e; } buffers.push(chunk); }
  try { return JSON.parse(Buffer.concat(buffers).toString('utf8')); }
  catch { const e = new Error('Ungültige JSON-Daten.'); e.status = 400; throw e; }
}
function clean(value, max) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }
function publicUser(user) { return { id: user.id, name: user.name, email: user.email, role: user.role || 'user' }; }
function cookieToken(req) { return (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('bbs_session='))?.slice(12) || null; }
async function userFromRequest(req) {
  const token = cookieToken(req); if (!token) return null;
  const db = await readJsonFile(DB);
  const session = (db.sessions || []).find(s => s.tokenHash === tokenHash(token) && s.expires > Date.now());
  if (!session) return null;
  return (db.users || []).find(u => u.id === session.userId) || null;
}
function setCookie(res, token, maxAge) {
  const secure = process.env.COOKIE_SECURE === 'true' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `bbs_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`);
}
async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}
async function matchPassword(password, value) {
  if (typeof value !== 'string' || !value.includes(':')) return false;
  const [salt, hex] = value.split(':'); const actual = await scrypt(password, salt, 64); const expected = Buffer.from(hex, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
async function login(res, user) {
  const token = crypto.randomBytes(32).toString('hex');
  await mutate(db => { db.sessions ||= []; db.sessions = db.sessions.filter(s => s.expires > Date.now()); db.sessions.push({ tokenHash: tokenHash(token), userId: user.id, expires: Date.now() + 7 * 86400000 }); });
  setCookie(res, token, 7 * 86400);
  json(res, 200, { user: publicUser(user) });
}
// Mutations are serialized and read the JSON fresh, so we don't overwrite data cached at startup.
function mutate(callback) {
  const transaction = mutationQueue.catch(() => {}).then(async () => {
    const db = await readJsonFile(DB);
    if (!Array.isArray(db.users)) db.users = [];
    if (!Array.isArray(db.offers)) db.offers = [];
    if (!Array.isArray(db.sessions)) db.sessions = [];
    const result = await callback(db);
    const tmp = DB + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(db, null, 2) + '\n');
    await fs.rename(tmp, DB);
    return result;
  });
  mutationQueue = transaction;
  return transaction;
}
function decodeImage(dataUrl) {
  if (!dataUrl) return null;
  if (typeof dataUrl !== 'string') { const e = new Error('Ungültiges Bild.'); e.status = 400; throw e; }
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match) { const e = new Error('Nur PNG, JPG oder WEBP erlaubt.'); e.status = 400; throw e; }
  const raw = Buffer.from(match[2], 'base64');
  if (!raw.length || raw.length > 2 * 1024 * 1024) { const e = new Error('Bild muss kleiner als 2 MB sein.'); e.status = 413; throw e; }
  const png = raw.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpg = raw[0] === 255 && raw[1] === 216 && raw[2] === 255;
  const webp = raw.toString('ascii', 0, 4) === 'RIFF' && raw.toString('ascii', 8, 12) === 'WEBP';
  if (!({ png, jpeg: jpg, webp })[match[1]]) { const e = new Error('Bildformat stimmt nicht mit dem Inhalt überein.'); e.status = 400; throw e; }
  return { raw, extension: match[1] === 'jpeg' ? 'jpg' : match[1] };
}
function offerPublic(o) {
  return { id: o.id, productId: o.productId || `user-${o.id}`, title: o.title, description: o.description, category: o.category || 'Angebot', priceCHF: o.priceCHF, imageUrl: o.imageUrl || null, sellerName: o.sellerName, createdAt: o.createdAt, sellerId: o.sellerId }; 
}
async function api(req, res, pathname) {
  const method = req.method;
  if (method === 'GET' && pathname === '/api/v1/groups') { return json(res, 200, { groups: await readJsonFile(GROUPS) }); }
  if (method === 'GET' && pathname === '/api/v1/products') {
    const catalog = await readJsonFile(PRODUCTS); const db = await readJsonFile(DB);
    if (!Array.isArray(catalog)) return fail(res, 500, 'products.json muss eine JSON-Liste sein.');
    const additions = (db.offers || []).map(o => ({ id: `user-${o.id}`, name: o.title, category: o.category || 'Angebot', description: o.description, imageUrl: o.imageUrl || null, priceCHF: o.priceCHF, type: 'community', source: 'community', offerId: o.id }));
    return json(res, 200, { products: [...catalog, ...additions] });
  }
  if (method === 'GET' && (pathname === '/api/v1/legal/imprint' || pathname === '/api/v1/legal/terms')) {
    const legal = await readJsonFile(LEGAL); return json(res, 200, { content: pathname.endsWith('imprint') ? legal.imprint : legal.terms });
  }
  if (method === 'GET' && pathname === '/api/v1/offers') {
    const db = await readJsonFile(DB); return json(res, 200, { offers: (db.offers || []).map(offerPublic).reverse() });
  }
  if (method === 'GET' && pathname === '/api/v1/auth/me') {
    const user = await userFromRequest(req); return json(res, 200, { user: user ? publicUser(user) : null });
  }
  if (method === 'POST' && pathname === '/api/v1/auth/register') {
    const input = await bodyJson(req); const name = clean(input.name, 60); const email = clean(input.email, 254).toLowerCase(); const password = input.password;
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 12 || password.length > 200) return fail(res, 400, 'Bitte Namen, gültige E-Mail und Passwort (mind. 12 Zeichen) eingeben.');
    const hash = await hashPassword(password);
    let result;
    try { result = await mutate(db => {
      if (db.users.some(u => u.email === email)) { const e = new Error('Diese E-Mail ist bereits registriert.'); e.status = 409; throw e; }
      const user = { id: crypto.randomUUID(), name, email, passwordHash: hash }; db.users.push(user); return user;
    }); } catch (e) { if (e.status) return fail(res, e.status, e.message); throw e; }
    return await login(res, result);
  }
  if (method === 'POST' && pathname === '/api/v1/auth/login') {
    const input = await bodyJson(req); const email = clean(input.email, 254).toLowerCase(); const key = req.socket.remoteAddress + ':' + email; const attempt = loginAttempts.get(key);
    if (attempt && attempt.until > Date.now() && attempt.count >= 6) return fail(res, 429, 'Zu viele Login-Versuche. Bitte später erneut versuchen.');
    const db = await readJsonFile(DB); const user = (db.users || []).find(u => u.email === email);
    const valid = user && typeof input.password === 'string' && await matchPassword(input.password, user.passwordHash);
    if (!valid) { loginAttempts.set(key, { count: (attempt?.until > Date.now() ? attempt.count : 0) + 1, until: Date.now() + 15 * 60000 }); return fail(res, 401, 'E-Mail oder Passwort falsch.'); }
    loginAttempts.delete(key); return await login(res, user);
  }
  if (method === 'POST' && pathname === '/api/v1/auth/logout') {
    const token = cookieToken(req); if (token) await mutate(db => { db.sessions = db.sessions.filter(s => s.tokenHash !== tokenHash(token)); }); setCookie(res, '', 0); return json(res, 200, { ok: true });
  }
  const deleteMatch = /^\/api\/v1\/offers\/([a-f0-9-]{36})$/.exec(pathname);
  if (method === 'DELETE' && deleteMatch) {
    const user = await userFromRequest(req); if (!user) return fail(res, 401, 'Bitte anmelden.');
    let result;
    try { result = await mutate(db => {
      const offer = db.offers.find(o => o.id === deleteMatch[1]);
      if (!offer) { const e = new Error('Angebot nicht gefunden.'); e.status = 404; throw e; }
      if (offer.sellerId !== user.id && user.role !== 'admin') { const e = new Error('Nur Verkäufer oder Admin dürfen löschen.'); e.status = 403; throw e; }
      db.offers = db.offers.filter(o => o.id !== offer.id);
      return offer;
    }); } catch(e) { if(e.status) return fail(res,e.status,e.message); throw e; }
    if (typeof result.imageUrl === 'string' && /^\/uploads\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(result.imageUrl)) await fs.unlink(path.join(UPLOADS, path.basename(result.imageUrl))).catch(() => {});
    return json(res, 200, { ok: true });
  }
  if (method === 'POST' && pathname === '/api/v1/offers') {
    const user = await userFromRequest(req); if (!user) return fail(res, 401, 'Bitte zuerst anmelden.');
    const input = await bodyJson(req, 3 * 1024 * 1024); const title = clean(input.title, 100); const description = clean(input.description, 1500); const category = clean(input.category, 50) || 'Süsswasser'; const price = Number(input.priceCHF);
    if (title.length < 3 || description.length < 5 || !Number.isFinite(price) || price <= 0 || price > 100000 || Math.abs(Math.round(price * 100) - price * 100) > 1e-6) return fail(res, 400, 'Titel (mind. 3 Zeichen), Beschreibung und gültigen Preis eingeben.');
    const image = decodeImage(input.imageDataUrl);
    const id = crypto.randomUUID(); const imageName = image ? `${id}.${image.extension}` : null;
    if (image) await fs.writeFile(path.join(UPLOADS, imageName), image.raw, { flag: 'wx' });
    const offer = { id, productId: `user-${id}`, title, description, category, priceCHF: price, imageUrl: imageName ? `/uploads/${imageName}` : null, sellerId: user.id, sellerName: user.name, createdAt: new Date().toISOString() };
    try { await mutate(db => { db.offers.push(offer); }); }
    catch (e) { if (imageName) await fs.unlink(path.join(UPLOADS, imageName)).catch(() => {}); throw e; }
    return json(res, 201, { offer: offerPublic(offer) });
  }
  return fail(res, 404, 'API-Endpunkt nicht gefunden.');
}
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
async function staticFile(req, res, pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return fail(res, 405, 'Methode nicht erlaubt.');
  let filename;
  if (pathname.startsWith('/uploads/')) {
    const name = pathname.slice('/uploads/'.length);
    if (!/^[a-f0-9-]{36}\.(png|jpg|webp)$/.test(name)) return fail(res, 404, 'Nicht gefunden.');
    filename = path.join(UPLOADS, name);
  } else {
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!/^(index\.html|styles\.css|app\.js|images\/[a-z-]+\.svg)$/.test(relative)) return fail(res, 404, 'Nicht gefunden.');
    filename = path.join(PUBLIC, relative);
  }
  try {
    const content = await fs.readFile(filename); const type = mime[path.extname(filename)];
    const headers = { 'Content-Type': type || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
    if (type?.startsWith('text/html')) headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob: https://commons.wikimedia.org https://upload.wikimedia.org https://*.wikimedia.org; object-src 'none'; base-uri 'self'; frame-ancestors 'none'";
    res.writeHead(200, headers); res.end(req.method === 'HEAD' ? undefined : content);
  } catch (e) { if (e.code === 'ENOENT') return fail(res, 404, 'Datei nicht gefunden.'); throw e; }
}
initialize().then(() => {
  http.createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (pathname.startsWith('/api/')) return await api(req, res, pathname);
      return await staticFile(req, res, pathname);
    } catch (e) {
      console.error(e);
      return fail(res, e.status || 500, e.status ? e.message : 'Serverfehler. Prüfe die JSON-Dateien auf gültige Syntax.');
    }
  }).listen(PORT, () => console.log(`BigBenShop läuft auf http://localhost:${PORT}`));
}).catch(e => { console.error(e); process.exitCode = 1; });
