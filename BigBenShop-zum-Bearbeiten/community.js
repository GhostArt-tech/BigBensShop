
'use strict';
const communityCategories=['amphibien','knorpelfische','knochenfische','kopffuesser','food','rods','other'];
const offerCategory=c=>catKeys.includes(c)?catTitle(c):c==='other'?tr('Sonstiges','Autres','Other'):gearGroup(c);
const yourOffer=()=>tr('Dein Angebot','Votre annonce','Your listing');
let communityState={items:[],signed:false,admin:false,ready:false},communityLoad=0,communityCategory='';
const commError=code=>({
 signin:tr('Bitte melde dich an.','Veuillez vous connecter.','Please sign in.'),
 forbidden:tr('Du hast dafür keine Berechtigung.','Vous n’avez pas cette autorisation.','You do not have permission.'),
 ownRating:tr('Eigene Angebote können nicht bewertet werden.','Impossible d’évaluer votre annonce.','You cannot rate your own listing.'),
 changed:tr('Das Angebot hat sich geändert. Öffne es erneut.','L’annonce a changé. Rouvrez-la.','The listing changed. Please reopen it.'),
 photoLimit:tr('Maximal vier Fotos pro Angebot.','Quatre photos maximum.','Up to four photos per offer.'),
 photo:tr('Dieses Foto konnte nicht gelesen werden.','Image illisible.','This image could not be read.'),
 invalid:tr('Bitte prüfe die Angaben.','Vérifiez les informations.','Please check the details.'),
 missing:tr('Das Angebot ist nicht mehr verfügbar.','L’annonce n’est plus disponible.','This listing is no longer available.')
}[code]||tr('Die Community ist gerade nicht erreichbar. Bitte erneut versuchen.','La communauté est indisponible. Veuillez réessayer.','The community is unavailable. Please retry.'));
async function communityRequest(path='',opts={}){
 const r=await fetch('/api/offers'+path,{...opts,cache:'no-store'});let payload;
 try{payload=await r.json()}catch{throw Error(commError())}
 if(!r.ok)throw Error(commError(payload.error));return payload;
}
function communityPage(){
 return `<section class="wrap inner communityView">${crumbs('Community')}<div class="communityIntro"><div><div class="kicker">BigBenShop</div><h1>Community</h1><p>${tr('Biete deine Artikel an und bewerte die Angebote anderer Mitglieder.','Proposez vos articles et évaluez les annonces des autres membres.','List your items and rate other members’ offers.')}</p></div><div id="offerCTA"></div></div><div id="communityList" aria-live="polite"><p>${tr('Angebote werden geladen …','Chargement des annonces …','Loading listings …')}</p></div></section>`;
}
const offerAction=(action,title,cls='secondary')=>`<button type="button" class="${cls}" data-community="${action}">${title}</button>`;
function offerGrid(offers){
 return offers.length?`<div class="productGrid">${offers.map(o=>`<article class="speciesCard offerCard"><button class="offerPic" data-community="open:${o.id}" aria-label="${esc(o.title)}">${o.photos.length?photo(o.photos[0],o.title):`<span>${ic('box',38)}</span>`}</button><div class="speciesInfo"><div class="brand">${esc(offerCategory(o.category))}${o.own?' · '+tr('Deins','À vous','Yours'):''}</div><h3>${offerAction('open:'+o.id,esc(o.title),'offerTitle')}</h3><div class="offerStars">★ ${o.votes?Number(o.average).toFixed(1)+' ('+o.votes+')':tr('Unbewertet','Aucun avis','Unrated')}</div><p class="price">${money(o.cents/100)}</p></div></article>`).join('')}</div>`:`<div class="empty"><p>${tr('Hier gibt es noch keine Angebote.','Aucune annonce pour le moment.','There are no listings here yet.')}</p></div>`;
}
function communityList(){
 const list=$('#communityList');if(!list)return;
 if(list.dataset.home){
  list.innerHTML=offerGrid(communityState.items);
  const composer=$('#homeOfferForm');
  if(composer&&composer.dataset.signed!==String(communityState.signed)){
   composer.dataset.signed=String(communityState.signed);
   composer.innerHTML=communityState.signed?offerFields():`<a class="btn dark" target="_top" href="/signin-with-chatgpt?return_to=%2F%23home">${tr('Zum Anbieten anmelden','Se connecter pour publier','Sign in to sell')}</a>`;
  }
  return;
 }
 $('#offerCTA').innerHTML=communityState.signed?offerAction('new',ic('plus',17)+yourOffer(),'btn lime'):`<a class="btn lime" target="_top" href="/signin-with-chatgpt?return_to=%2F%23community">${tr('Zum Anbieten anmelden','Se connecter pour publier','Sign in to sell')}</a>`;
 const offers=communityState.items.filter(o=>!communityCategory||o.category===communityCategory);
 list.innerHTML=`<div class="communityToolbar"><h2>${tr('Angebote','Annonces','Listings')}</h2><select id="communityFilter" aria-label="${tr('Kategorie','Catégorie','Category')}">${opt('',tr('Alle Kategorien','Toutes les catégories','All categories'),communityCategory)+communityCategories.map(c=>opt(c,offerCategory(c),communityCategory)).join('')}</select></div>`+offerGrid(offers);
}
async function refreshCommunity(){
 const seq=++communityLoad;
 try{const data=await communityRequest();if(seq!==communityLoad||!$('#communityList'))return;communityState={...data,ready:true};communityList()}
 catch(e){if(seq===communityLoad&&$('#communityList'))$('#communityList').innerHTML=`<p class="notice">${esc(e.message)}</p>${offerAction('reload',tr('Erneut laden','Réessayer','Retry'))}`}
}
function offerDetail(o){
 const manage=communityState.admin||o.own;
 panel(`<div class="kicker">${esc(offerCategory(o.category))}</div><h2>${esc(o.title)}</h2>${o.photos.length?`<div class="offerGallery">${o.photos.map(src=>photo(src,o.title)).join('')}</div>`:''}<p class="bigPrice">${money(o.cents/100)}</p><p class="userDescription">${esc(o.description)}</p><dl class="specFacts"><div><dt>${tr('Länge','Longueur','Length')}</dt><dd>${o.length_cm!=null?o.length_cm+' cm':'—'}</dd></div><div><dt>${tr('Gewicht','Poids','Weight')}</dt><dd>${o.weight_g!=null?o.weight_g+' g':'—'}</dd></div></dl><p>★ ${o.votes?Number(o.average).toFixed(1)+' ('+o.votes+')':tr('Noch keine Bewertungen','Aucun avis','No ratings yet')}</p>${communityState.signed&&!o.own?`<form data-community-form="rate" data-id="${o.id}">${label(tr('Deine Bewertung','Votre note','Your rating'),`<select name="stars" required>${opt('',tr('Sterne auswählen','Choisir une note','Choose a rating'),o.myRating||'')+[1,2,3,4,5].map(n=>opt(n,'★'.repeat(n),o.myRating)).join('')}</select>`)}${submit(tr('Bewertung speichern','Enregistrer la note','Save rating'))}</form>`:''}${manage?`<div class="manageOffer">${communityState.admin?offerAction('edit:'+o.id,tr('Bearbeiten','Modifier','Edit')):''}${offerAction('delete:'+o.id,tr('Löschen','Supprimer','Delete'),'textLink')}</div>`:''}`);
}
function offerFields(o=null){
 return `<form data-community-form="offer" data-id="${o?.id||''}">${label(tr('Titel (Produkt)','Titre (produit)','Title (product)'),input('title','text',o?.title||'','required maxlength="100"'))}<div class="formGrid">${label(tr('Kategorie','Catégorie','Category'),`<select name="category" required>${opt('',tr('Bitte wählen','Choisir','Choose'),o?.category||'')+communityCategories.map(k=>opt(k,offerCategory(k),o?.category)).join('')}</select>`)}${label(tr('Preis in CHF','Prix en CHF','Price in CHF'),input('price','number',o?(o.cents/100).toFixed(2):'','required min="0" max="99999999.99" step=".01"'))}</div>${label(tr('Beschreibung','Description','Description'),`<textarea name="description" maxlength="3000" required>${esc(o?.description||'')}</textarea>`)}<div class="formGrid">${label(tr('Länge (cm, optional)','Longueur (cm, facultative)','Length (cm, optional)'),input('length','number',o?.length_cm??'','step="any" min="0.000001"'))}${label(tr('Gewicht (g, optional)','Poids (g, facultatif)','Weight (g, optional)'),input('weight','number',o?.weight_g??'','step="any" min="0.000001"'))}</div>${o?.photos.length?`<div class="keepGallery">${o.photos.map(src=>`<label><input name="keep" type="checkbox" value="${esc(src)}" checked>${photo(src,o.title)}${tr('Behalten','Conserver','Keep')}</label>`).join('')}</div>`:''}${label(tr('Fotos hinzufügen (bis zu 4)','Ajouter des photos (4 maximum)','Add photos (up to 4)'),'<input type="file" name="photoFiles" accept="image/jpeg,image/png,image/webp" multiple>')}<div class="uploadPreview"></div><p class="formMessage" role="status"></p>${submit(o?tr('Änderungen speichern','Enregistrer','Save changes'):tr('Angebot veröffentlichen','Publier l’annonce','Publish listing'))}</form>`;
}
function offerForm(o=null){
 panel(`<div class="kicker">Community</div><h2>${o?tr('Angebot bearbeiten','Modifier l’annonce','Edit listing'):yourOffer()}</h2>${offerFields(o)}`);
}
async function toJpeg(file){
 if(file.size>15e6||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error(commError('photo'));
 const bmp=await createImageBitmap(file);try{
 const factor=Math.min(1,1200/Math.max(bmp.width,bmp.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bmp.width*factor));canvas.height=Math.max(1,Math.round(bmp.height*factor));let g=canvas.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,canvas.width,canvas.height);g.drawImage(bmp,0,0,canvas.width,canvas.height);for(const quality of [.8,.55,.36]){const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));if(blob&&blob.size<=600000)return blob}throw Error(commError('photo'));
 }finally{bmp.close()}
}
document.addEventListener('change',e=>{
 if(e.target.id==='communityFilter'){communityCategory=e.target.value;communityList()}
 if(e.target.name==='photoFiles'){const preview=e.target.form.querySelector('.uploadPreview');preview.textContent=Array.from(e.target.files).map(f=>f.name).join(' · ')}
});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-community]');if(!b)return;const [a,id]=b.dataset.community.split(':'),o=communityState.items.find(x=>x.id===id);
 if(a==='reload'){refreshCommunity();return}if(a==='new'){offerForm();return}if(!o)return;
 if(a==='open'){offerDetail(o);return}if(a==='edit'&&communityState.admin){offerForm(o);return}
 if(a==='delete'&&(o.own||communityState.admin))panel(`<h2>${tr('Angebot löschen?','Supprimer cette annonce ?','Delete this listing?')}</h2><p>${esc(o.title)}</p><form data-community-form="remove" data-id="${id}"><p class="formMessage" role="status"></p>${submit(tr('Endgültig löschen','Supprimer définitivement','Delete permanently'))} ${offerAction('open:'+id,tr('Abbrechen','Annuler','Cancel'))}</form>`);
});
document.addEventListener('submit',async e=>{
 const f=e.target;if(!f.dataset.communityForm)return;e.preventDefault();if(f.dataset.busy)return;f.dataset.busy='1';
 const btn=f.querySelector('button[type=submit]');if(btn)btn.disabled=true;
 const id=f.dataset.id,type=f.dataset.communityForm;
 try{
 if(type==='remove')await communityRequest('/'+id,{method:'DELETE'});
 if(type==='rate')await communityRequest('/'+id+'/rating',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({stars:Number(f.elements.stars.value)})});
 if(type==='offer'){
  const data=new FormData(f),files=[...f.elements.photoFiles.files];data.delete('photoFiles');
  if(files.length+data.getAll('keep').length>4)throw Error(commError('photoLimit'));
  const old=communityState.items.find(o=>o.id===id);if(old)data.set('version',old.version);
  for(const file of files)data.append('photos',await toJpeg(file),'photo.jpg');
  await communityRequest(id?'/'+id:'',{method:id?'PUT':'POST',body:data});
  if(f.closest('#homeOfferForm')){f.reset();f.querySelector('.uploadPreview').textContent='';f.querySelector('.formMessage').textContent=''}
 }
 closePanel();await refreshCommunity();toast(tr('Gespeichert.','Enregistré.','Saved.'));
 }catch(error){let msg=f.querySelector('.formMessage');if(!msg){msg=document.createElement('p');f.append(msg)}msg.textContent=error.message}
 finally{delete f.dataset.busy;if(btn)btn.disabled=false}
});

