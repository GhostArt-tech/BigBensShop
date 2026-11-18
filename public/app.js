'use strict';
const API = '/api/v1';
const $ = id => document.getElementById(id);
let catalog = [];
let user = null;
async function request(route, options = {}) {
  const response = await fetch(API + route, { credentials: 'same-origin', cache: 'no-store', ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Anfrage fehlgeschlagen.');
  return data;
}
function send(route, obj) { return request(route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }); }
function status(id, text, bad = false) { const el = $(id); el.textContent = text; el.classList.remove('hidden'); el.classList.toggle('error', bad); }
function node(tag, cls, content) { const e = document.createElement(tag); if (cls) e.className = cls; if (content !== undefined) e.textContent = content; return e; }
function safeImage(url) { return typeof url === 'string' && (/^\/images\/[a-z-]+\.svg$/.test(url) || /^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/[A-Za-z0-9_().%,-]+(?:\?width=\d+)?$/.test(url) || /^\/uploads\/[a-f0-9-]{36}\.(png|jpg|webp)$/.test(url)) ? url : '/images/fish-placeholder.svg'; }
function card(item, isOffer) {
  const article = node('article','card');
  const figure = node('div','card-img'); const img = document.createElement('img'); img.src = safeImage(item.imageUrl); img.alt = `Bild: ${isOffer ? item.title : item.name}`; img.loading='lazy'; figure.append(img);
  const body = node('div','card-body'); body.append(node('span','pill',item.category || 'Fisch'),node('h3','',isOffer ? item.title : item.name),node('p','',item.description));
  if (Number.isFinite(Number(item.priceCHF))) body.append(node('div','price',new Intl.NumberFormat('de-CH',{style:'currency',currency:'CHF'}).format(Number(item.priceCHF))));
  if (item.scientificName) body.append(node('p','latin',item.scientificName));
  if (item.imageNote && item.imageNote !== 'Artfoto') body.append(node('small','image-note',item.imageNote));
  if (item.imageCreditUrl) { const credit=node('a','credit','Fotoquelle / Lizenz ↗'); credit.href=item.imageCreditUrl; credit.target='_blank'; credit.rel='noopener noreferrer'; body.append(credit); }
  if (isOffer) {
    body.append(node('div','seller','Von '+item.sellerName));
    if (user && (user.id === item.sellerId || user.role === 'admin')) {
      const del=node('button','delete-offer','Angebot löschen'); del.type='button';
      del.addEventListener('click',()=>deleteOffer(item.id));body.append(del);
    }
  } else if (item.source === 'community') body.append(node('div','seller','Community-Artikel'));
  article.append(figure,body); return article;
}
function showCatalog() {
  const value = $('search').value.trim().toLowerCase(); const group = $('category-filter').value; const matching = catalog.filter(p => (!group || p.category === group) && (p.name + ' ' + p.description + ' ' + (p.category || '') + ' ' + (p.scientificName || '')).toLowerCase().includes(value));
  $('products').replaceChildren(...matching.map(p => card(p,false)));
  if (!matching.length) $('products').append(node('div','empty','Keine passenden Artikel gefunden.'));
  $('fish-count').textContent = String(catalog.length);
}
async function loadCatalog() { catalog = (await request('/products')).products; showCatalog(); }
async function deleteOffer(id) {
  if (!window.confirm('Dieses Angebot wirklich löschen?')) return;
  try { await request('/offers/' + id, { method:'DELETE' }); await Promise.all([loadCatalog(),loadOffers()]); status('account-message','Angebot wurde gelöscht.'); }
  catch(e) { status('account-message',e.message,true); location.hash='#konto'; }
}
async function loadOffers() { const offers = (await request('/offers')).offers; $('offers').replaceChildren(...offers.map(o => card(o,true))); if (!offers.length) $('offers').append(node('div','empty','Hier ist noch Platz für euer erstes Angebot. 🎣')); }
function renderUser() { $('account-line').textContent = user ? `Angemeldet als ${user.name} (${user.email}) · ${user.role === 'admin' ? 'Admin' : 'Mitglied'}` : 'Nicht angemeldet'; $('auth-panel').classList.toggle('hidden',!!user); $('logout').classList.toggle('hidden',!user); }
$('search').addEventListener('input',showCatalog);
$('category-filter').addEventListener('change',showCatalog);
$('refresh').addEventListener('click',async()=>{ try { await Promise.all([loadCatalog(),loadOffers()]); } catch(e){alert(e.message);} });
$('register-form').addEventListener('submit',async e=>{e.preventDefault();try{const result=await send('/auth/register',{name:$('reg-name').value,email:$('reg-email').value,password:$('reg-password').value});user=result.user;renderUser();await loadOffers();status('account-message','Registrierung erfolgreich!');}catch(err){status('account-message',err.message,true);}});
$('login-form').addEventListener('submit',async e=>{e.preventDefault();try{const result=await send('/auth/login',{email:$('login-email').value,password:$('login-password').value});user=result.user;renderUser();await loadOffers();status('account-message','Willkommen zurück!');}catch(err){status('account-message',err.message,true);}});
$('logout').addEventListener('click',async()=>{try{await send('/auth/logout',{});user=null;renderUser();await loadOffers();status('account-message','Abgemeldet.');}catch(e){status('account-message',e.message,true);}});
$('offer-image').addEventListener('change',()=>{const file=$('offer-image').files[0];const preview=$('image-preview');if(!file){preview.classList.add('hidden');preview.removeAttribute('src');return;}if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2*1024*1024){$('offer-image').value='';status('offer-message','Nur JPG, PNG oder WEBP bis 2 MB erlaubt.',true);return;}preview.src=URL.createObjectURL(file);preview.onload=()=>URL.revokeObjectURL(preview.src);preview.classList.remove('hidden');});
function fileDataUrl(file){return new Promise((resolve,reject)=>{if(!file)return resolve(null);const reader=new FileReader();reader.onerror=()=>reject(new Error('Bild konnte nicht gelesen werden.'));reader.onload=()=>resolve(reader.result);reader.readAsDataURL(file);});}
$('offer-form').addEventListener('submit',async e=>{e.preventDefault();if(!user){status('offer-message','Bitte melde dich zuerst unter „Mein Konto“ an.',true);return;}const button=e.currentTarget.querySelector('button[type="submit"]');button.disabled=true;try{const file=$('offer-image').files[0];if(file&&file.size>2*1024*1024)throw new Error('Bild zu gross (maximal 2 MB).');await send('/offers',{title:$('offer-title').value,category:$('offer-category').value,description:$('offer-description').value,priceCHF:Number($('offer-price').value),imageDataUrl:await fileDataUrl(file)});$('offer-form').reset();$('image-preview').classList.add('hidden');status('offer-message','Angebot veröffentlicht und in den Artikelstamm übernommen!');await Promise.all([loadCatalog(),loadOffers()]);}catch(err){status('offer-message',err.message,true);}finally{button.disabled=false;}});
const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}})},{threshold:.08}) : null;
document.querySelectorAll('.reveal').forEach(e=>observer?observer.observe(e):e.classList.add('visible'));
(async()=>{try{const [me,imprint,terms]=await Promise.all([request('/auth/me'),request('/legal/imprint'),request('/legal/terms')]);user=me.user;renderUser();$('imprint').textContent=imprint.content;$('terms').textContent=terms.content;await Promise.all([loadCatalog(),loadOffers()]);}catch(e){status('account-message','API-Fehler: '+e.message,true);}})();
