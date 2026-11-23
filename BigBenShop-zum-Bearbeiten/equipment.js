
'use strict';
const equipmentTitle=()=>tr('Produkte','Produits','Products');
const equipmentGroups={
 food:['Fischfutter','Nourriture pour poissons','Fish food'],
 rods:['Angelruten','Cannes à pêche','Fishing rods'],
 reels:['Angelrollen','Moulinets','Fishing reels'],
 lures:['Köder','Leurres','Lures'],
 gear:['Zubehör','Accessoires','Accessories']
};
const gearTypes=()=>[tr('Spinnfischen','Pêche au lancer','Spin fishing'),tr('Fliegenfischen','Pêche à la mouche','Fly fishing'),tr('Allround','Polyvalent','All-round')];
const feed={id:'f1',c:'food',brand: 'Tetra',name:'Flockenfutter',price:8.90,old:0,style:-1,variants:['100 g'],stock:24,
 desc:['Feines Flockenfutter für Aquarienfische. Die 100-g-Packung lässt sich für kleine Portionen leicht dosieren.','Nourriture en flocons pour poissons d’aquarium. Le paquet de 100 g se prête au dosage en petites portions.','Flake food for aquarium fish. The 100 g pack makes it easy to portion out small servings.']};
const gearGroup=c=>tx(equipmentGroups[c]||equipmentGroups.gear);
const feed2 = {id: 'f2',c: 'food',brand: 'Tetra',name: 'TetraMin Tropical Granules',price: 7.90,old: 0,style: -1,variants: ['100 g'],stock: 24,desc: [
'Granulatfutter für kleine tropische Aquarienfische. Die 100-g-Packung lässt sich einfach dosieren.',
'Aliment en granulés pour les petits poissons tropicaux d’aquarium. Le pot de 100 g permet un dosage facile.',
'Granulated food for small tropical aquarium fish. The 100 g container makes portioning easy.']
};

