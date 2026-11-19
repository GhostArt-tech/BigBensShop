
const $=s=>document.querySelector(s);
const textHome=()=>tr('Startseite','Accueil','Home');

const shopTitle=()=>tr('Alle Tierarten','Toutes les espèces','All species');
const wishlist=()=>tr('Merkliste','Favoris','Wishlist');
const account=()=>tr('Kundenkonto','Mon compte','Account');
const basket=()=>tr('Warenkorb','Panier','Basket');
const label=(s,control)=>`<label>${s}${control}</label>`;
const input=(name,type='text',value='',extra='required')=>`<input name="${name}" type="${type}" value="${esc(value)}" ${extra}>`;
const opt=(x,name,chosen)=>`<option value="${esc(x)}" ${String(x)===String(chosen)?'selected':''}>${esc(name)}</option>`;
const button=(a,title,cls='secondary',ico='')=>`<button type="button" class="${cls}" data-act="${esc(a)}">${ico?ic(ico,18):''}${title}</button>`;
const link=(dest,title,cls='')=>`<a href="#${dest}" class="${cls}">${title}</a>`;
const iconBtn=(a,title,icon,count='')=>`<button type="button" class="icon" data-act="${a}" title="${title}" aria-label="${title}">${ic(icon)}${count?`<b class="count">${count}</b>`:''}</button>`;
function go(path){if(location.hash==='#'+path)render();else location.hash=path}
function closePanel(){if($('#dialog').open)$('#dialog').close()}
function panel(html){$('#panel').innerHTML=html;if(!$('#dialog').open)$('#dialog').showModal()}
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),2700)}

const groupsTitle=()=>tr('Tiergruppen','Groupes zoologiques','Animal groups');
const galleryTitle=()=>tr('Tierkatalog','Catalogue des espèces','Species catalogue');
const creditTitle=()=>tr('Bildnachweise','Crédits photographiques','Photo credits');
const perAnimal=()=>tr('pro Tier','par animal','per animal');
const groupsNav=()=>link('produkte',equipmentTitle())+link('community','Community')+link('groups',groupsTitle())+link('overview',tr('Artenübersicht','Tableau des espèces','Species index'));
const taxLabels=()=>({id:tr('Tier-ID','ID espèce','Species ID'),gid:tr('Gruppen-ID','ID groupe','Group ID'),group:tr('Tiergruppe','Groupe zoologique','Animal group'),scientific:tr('Wissenschaftlicher Name','Nom scientifique','Scientific name'),habitat:tr('Lebensraum','Habitat','Habitat'),description:tr('Lebensraum und Merkmale','Habitat et caractéristiques','Habitat and characteristics')});
function header(){
 $('#header').innerHTML=`<div class="atlasbar"><div class="wrap"><span><i></i>${tr('Interaktiver Demoshop','Boutique de démonstration','Interactive demo shop')}</span><span>${tr('Schweiz','Suisse','Switzerland')} <b>·</b> CHF</span></div></div><div class="nav wrap">${logo()}<nav aria-label="Menu">${groupsNav()}</nav><div class="tools">${iconBtn('search',tr('Suchen','Rechercher','Search'),'search')}${iconBtn('wish',wishlist(),'heart')}${iconBtn('account',account(),'user')}<i></i>${iconBtn('cart',basket(),'bag',String(cart().reduce((s,c)=>s+c.qty,0)))}<span class="mob-menu">${iconBtn('menu',tr('Menü','Menu','Menu'),'menu')}</span></div></div><nav class="mobileCollections" aria-label="${tr('Sortimente','Collections','Collections')}">${link('produkte',equipmentTitle())}${link('community','Community')}</nav>`;
}

