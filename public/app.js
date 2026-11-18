'use strict';

const API = '/api/v1';
const $ = id => document.getElementById(id);
const currency = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' });
let catalog = [];
let groups = [];
let user = null;
let selectedType = 'all';

// Alle Formulare und Ansichten nutzen dieselbe API. Der Browser sendet das Sitzungscookie automatisch mit.
async function request(route, options = {}) {
  const response = await fetch(API + route, { credentials: 'same-origin', cache: 'no-store', ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Anfrage fehlgeschlagen.');
  return data;
}

function send(route, data) {
  return request(route, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

function status(id, text, bad = false) {
  const el = $(id);
  el.textContent = text;
  el.classList.remove('hidden');
  el.classList.toggle('error', bad);
}

// Das Einfügen als Text sorgt dafür, dass auch frei eingegebene Angebotstitel reiner Text bleiben.
function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

const placeholder = '/images/fish-placeholder.svg';
function safeImage(url) {
  if (typeof url !== 'string') return placeholder;
  if (/^\/images\/[A-Za-z0-9_-]+\.(svg|png|jpe?g|webp)$/.test(url) ||
      /^\/uploads\/[a-f0-9-]{36}(?:-[1-3])?\.(png|jpg|webp)$/.test(url)) return url;
  try {
    const remote = new URL(url);
    if (remote.protocol === 'https:' && ['commons.wikimedia.org', 'upload.wikimedia.org'].includes(remote.hostname)) return remote.href;
  } catch { /* Bei einer unvollständigen Adresse erscheint das Ersatzbild. */ }
  return placeholder;
}
// Die erste Aufnahme ist das Titelbild. Der Galerieknopf wechselt durch alle hochgeladenen Fotos.
function picture(item, title) {
  const figure = node('div', 'card-img');
  const urls = item.imageUrls?.length ? item.imageUrls : [item.imageUrl];
  const img = node('img');
  img.loading = 'lazy';
  let index = 0;
  function show() {
    img.alt = (item.imageNote && item.imageNote !== 'Artfoto' ? title + ' – ' + item.imageNote : title) + (urls.length > 1 ? ' · Bild ' + (index + 1) + ' von ' + urls.length : '');
    img.src = safeImage(urls[index]);
  }
  img.addEventListener('error', () => {
    if (img.getAttribute('src') !== placeholder) img.src = placeholder;
  });
  show();
  figure.append(img);
  if (urls.length > 1) {
    const next = node('button', 'next-photo');
    next.type = 'button';
    next.textContent = '1 / ' + urls.length + ' →';
    next.setAttribute('aria-label', 'Nächstes Bild von ' + title);
    next.addEventListener('click', () => {
      index = (index + 1) % urls.length;
      show();
      next.textContent = (index + 1) + ' / ' + urls.length + ' →';
    });
    figure.append(next);
  }
  return figure;
}

function priceText(item) {
  if (item.priceCHF == null || item.priceCHF === '' || !Number.isFinite(Number(item.priceCHF))) return '';
  return currency.format(Number(item.priceCHF));
}

function sourceLink(label, href) {
  const link = node('a', 'credit', label);
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

// Ein nativer Dialog übernimmt Fokus und Escape-Taste. Die Detailansicht zeigt auch das unbeschnittene Bild.
const motionSetting = window.matchMedia('(prefers-reduced-motion: reduce)');
const detailDialog = $('item-dialog');
let detailMotion;
motionSetting.addEventListener('change', () => {
  if (motionSetting.matches) detailMotion?.cancel();
});
detailDialog.addEventListener('close', () => {
  if (!detailDialog.open) detailMotion?.cancel();
});

function showDetail(item, title, sourceCard) {
  const text = node('div', 'dialog-copy');
  const heading = node('h2', '', title);
  heading.id = 'detail-title';
  text.append(heading);
  if (item.scientificName) text.append(node('p', 'latin', item.scientificName));
  text.append(node('p', 'detail-description', item.description), node('strong', 'price', priceText(item)));
  if (item.sellerName) text.append(node('p', 'seller', 'Angeboten von ' + item.sellerName));
  if (item.imageNote && item.imageNote !== 'Artfoto') text.append(node('p', 'image-note', item.imageNote));
  if (typeof item.imageCreditUrl === 'string' && /^https?:\/\//i.test(item.imageCreditUrl)) {
    const label = item.imageAuthor ? 'Foto: ' + item.imageAuthor : 'Fotoquelle';
    text.append(sourceLink(label + ' ↗', item.imageCreditUrl));
    if (item.imageLicense && /^https?:\/\//i.test(item.imageLicenseUrl || '')) {
      text.append(' · ', sourceLink(item.imageLicense, item.imageLicenseUrl));
    }
  }
  $('detail-content').replaceChildren(picture(item, title), text);
  const dialog = detailDialog;
  detailMotion?.cancel();
  const start = sourceCard.getBoundingClientRect();
  dialog.showModal();

  // Erst der offene Dialog hat eine messbare Grösse. Aus beiden Rechtecken berechnen
  // wir die Startposition: Das Detailfenster wächst aus der angeklickten Karte.
  if (!motionSetting.matches && dialog.animate) {
    const end = dialog.getBoundingClientRect();
    const dx = start.left - end.left;
    const dy = start.top - end.top;
    detailMotion = dialog.animate([
      { transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${start.width / end.width}, ${start.height / end.height})`, opacity: .35 },
      { transformOrigin: 'top left', transform: 'none', opacity: 1 }
    ], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
}

function card(item, isOffer) {
  const title = isOffer ? item.title : item.name;
  const article = node('article', 'card');
  const figure = picture(item, title);
  figure.append(node('span', 'pill', item.category || 'Angebot'));
  const body = node('div', 'card-body');
  body.append(node('h3', '', title));
  if (item.scientificName) body.append(node('p', 'latin', item.scientificName));
  if (item.imageNote && item.imageNote !== 'Artfoto') body.append(node('p', 'image-note', item.imageNote));
  if (isOffer) body.append(node('p', 'seller', 'Von ' + item.sellerName));
  else if (item.source === 'community') body.append(node('p', 'seller', 'Community-Angebot'));
  const foot = node('div', 'card-foot');
  const details = node('button', 'details-button', 'Details ↗');
  details.type = 'button';
  details.setAttribute('aria-label', title + ' – Details anzeigen');
  details.addEventListener('click', () => showDetail(item, title, article));
  foot.append(node('span', 'price', priceText(item)), details);
  body.append(foot);
  if (isOffer && user && (user.id === item.sellerId || user.role === 'admin')) {
    const remove = node('button', 'delete-offer', 'Angebot löschen');
    remove.type = 'button';
    remove.addEventListener('click', () => deleteOffer(item.id));
    body.append(remove);
  }
  article.append(figure, body);
  return article;
}

// Überschriften tauchen beim ersten Eintritt in den sichtbaren Bereich auf.
// Ohne Observer und bei reduzierter Bewegung bleibt der Inhalt direkt lesbar.
if ('IntersectionObserver' in window) {
  const sections = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!motionSetting.matches) entry.target.classList.add('is-arriving');
      sections.unobserve(entry.target);
    }
  }, { threshold: 0 });
  for (const section of document.querySelectorAll('main .section')) sections.observe(section);
}

// Suchtext, Artikeltyp und JSON-Kategorie wirken zusammen auf denselben Katalog.
function showCatalog() {
  const query = $('search').value.trim().toLowerCase();
  const category = $('category-filter').value;
  const group = groups.find(g => g.name === category);
  const matching = catalog.filter(item => {
    const type = item.type || (item.source === 'community' ? 'community' : 'tier');
    const inCategory = !category || item.category === category || (group && String(group.id) === String(item.tiergruppeId));
    const words = [item.name, item.description, item.category, item.scientificName].join(' ').toLowerCase();
    // Ein privates Ruten- oder Futterangebot erscheint sowohl im Fachfilter als auch unter Community.
    const inType = selectedType === 'all' || selectedType === type ||
      (selectedType === 'angeln' && ['Angelruten', 'Angelzubehör'].includes(item.category)) ||
      (selectedType === 'futter' && item.category === 'Fischfutter');
    return inType && inCategory && words.includes(query);
  });
  $('products').replaceChildren(...matching.map(item => card(item, false)));
  if (!matching.length) $('products').append(node('p', 'empty', 'Keine passenden Artikel gefunden.'));
  $('fish-count').textContent = matching.length + ' von ' + catalog.length + ' Artikeln';
}

function renderCategories() {
  const filter = $('category-filter');
  const previous = filter.value;
  const categories = new Set([...groups.map(g => g.name), ...catalog.map(p => p.category).filter(Boolean)]);
  filter.replaceChildren(new Option('Alle Kategorien', ''), ...Array.from(categories, name => new Option(name, name)));
  if (categories.has(previous)) filter.value = previous;
}
// Späte Antworten werden verworfen. Unverändertes JSON lässt Filter, Fokus und Fotogalerien in Ruhe.
function liveResource(route, messageId, render) {
  let latest = 0;
  let lastContent;
  return async function load(force = false) {
    const sequence = ++latest;
    try {
      const data = await request(route);
      if (sequence !== latest) return;
      const content = JSON.stringify(data);
      if (force || content !== lastContent) {
        render(data);
        lastContent = content;
      }
      $(messageId).textContent = '';
    } catch (error) {
      if (sequence === latest) $(messageId).textContent = error.message;
    }
  };
}
const loadCatalog = liveResource('/products', 'catalog-error', data => {
  catalog = data.products;
  renderCategories();
  showCatalog();
});
const loadGroups = liveResource('/groups', 'group-error', data => {
  groups = data.groups;
  renderCategories();
  showCatalog();
});

const loadOffers = liveResource('/offers', 'offers-error', ({ offers }) => {
  const grid = $('offers');
  grid.replaceChildren(...offers.map(offer => card(offer, true)));
  if (!offers.length) {
    const message = node('div', 'empty', 'Noch keine Angebote online.');
    const link = node('a', '', 'Erstes Angebot erstellen ↗');
    link.href = '#anbieten';
    message.append(link);
    grid.append(message);
  }
});
const loadImprint = liveResource('/legal/imprint', 'imprint-error', data => { $('imprint').textContent = data.content; });
const loadTerms = liveResource('/legal/terms', 'terms-error', data => { $('terms').textContent = data.content; });

async function deleteOffer(id) {
  if (!window.confirm('Dieses Angebot wirklich löschen?')) return;
  try {
    await request('/offers/' + id, { method: 'DELETE' });
    await Promise.all([loadCatalog(), loadOffers()]);
    status('account-message', 'Angebot wurde gelöscht.');
  } catch (error) {
    status('account-message', error.message, true);
    location.hash = '#konto';
  }
}

// Der Abgleich pausiert in unsichtbaren Tabs. Formulare behalten dabei ihren Entwurf.
let refreshing = false;
async function refreshShop() {
  if (refreshing) return;
  refreshing = true;
  try { await Promise.all([loadCatalog(), loadGroups(), loadOffers(), loadImprint(), loadTerms()]); }
  finally { refreshing = false; }
}

$('search').addEventListener('input', showCatalog);
$('category-filter').addEventListener('change', showCatalog);
const typeButtons = document.querySelectorAll('[data-type]');
for (const button of typeButtons) {
  button.addEventListener('click', () => {
    selectedType = button.dataset.type;
    for (const other of typeButtons) other.setAttribute('aria-pressed', String(other === button));
    showCatalog();
  });
}
$('refresh').addEventListener('click', refreshShop);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshShop(); });
window.setInterval(() => { if (!document.hidden) refreshShop(); }, 5000);

// Nach dem Anmelden werden die Kontodaten und die Lösch-Schaltflächen für eigene Angebote aktualisiert.
function renderUser() {
  $('account-line').textContent = user
    ? 'Angemeldet als ' + user.name + ' (' + user.email + ') · ' + (user.role === 'admin' ? 'Admin' : 'Mitglied')
    : 'Nicht angemeldet';
  $('auth-panel').classList.toggle('hidden', Boolean(user));
  $('logout').classList.toggle('hidden', !user);
}
async function authenticate(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const registering = form.id === 'register-form';
  const prefix = registering ? 'reg-' : 'login-';
  const data = { email: $(prefix + 'email').value, password: $(prefix + 'password').value };
  if (registering) data.name = $('reg-name').value;
  try {
    const result = await send(registering ? '/auth/register' : '/auth/login', data);
    form.reset();
    user = result.user;
    renderUser();
    await loadOffers(true);
    status('account-message', registering ? 'Registrierung erfolgreich!' : 'Willkommen zurück!');
  } catch (error) { status('account-message', error.message, true); }
}
$('register-form').addEventListener('submit', authenticate);
$('login-form').addEventListener('submit', authenticate);
$('logout').addEventListener('click', async () => {
  try {
    await send('/auth/logout', {});
    user = null;
    renderUser();
    await loadOffers(true);
    status('account-message', 'Abgemeldet.');
  } catch (error) { status('account-message', error.message, true); }
});

// Für die Vorschau genügt eine kurzlebige lokale URL. Beim Wechsel geben wir den belegten Speicher frei.
const selectedImages = () => Array.from($('offer-image').files);
function clearPreviews() {
  const preview = $('image-preview');
  for (const img of preview.children) URL.revokeObjectURL(img.src);
  preview.replaceChildren();
}
$('offer-image').addEventListener('change', () => {
  clearPreviews();
  const files = selectedImages();
  if (files.length > 4 || files.some(file => !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024)) {
    $('offer-image').value = '';
    status('offer-message', 'Bis zu vier JPG-, PNG- oder WEBP-Bilder mit je maximal 2 MB auswählen.', true);
    return;
  }
  $('offer-message').classList.add('hidden');
  for (const file of files) {
    const img = node('img', 'preview');
    img.src = URL.createObjectURL(file);
    img.alt = file.name;
    $('image-preview').append(img);
  }
});

// Erst beim Absenden werden die Fotos in das JSON-Format für die Angebots-API umgewandelt.
function fileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Bild konnte nicht gelesen werden.'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
$('offer-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!user) {
    status('offer-message', 'Bitte melde dich zuerst unter „Mein Konto“ an.', true);
    return;
  }
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await send('/offers', {
      title: $('offer-title').value,
      category: $('offer-category').value,
      description: $('offer-description').value,
      priceCHF: Number($('offer-price').value),
      imageDataUrls: await Promise.all(selectedImages().map(fileDataUrl))
    });
    form.reset();
    clearPreviews();
    status('offer-message', 'Dein Angebot ist jetzt im Marktplatz und im Katalog sichtbar.');
    await Promise.all([loadCatalog(), loadOffers()]);
  } catch (error) {
    status('offer-message', error.message, true);
  } finally {
    button.disabled = false;
  }
});

document.querySelector('.photo-caption').addEventListener('click', () => { $('bildnachweise').open = true; });
refreshShop();
request('/auth/me').then(async me => {
  user = me.user;
  renderUser();
  if (user) await loadOffers(true);
}).catch(error => status('account-message', error.message, true));