const allItems=()=>[...products(),...equipmentItems()];
const item=id=>allItems().find(p=>p.id===id);
function equipmentItems(){
 const byId=new Map([feed,feed2,...gearArchive].map(p=>[p.id,p]));
 for(const p of read('products',[]))if(!p.speciesId&&p.id&&!p.id.startsWith('tier-'))byId.set(p.id,p);
 const edits=read('equipmentEdits',{}),fallback={rods:'r1',reels:'m1',lures:'l1',gear:'g1',food:'f1'};
 return [...byId.values()].map(base=>{
  const p={...base,...edits[base.id]},photoId=[feed,feed2,...gearArchive].some(s=>s.id===p.id)?p.id:fallback[p.c]||'g1';
  if(p.id==='f1'&&p.name==='Flockenfutter')p.name=tr('Flockenfutter','Flocons pour poissons','Fish flakes');
  return {...p,image:'equipment-photos/'+(p.photoId || photoId)+'.jpg'};
 });
}
function restoreSavedGear(){
 const state=readShop();if(state.equipmentVersion)return;
 const ids=new Set(equipmentItems().map(p=>p.id));
 for(const key of ['fav','compare']){
  const former=(state['archived_'+key]||[]).filter(id=>ids.has(id));
  if(former.length)state[key]=[...new Set([...(state[key]||[]),...former])];
 }
 state.equipmentVersion=1;localStorage.setItem('ww.store',JSON.stringify(state));
}
restoreSavedGear();
function gearPeek(){
 const list=equipmentItems();
 return `<section class="popular"><div class="wrap section"><div class="sectionHead"><div><div class="kicker">${tr('Angelbedarf & Fischfutter','Matériel et nourriture','Tackle & fish food')}</div><h2>${equipmentTitle()}</h2></div>${link('produkte',tr('Zum Sortiment','Voir la collection','Shop the collection'),'textLink')}</div><div class="productGrid">${['f1','r1','l1','g1'].map(id=>list.find(p=>p.id===id)).filter(Boolean).map(card).join('')}</div></div></section>`;
}
function formerCart(){
 const lines=read('archivedCart',[]).filter(l=>item(l.id));
 if(!lines.length)return '';
 const title=tr('Dein früherer Warenkorb','Votre ancien panier','Your former basket');
 return `<details><summary>${title}</summary><p>${lines.map(l=>esc(item(l.id).name)+' · '+esc(l.variant)+' × '+l.qty).join(', ')}</p>${button('restoreCart',tr('Verfügbare Artikel übernehmen','Reprendre les articles disponibles','Restore available items'))}</details>`;
}
function restoreFormerCart(){
 const state=readShop(),lines=[...(state.cart||[])],unavailable=[];
 for(const old of state.archivedCart||[]){
  const p=item(old.id),inCart=lines.filter(l=>l.id===old.id).reduce((n,l)=>n+l.qty,0);
  const count=p?.variants.includes(old.variant)?Math.min(old.qty,Math.max(0,p.stock-inCart)):0;
  if(count>0){const line=lines.find(l=>l.id===old.id&&l.variant===old.variant);if(line)line.qty+=count;else lines.push({...old,qty:count})}
  if(count<old.qty)unavailable.push({...old,qty:old.qty-count});
 }
 state.cart=lines;state.archivedCart=unavailable;localStorage.setItem('ww.store',JSON.stringify(state));go('cart');
}
function gearPage(type='',query='',global=false){
 const c=Object.hasOwn(equipmentGroups,type)||type==='tiere'||catKeys.includes(type)?type:'';
 const title=global?tr('Suchergebnisse','Résultats de recherche','Search results'):equipmentTitle();
 const groupNav=link('produkte',tr('Alle Produkte','Tous les produits','All products'),!c?'active':'')+link('produkte/tiere',tr('Tiere','Animaux','Animals'),c==='tiere'?'active':'')+Object.keys(equipmentGroups).map(k=>link('produkte/'+k,gearGroup(k),c===k?'active':'')).join('');
 const brands=[...new Set(equipmentItems().map(p=>p.brand))].sort();
 return `<section class="wrap inner gearBrowse">${crumbs(global?title:link('produkte',equipmentTitle())+(c?' / '+(c==='tiere'?tr('Tiere','Animaux','Animals'):catKeys.includes(c)?catTitle(c):gearGroup(c)):''))}<div class="browseHead"><h1>${title}</h1>${!global?`<p>${tr('Entdecke Tiere, Angelgerät, Köder, Zubehör und Fischfutter.','Découvrez les animaux, le matériel de pêche, les leurres, les accessoires et la nourriture pour poissons.','Explore animals, fishing tackle, lures, accessories and fish food.')}</p>`:''}</div>${global?'':formerCart()}${global?'':`<nav class="catalogNav" aria-label="${equipmentTitle()}">${groupNav}</nav>`}<form id="filters" data-range="${global?'all':'gear'}"><label class="searchField">${ic('search',18)}<input type="search" name="q" aria-label="${tr('Suche','Recherche','Search')}" value="${esc(query)}" placeholder="${tr('Artikel suchen …','Rechercher un article …','Search items …')}"></label>${global?'':`<select name="brand" aria-label="${tr('Marke','Marque','Brand')}">${opt('',tr('Alle Marken','Toutes les marques','All brands'))+brands.map(b=>opt(b,b,'')).join('')}</select><select name="style" aria-label="${tr('Angelart','Technique','Fishing style')}">${opt('',tr('Alle Angelarten','Toutes les techniques','All fishing styles'))+gearTypes().map((n,i)=>opt(i,n,'')).join('')}</select>`}<label class="maxprice">Max. CHF <input type="number" min="0" step=".01" name="max" aria-label="Max. CHF" placeholder="∞"></label><select name="sort" aria-label="${tr('Sortierung','Tri','Sort')}">${opt('',tr('Sortimentsreihenfolge','Ordre du catalogue','Catalogue order'))}${opt('asc',tr('Preis aufsteigend','Prix croissant','Price: low to high'))}${opt('desc',tr('Preis absteigend','Prix décroissant','Price: high to low'))}</select></form><div id="results" data-type="${esc(c)}"></div></section>`;
}
function catalogueItems(){
 const equipment=equipmentItems(),animals=products(),items=[];
 for(let i=0;i<Math.max(equipment.length,animals.length);i++){
  if(equipment[i])items.push(equipment[i]);
  if(animals[i])items.push(animals[i]);
 }
 return items;
}
function gearResults(f){
 const d=Object.fromEntries(new FormData(f)),c=$('#results').dataset.type,q=d.q.trim().toLocaleLowerCase();
 const candidates=catalogueItems();
 const filtered=candidates.filter(p=>{
  const tags=p.speciesId?[p.latin,...p.species.names,catTitle(p.c),tx(p.species.habitat)]:[gearGroup(p.c),...p.variants,...(p.c==='rods'?['Angeln','Angel']:[]),tx(p.desc)];
  return (!c||p.c===c||(c==='tiere'&&p.speciesId))&&(!d.brand||p.brand===d.brand)&&(!d.style||!p.speciesId&&p.style===Number(d.style))&&(d.max===''||p.price<=Number(d.max))&&[p.name,p.brand,...tags].join(' ').toLocaleLowerCase().includes(q);
 });
 if(d.sort)filtered.sort((a,b)=>(a.price-b.price)*(d.sort==='asc'?1:-1));
 $('#results').innerHTML=`<p class="muted">${filtered.length} ${tr('Artikel','articles','items')}</p>`+(filtered.length?`<div class="productGrid">${filtered.map(card).join('')}</div>`:`<p class="empty">${tr('Keine passenden Artikel gefunden.','Aucun article correspondant.','No matching items.')}</p>`);
}
function gearEdit(id){
 const p=item(id)||{name:'',brand:'',c:'gear',price:'',stock:1,variants:['Standard'],desc:['','','']},v=tr('Varianten','Variantes','Variants');
 panel(`<h2>${esc(p.name)||tr('Produkt anlegen','Créer un produit','Add a product')}</h2><form data-form="editEquipment" data-id="${esc(id)}">${label(tr('Name','Nom','Name'),input('name','text',id==='f1'&&p.name===tr('Flockenfutter','Flocons pour poissons','Fish flakes')?feed.name:p.name))}<div class="formGrid">${label(tr('Kategorie','Catégorie','Category'),`<select name="category">${Object.keys(equipmentGroups).map(k=>opt(k,gearGroup(k),p.c)).join('')}</select>`)}${label(tr('Marke','Marque','Brand'),input('brand','text',p.brand))}${label('CHF',input('price','number',p.price,'required min=".01" step=".01"'))}${label(tr('Demobestand','Stock démo','Demo stock'),input('stock','number',p.stock,'required min="0" step="1"'))}</div>${label(v,input('variants','text',p.variants.join(', ')))}${langs.map((l,i)=>label(tr('Beschreibung','Description','Description')+' '+l.toUpperCase(),`<textarea name="desc${i}" ${i?'':'required'}>${esc(p.desc[i])}</textarea>`)).join('')}${submit(tr('Speichern','Enregistrer','Save'))}</form>`);
}