const portraits=[
 {id:2,title:[['Unter der','Oberfläche.'],['Sous la','surface.'],['Beneath the','surface.']]},
 {id:1,title:[['Leben im','Süsswasser.'],['La vie en','eau douce.'],['Life in','freshwater.']]},
 {id:8,title:[['Die Kunst der','Tarnung.'],['L’art du','camouflage.'],['The art of','camouflage.']]}
];
let portraitIndex=0,portraitTimer=0,portraitObserver=null,portraitVisible=false;
const motionSetting=window.matchMedia?.('(prefers-reduced-motion: reduce)');
let portraitPaused=!!motionSetting?.matches;
function portraitPanel(entry,index){
 const species=speciesById(entry.id),name=tx(species.names),[line,accent]=entry.title[langs.indexOf(lang)],active=index===portraitIndex;
 return `<div class="portraitFrame portrait-${entry.id}${active?' is-current':''}" data-portrait="${index}" aria-hidden="${!active}" ${active?'':'inert'}><img class="portraitPhoto" src="wildlife/${entry.id}.jpg" alt="${esc(name)}" ${active?'fetchpriority="high"':'decoding="async"'}><div class="portraitVeil"></div><div class="wrap portraitInner"><div class="portraitCopy"><div class="kicker light">${esc(tx(groupById(species.groupId).names))}</div><h2><span>${esc(line)}</span> <em>${esc(accent)}</em></h2>${link('product/tier-'+entry.id,esc(name)+' · '+tr('Zum Steckbrief','Voir la fiche','View profile'),'portraitLink')}</div><div class="portraitCaption"><strong>${esc(name)}</strong><em>${esc(species.latin)}</em></div></div></div>`;
}
function portraitPlayLabel(){return portraitPaused?tr('Bildwechsel starten','Démarrer le diaporama','Start slideshow'):tr('Bildwechsel pausieren','Mettre en pause','Pause slideshow')}
function portraitPlayIcon(){return portraitPaused?'▶':'❚❚'}
function hero(){return `<section class="portraitBanner" aria-label="${tr('Tierporträts','Portraits d’espèces','Species portraits')}"><div class="portraitStage">${portraits.map(portraitPanel).join('')}</div><div class="portraitStrip"><div class="wrap portraitControls"><div class="portraitTabs">${portraits.map((p,i)=>`<button type="button" data-act="portrait:${i}" aria-pressed="${i===portraitIndex}"><img src="wildlife/${p.id}.jpg" alt=""><span>${esc(tx(speciesById(p.id).names))}</span></button>`).join('')}</div><button type="button" class="portraitPlay" data-act="portraitPlay" title="${portraitPlayLabel()}" aria-label="${portraitPlayLabel()}">${portraitPlayIcon()}</button></div></div></section>`}
function schedulePortrait(){
 clearTimeout(portraitTimer);
 if(!portraitPaused&&portraitVisible&&!document.hidden&&$('.portraitBanner')){
  portraitTimer=setTimeout(()=>showPortrait((portraitIndex+1)%portraits.length),7500);
 }
}
function showPortrait(index){
 const banner=$('.portraitBanner');if(!banner||!portraits[index])return;
 portraitIndex=index;
 banner.querySelectorAll('[data-portrait]').forEach((slide,i)=>{
  const active=i===index;slide.classList.toggle('is-current',active);slide.inert=!active;slide.setAttribute('aria-hidden',String(!active));
 });
 banner.querySelectorAll('.portraitTabs button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
 schedulePortrait();
}
function setPortraitPause(paused){
 portraitPaused=paused;const b=$('.portraitPlay');
 if(b){b.textContent=portraitPlayIcon();b.title=portraitPlayLabel();b.setAttribute('aria-label',portraitPlayLabel())}
 schedulePortrait();
}
function connectPortrait(){
 clearTimeout(portraitTimer);portraitObserver?.disconnect();portraitVisible=false;
 const banner=$('.portraitBanner');if(!banner)return;
 if('IntersectionObserver' in window){
  portraitObserver=new IntersectionObserver(([entry])=>{portraitVisible=entry.isIntersecting;schedulePortrait()});
  portraitObserver.observe(banner);
 }else{portraitVisible=true;schedulePortrait()}
 banner.addEventListener('focusin',e=>{if(!e.target.closest('.portraitPlay'))setPortraitPause(true)});
}
document.addEventListener('visibilitychange',schedulePortrait);
motionSetting?.addEventListener('change',e=>setPortraitPause(e.matches));


function card(p){return `<article class="product speciesCard"><div class="prodImg">${link('product/'+p.id,photo(p.image,p.name))}<button class="save ${fav().includes(p.id)?'saved':''}" data-act="fav:${p.id}" aria-label="${wishlist()} · ${esc(p.name)}" aria-pressed="${fav().includes(p.id)}">${ic('heart',16)}</button></div><div class="speciesInfo"><div class="brand">${esc(p.speciesId?catTitle(p.c):gearGroup(p.c))}</div><h3>${link('product/'+p.id,esc(p.name))}</h3><em class="latin">${esc(p.speciesId?p.latin:p.brand+' · '+p.variants[0])}</em><p class="price">${money(p.price)} ${p.speciesId?`<small>/ ${tr('Tier','animal','animal')}</small>`:p.old>p.price?`<del>${money(p.old)}</del>`:''}</p></div></article>`}
let homeGroup='';
function home(){
 const animals=products();
 return hero()+`<section class="wrap section homeAnimals" aria-labelledby="homeAnimalsTitle"><div class="sectionHead"><h1 id="homeAnimalsTitle">${tr('Tiere','Animaux','Animals')}</h1>${link('overview',tr('Artenübersicht','Tableau des espèces','Species index'),'textLink')}</div><div class="productGrid">${animals.map(card).join('')}</div></section>
 <section class="popular" aria-labelledby="homeProductsTitle"><div class="wrap section"><div class="sectionHead"><h2 id="homeProductsTitle">${equipmentTitle()}</h2>${link('produkte',tr('Produkte filtern','Filtrer les produits','Filter products'),'textLink')}</div><div class="productGrid">${equipmentItems().map(card).join('')}</div></div></section>
 <section class="wrap section" aria-labelledby="homeOffersTitle"><div class="sectionHead"><h2 id="homeOffersTitle">${tr('Angebote von Kunden','Annonces des membres','Customer listings')}</h2>${link('community',tr('Zur Community','Voir la communauté','Explore community'),'textLink')}</div><div id="communityList" data-home="true" aria-live="polite"><p>${tr('Angebote werden geladen …','Chargement des annonces …','Loading listings …')}</p></div></section>
 <section class="popular" aria-labelledby="createOfferTitle"><div class="wrap section"><div class="sectionHead"><h2 id="createOfferTitle">${tr('Dein Angebot erstellen','Créer votre annonce','Create your listing')}</h2></div><div id="homeOfferForm" class="homeOfferForm"></div></div></section>`;
}
function homeGallery(){let ps=products().sort((a,b)=>[1,2,4,8,3,5,6,7].indexOf(a.speciesId)-[1,2,4,8,3,5,6,7].indexOf(b.speciesId));if(homeGroup)ps=ps.filter(p=>p.c===homeGroup);
 return `<section class="wrap section" id="homeGallery"><div class="sectionHead"><div><div class="kicker">${tr('Das Sortiment','La collection','The collection')}</div><h2>${tr('Unsere Tierarten','Nos espèces','Discover our species')}</h2></div>${link('overview',tr('Tabellenansicht','Vue en tableau','Table view'),'textLink')}</div><div class="atlasChips">${[['',tr('Alle Arten','Toutes les espèces','All species')],...groupRows.map(g=>[g.key,tx(g.names)])].map(([c,n])=>`<button class="${homeGroup===c?'chosen':''}" aria-pressed="${homeGroup===c}" data-act="homegroup:${c}">${esc(n)}</button>`).join('')}</div><div class="productGrid">${ps.map(card).join('')}</div></section>`}
function taxonomy(){const h=taxLabels();return frame(groupsTitle(),`<div class="tableScroll"><table class="atlasTable"><thead><tr><th>${h.gid}</th><th>${h.group}</th><th>${tr('Zugeordnete Tiere','Espèces associées','Member species')}</th></tr></thead><tbody>${groupRows.map(g=>`<tr><td>${g.id}</td><th>${link('shop/'+g.key,esc(tx(g.names)))}</th><td>${speciesRows.filter(s=>s.groupId===g.id).map(s=>link('product/tier-'+s.id,esc(tx(s.names)))).join(', ')}</td></tr>`).join('')}</tbody></table></div>`)}
function overview(){let h=taxLabels();return frame(tr('Artenübersicht','Tableau des espèces','Species index'),`<div class="tableScroll" tabindex="0"><table class="atlasTable"><thead><tr><th>${h.id}</th><th>${tr('Tierart','Espèce','Species')}</th><th>${h.scientific}</th><th>${h.group}</th><th>${h.description}</th><th>CHF ${perAnimal()}</th></tr></thead><tbody>${products().map(p=>`<tr><td>${p.speciesId}</td><th>${link('product/'+p.id,esc(p.name))}</th><td><em>${esc(p.latin)}</em></td><td>${catTitle(p.c)} · ${p.group.id}</td><td>${esc(tx(p.desc))}</td><td class="cash">${money(p.price)}</td></tr>`).join('')}</tbody></table></div>`)}
function creditsPage(){return frame(creditTitle(),`<p>${tr('Für die Website wurden die Aufnahmen verkleinert oder im Ausschnitt angepasst. Die jeweilige Bildlizenz gilt auch für die hier gezeigte Fassung.','Les photos sont redimensionnées ou recadrées pour la boutique. La licence indiquée s’applique également à cette version.','The photographs are resized or cropped for the shop. Each listed licence also applies to the displayed version.')}</p><div class="creditsList">${[...imageCredits.map(c=>({...c,image:'wildlife/'+c.id+'.jpg',label:tx(speciesById(c.id).names)})),...equipmentCredits.map(c=>({...c,image:'equipment-photos/'+c.id+'.jpg',label:item(c.id)?.name||c.title}))].map(c=>`<article>${photo(c.image,c.label)}<div><h3>${esc(c.label)}</h3><p>${esc(c.title)} · ${esc(c.author)}</p><a href="${esc(c.url)}" target="_blank" rel="noreferrer">${tr('Originalaufnahme','Photographie originale','Original photo')}</a> · <a href="${esc(c.licenseUrl)}" target="_blank" rel="noreferrer">${esc(c.license)}</a></div></article>`).join('')}</div>`)}

const crumbs=s=>`<div class="crumb">${link('home',textHome())} <span>/</span> ${s}</div>`;
const empty=s=>`<div class="empty"><p>${s}</p>${link('shop',galleryTitle(),'btn dark')}</div>`;
function catalog(type='',query=''){let group=groupRows.find(g=>g.key===type),title=group?tx(group.names):galleryTitle();
 return `<section class="wrap inner">${crumbs(title)}<h1>${title}</h1><div class="catalogNav">${link('shop',tr('Alle Arten','Toutes les espèces','All species'),!group?'active':'')}${groupRows.map(g=>link('shop/'+g.key,tx(g.names),g===group?'active':'')).join('')}</div><form id="filters"><label class="searchField">${ic('search',18)}<input name="q" value="${esc(query)}" aria-label="${tr('Suche','Recherche','Search')}" placeholder="${tr('Art oder wissenschaftlichen Namen suchen','Espèce ou nom scientifique','Species or scientific name')}"></label><select name="style" aria-label="${taxLabels().habitat}">${opt('',tr('Alle Gewässer','Tous les milieux','All waters'))+styleNames().map((n,i)=>opt(i,n,'')).join('')}</select><label class="maxprice">Max. CHF <input type="number" name="max" min="0" step=".01" aria-label="Max. CHF" placeholder="∞"></label><select name="sort" aria-label="${tr('Sortierung','Tri','Sort')}">${['','asc','desc'].map((v,i)=>opt(v,[taxLabels().id,tr('Preis aufsteigend','Prix croissant','Price: low to high'),tr('Preis absteigend','Prix décroissant','Price: high to low')][i],'')).join('')}</select></form><div id="results" data-type="${esc(group?.key||'')}"></div></section>`
}
function filterProducts(){const f=$('#filters');if(!f)return;if(f.dataset.range){gearResults(f);return}const d=Object.fromEntries(new FormData(f)),c=$('#results').dataset.type;
 const q=d.q.trim().toLocaleLowerCase(),ps=products().filter(p=>(!c||p.c===c)&&(d.style===''||p.style===+d.style)&&(d.max===''||p.price<=+d.max)&&[p.name,p.latin,catTitle(p.c),...p.species.names,tx(p.species.habitat)].join(' ').toLocaleLowerCase().includes(q));if(d.sort)ps.sort((a,b)=>(a.price-b.price)*(d.sort==='asc'?1:-1));$('#results').innerHTML=`<p class="muted">${ps.length} ${tr('Artikel','articles','items')}</p>`+(ps.length?`<div class="productGrid">${ps.map(card).join('')}</div>`:empty(tr('Keine passende Art gefunden.','Aucune espèce correspondante.','No matching species.')))}


const infoTitles=()=>({shipping:tr('Versand & Tracking','Livraison & suivi','Shipping & tracking'),contact:tr('Kontakt & FAQ','Contact & FAQ','Contact & FAQ'),about:tr('Über BigBenShop','À propos','About BigBenShop'),terms:tr('AGB','Conditions générales','Terms'),privacy:tr('Datenschutz','Confidentialité','Privacy'),legal:tr('Impressum','Mentions légales','Legal notice'),returns:tr('Rückgabe','Retours','Returns')});
function footer(){let info=infoTitles();$('#footer').innerHTML=`<div class="wrap footerGrid"><div>${logo()}<p>${tr('Tierkatalog, Angelbedarf und Fischfutter.','Espèces, matériel de pêche et nourriture pour poissons.','Species, fishing tackle and fish food.')}</p><label class="language">${ic('globe',16)}<select aria-label="Sprache / Langue / Language" id="language">${langs.map((v,i)=>opt(v,['Deutsch','Français','English'][i],lang)).join('')}</select> · CHF</label></div><div><h3>Shop</h3>${link('produkte',equipmentTitle())}${catKeys.map(c=>link('shop/'+c,catTitle(c))).join('')}${link('compare',tr('Produktvergleich','Comparateur','Compare products'))}</div><div><h3>Service</h3>${['contact','shipping','returns','about'].map(i=>link('info/'+i,info[i])).join('')}${link('credits',creditTitle())}${link('community','Community')}${link('admin',tr('Demo-Verwaltung','Gestion démo','Demo administration'))}</div><div><h3>Newsletter</h3><p>${tr('Neuheiten und Angebote per E-Mail.','Nouveautés et offres par e-mail.','New arrivals and offers by email.')}</p><form data-form="newsletter" class="newsletter"><input type="email" name="email" placeholder="E-Mail" aria-label="E-Mail" required><button aria-label="${tr('Anmelden','Inscription','Subscribe')}">${ic('check',19)}</button></form></div></div><div class="footbase wrap"><span>© BigBenShop · ${tr('Demoshop','Boutique démo','Demo shop')}</span><div>${['terms','privacy','legal'].map(i=>link('info/'+i,info[i])).join('')}</div></div>`}

let sharedProductReviews={},sharedReviewsLoaded=false,sharedReviewsLoading=false;
async function loadSharedProductReviews(force=false){
 if(sharedReviewsLoading||(!force&&sharedReviewsLoaded))return;
 sharedReviewsLoading=true;
 try{
  const response=await fetch('/api/reviews',{cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();const grouped={};
  for(const review of data.items||[])(grouped[review.id]??=[]).push(review);
  sharedProductReviews=grouped;sharedReviewsLoaded=true;
  if(route().page==='product')render();
 }catch(error){console.error('Bewertungen konnten nicht geladen werden:',error)}
 finally{sharedReviewsLoading=false}
}
function detail(id){let p=item(id);if(!p)return empty(tr('Produkt nicht gefunden.','Produit introuvable.','Product not found.'));let rs=[...reviews(id),...(sharedProductReviews[id]||[])];
 return `<div class="wrap inner">${crumbs((p.speciesId?link('shop/'+p.c,catTitle(p.c)):link('produkte',equipmentTitle())+' / '+link('produkte/'+p.c,gearGroup(p.c)))+' / '+esc(p.name))}<div class="detail"><div><div class="detailImage animalDetail">${photo(p.image,p.name)}</div><div class="photoNote">${!p.speciesId?tr('Beispielfoto','Photo illustrative','Illustrative photo')+' · ':[3,5].includes(p.speciesId)?tr('Museumspräparat (Holotypus)','Spécimen de musée (holotype)','Museum specimen (holotype)')+' · ':''}${link('credits',creditTitle())}</div></div><div><div class="kicker">${esc(p.brand)}</div><h1>${esc(p.name)}</h1><em class="latin detailLatin">${esc(p.speciesId?p.latin:gearGroup(p.c))}</em><p class="bigPrice">${money(p.price)} ${p.speciesId?`<small>/ ${tr('Tier','animal','animal')}</small>`:''} ${p.old>p.price?`<del>${money(p.old)}</del>`:''}</p><h2 class="bioTitle">${p.speciesId?taxLabels().description:tr('Beschreibung','Description','Description')}</h2><p>${esc(tx(p.desc))}</p>${p.speciesId?`<dl class="specFacts">${[[taxLabels().id,p.speciesId],[taxLabels().gid,p.group.id],[taxLabels().group,catTitle(p.c)]].map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`:''}${dimensionPanel(p)}<form data-form="add" data-id="${id}">${p.speciesId?'<input type="hidden" name="variant" value="1 ×">':label(tr('Variante','Variante','Variant'),`<select name="variant">${p.variants.map(v=>opt(v,v,'')).join('')}</select>`)}
<p class="stock">${p.stock?ic('check',16):''}${p.stock?tr(p.stock+'  Stück im Demobestand',p.stock+' en stock démo',p.stock+' in demo stock'):tr('Ausverkauft','Épuisé','Sold out')}</p><button class="btn dark" ${p.stock?'':'disabled'}>${ic('bag',18)}${tr('In den Warenkorb','Ajouter au panier','Add to basket')}</button></form><div class="aux">${button('fav:'+id,(fav().includes(id)?'✓ ':'')+wishlist(),'textLink','heart')}${button('compare:'+id,(comp().includes(id)?'✓ ':'')+tr('Vergleichen','Comparer','Compare'),'textLink','sliders')}</div></div></div><section class="section" id="reviews"><h2>${tr('Bewertungen','Avis','Reviews')}</h2><p>${rs.length?'★ '+(rs.reduce((sum,r)=>sum+r.score,0)/rs.length).toFixed(1)+' ('+rs.length+')':tr('Noch keine Bewertungen.','Aucun avis pour le moment.','No reviews yet.')}</p>${rs.filter(r=>!r.demo).map(r=>`<blockquote>★ ${r.score} · ${esc(r.comment)}</blockquote>`).join('')}<form class="reviewForm" data-form="review" data-id="${id}"><select name="score" aria-label="${tr('Sterne','Étoiles','Stars')}">${[5,4,3,2,1].map(n=>opt(n,'★'.repeat(n),5)).join('')}</select><input required maxlength="500" name="comment" aria-label="${tr('Bewertung','Avis','Review')}" placeholder="${tr('Deine Erfahrung','Votre expérience','Your experience')}"><button class="btn dark">${tr('Bewertung speichern','Enregistrer','Save review')}</button></form></section><section><h2>${p.speciesId?tr('Weitere Tierarten','Autres espèces','More species'):tr('Weitere Produkte','Autres produits','More products')}</h2><div class="productGrid">${(p.speciesId?products():equipmentItems()).filter(q=>q.id!==id).sort((a,b)=>Number(b.c===p.c)-Number(a.c===p.c)).slice(0,4).map(card).join('')}</div></section></div>`}
function savedPage(compare){let ids=compare?comp():fav(),ps=ids.map(item).filter(Boolean),title=compare?tr('Produktvergleich','Comparateur','Product comparison'):wishlist();return `<section class="wrap inner">${crumbs(title)}<h1>${title}</h1>${ps.length?`<div class="productGrid">${ps.map(p=>`<div>${card(p)}${compare?`<dl><dt>${p.speciesId?taxLabels().habitat:tr('Kategorie','Catégorie','Category')}</dt><dd>${p.speciesId?styleNames()[p.style]:gearGroup(p.c)}</dd><dt>${p.speciesId?taxLabels().scientific:tr('Varianten','Variantes','Variants')}</dt><dd>${esc(p.speciesId?p.latin:p.variants.join(', '))}</dd><dt>${tr('Lagerbestand','Stock','In stock')}</dt><dd>${p.stock}</dd></dl>${button('compare:'+p.id,tr('Entfernen','Retirer','Remove'))}`:''}</div>`).join('')}</div>`:empty(tr('Hier sind noch keine Produkte gespeichert.','Aucun produit enregistré.','No saved products yet.'))}</section>`}
function route(){let raw=location.hash.slice(1)||'home';const [path,search='']=raw.split('?');let [page,arg]=path.split('/');return {page,arg,query:new URLSearchParams(search).get('q')||''}}
function render(){closePanel();header();footer();document.documentElement.lang=lang;let {page,arg,query}=route();let views={home,community:communityPage,produkte:()=>gearPage(arg,query),groups:taxonomy,overview,credits:creditsPage,gear:()=>gearPage(arg,query),produkt:()=>gearPage(arg,query),search:()=>gearPage('',query,true),shop:()=>Object.hasOwn(equipmentGroups,arg)?gearPage(arg,query):catalog(arg,query),product:()=>detail(arg),wish:()=>savedPage(false),compare:()=>savedPage(true),cart:cartPage,checkout,account:accountPage,admin:adminPage,info:()=>infoPage(arg),order:()=>confirmation(arg)};$('#main').innerHTML=(views[page]||home)();filterProducts();connectPortrait();if($('#communityList'))refreshCommunity();if(page==='product')loadSharedProductReviews();document.title=($('#main h1')?.innerText.replace(/\n/g,' ')||textHome())+' | BigBenShop';$('#close').ariaLabel=tr('Schliessen','Fermer','Close')}
function searchPanel(){panel(`<div class="kicker">BigBenShop</div><h2>${tr('Produkte suchen','Rechercher','Search products')}</h2><form data-form="search"><label class="searchField">${ic('search')}<input autofocus name="q" placeholder="${tr('Tierart, Köder, Fischfutter …','Espèce, leurre, nourriture …','Species, lures, fish food …')}"></label><button class="btn dark">${tr('Suchen','Rechercher','Search')}</button></form>`)}
function toggleKey(k,id){let a=read(k,[]),has=a.includes(id);put(k,has?a.filter(v=>v!==id):[...a,id]);return !has}
document.addEventListener('click',e=>{let el=e.target.closest('[data-act]');if(!el)return;e.preventDefault();let [a,id]=el.dataset.act.split(':');switch(a){
 case 'portrait':setPortraitPause(true);showPortrait(Number(id));break;
 case 'portraitPlay':setPortraitPause(!portraitPaused);break;
 case 'homegroup':homeGroup=id||'';$('#homeGallery').outerHTML=homeGallery();document.querySelector('.atlasChips .chosen')?.focus({preventScroll:true});break;
 case 'search':searchPanel();break;
 case 'menu':panel(`<h2>Shop</h2><div class="menuLinks">${link('home',textHome())}${link('produkte',equipmentTitle())}${link('community','Community')}${catKeys.map(c=>link('shop/'+c,catTitle(c))).join('')}${link('groups',groupsTitle())}${link('overview',tr('Artenübersicht','Tableau des espèces','Species index'))}${link('wish',wishlist())}${link('account',account())}</div>`);break;
 case 'cart':case 'wish':case 'account':go(a);break;
 case 'reviews':$('#reviews')?.scrollIntoView();break;
 case 'fav':case 'compare':{let added=toggleKey(a,id);render();toast(added?tr('Produkt gespeichert.','Produit enregistré.','Product saved.'):tr('Produkt entfernt.','Produit retiré.','Product removed.'));if(a==='compare'&&added)panel(`<h2>${tr('Im Vergleich gespeichert','Ajouté au comparateur','Added to comparison')}</h2>${link('compare',tr('Vergleich öffnen','Voir le comparateur','Open comparison'),'btn dark')}`);break}
 default:commerceAction(a,id);
}});
document.addEventListener('click',e=>{if(e.target.closest('dialog a'))closePanel();if(e.target.closest('.skip')){e.preventDefault();document.querySelector('main').focus();document.querySelector('main').scrollIntoView()}});
document.addEventListener('input',e=>{if(e.target.closest('#filters'))filterProducts()});
document.addEventListener('change',e=>{if(e.target.id==='language'){lang=e.target.value;put('lang',lang);render()}if(e.target.name==='ship'&&route().page==='checkout')checkoutTotal()});
$('#close').onclick=closePanel;$('#dialog').addEventListener('click',e=>{if(e.target===$('#dialog'))closePanel()});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);$('#main').focus({preventScroll:true})});


