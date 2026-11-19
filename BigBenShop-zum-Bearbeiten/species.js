
'use strict';
const groupRows=[
 {id:1,key:'amphibien',names:['Amphibien','Amphibiens','Amphibians']},
 {id:2,key:'knorpelfische',names:['Knorpelfische','Poissons cartilagineux','Cartilaginous fish']},
 {id:3,key:'knochenfische',names:['Knochenfische','Poissons osseux','Bony fish']},
 {id:4,key:'kopffuesser',names:['Kopffüsser','Céphalopodes','Cephalopods']}
];
const speciesRows=[
 {id:1,groupId:1,names:['Axolotl','Axolotl','Axolotl'],latin:'Ambystoma mexicanum',water:0,habitat:['Xochimilco, Mexiko','Xochimilco, Mexique','Xochimilco, Mexico'],description:[
 'Lebt in Süsswasserkanälen in Xochimilco, Mexiko. Der Salamander hat aussenliegende Kiemen und lebt auch als erwachsenes Tier im Wasser.',
 'Il vit dans les canaux d’eau douce de Xochimilco, au Mexique. Cette salamandre conserve ses branchies externes et reste aquatique à l’âge adulte.',
 'It lives in the freshwater canals of Xochimilco, Mexico. This salamander has external gills and remains aquatic as an adult.']},
 {id:2,groupId:2,names:['Tigerhai','Requin-tigre','Tiger shark'],latin:'Galeocerdo cuvier',water:1,habitat:['Tropische und subtropische Meere','Mers tropicales et subtropicales','Tropical and subtropical seas'],description:[
 'Lebt in tropischen und subtropischen Meeren, häufig in Küstennähe. Die dunklen Querstreifen junger Tiere verblassen mit dem Alter.',
 'Il vit dans les mers tropicales et subtropicales, souvent près des côtes. Les bandes sombres des jeunes requins s’estompent avec l’âge.',
 'It lives in tropical and subtropical seas, often near the coast. The dark stripes of young sharks fade with age.']},
 {id:3,groupId:3,names:['Blobfisch','Poisson-goutte','Blobfish'],latin:'Psychrolutes microporos',water:1,habitat:['Tiefsee des Südwestpazifiks','Profondeurs du Pacifique Sud-Ouest','Deep southwest Pacific'],description:[
 'Lebt in der Tiefsee des Südwestpazifiks. Das bekannte Exemplar «Mr Blobby» wurde in über 1’000 Metern Tiefe gefangen.',
 'Il vit dans les profondeurs du Pacifique Sud-Ouest. Le célèbre spécimen « Mr Blobby » a été capturé à plus de 1 000 mètres de profondeur.',
 'It lives in the deep waters of the southwest Pacific. The well-known specimen “Mr Blobby” was caught at a depth of over 1,000 metres.']},
 {id:4,groupId:3,names:['Erbsenkugelfisch','Tétraodon nain','Pea puffer'],latin:'Carinotetraodon travancoricus',water:0,habitat:['Süssgewässer in Südwestindien','Eaux douces du sud-ouest de l’Inde','Fresh waters of southwest India'],description:[
 'Lebt in Süssgewässern in Südwestindien. Er ist ein kleiner Kugelfisch und frisst unter anderem kleine Schnecken.',
 'Il vit dans les eaux douces du sud-ouest de l’Inde. Ce petit poisson-globe se nourrit entre autres de petits escargots.',
 'It lives in fresh waters in southwest India. This small pufferfish feeds on small snails, among other prey.']},
 {id:5,groupId:3,names:['Laternenfisch','Poisson-lanterne','Lanternfish'],latin:'Myctophum phengodes',water:1,habitat:['Offenes Meer','Haute mer','Open ocean'],description:[
 'Lebt im offenen Meer und besitzt kleine Leuchtorgane am Körper.',
 'Il vit en haute mer et porte de petits organes lumineux sur le corps.',
 'It lives in the open ocean and has small light-producing organs on its body.']},
 {id:6,groupId:3,names:['Riemenfisch (Heringskönig)','Régalec','Giant oarfish'],latin:'Regalecus glesne',water:1,habitat:['Tieferes Wasser im offenen Meer','Eaux profondes au large','Deep offshore waters'],description:[
 'Lebt in tieferem Wasser im offenen Meer. Er hat einen langen, bandförmigen Körper und schwimmt mithilfe seiner langen Rückenflosse.',
 'Il vit dans les eaux profondes du large. Son corps est long et rubané, et sa longue nageoire dorsale assure sa propulsion.',
 'It lives in deeper offshore waters. It has a long, ribbon-like body and swims by moving its long dorsal fin.']},
 {id:7,groupId:3,names:['Atlantischer Blauflossen-Thunfisch','Thon rouge de l’Atlantique','Atlantic bluefin tuna'],latin:'Thunnus thynnus',water:1,habitat:['Atlantik und Mittelmeer','Atlantique et Méditerranée','Atlantic and Mediterranean'],description:[
 'Lebt im Atlantik und im Mittelmeer. Er ist ein grosser Raubfisch, der weite Strecken im offenen Meer zurücklegt.',
 'Il vit dans l’Atlantique et en Méditerranée. Ce grand prédateur parcourt de longues distances en haute mer.',
 'It lives in the Atlantic and the Mediterranean. This large predator travels long distances across the open ocean.']},
 {id:8,groupId:4,names:['Gewöhnlicher Oktopus','Poulpe commun','Common octopus'],latin:'Octopus vulgaris',water:1,habitat:['Ostatlantik und Mittelmeer','Atlantique oriental et Méditerranée','Eastern Atlantic and Mediterranean'],description:[
 'Lebt in Küstengewässern des östlichen Atlantiks und des Mittelmeers. Er hat acht Arme und kann seine Hautfarbe zur Tarnung ändern.',
 'Il vit dans les eaux côtières de l’Atlantique oriental et de la Méditerranée. Il possède huit bras et peut changer la couleur de sa peau pour se camoufler.',
 'It lives in coastal waters of the eastern Atlantic and Mediterranean. It has eight arms and can change its skin colour for camouflage.']}
];
// Each sale record references one species. A species derives its group from speciesRows.
const seedArticles=[
 {id:'tier-1',speciesId:1,price:52},{id:'tier-2',speciesId:2,price:15000},
 {id:'tier-3',speciesId:3,price:2500},{id:'tier-4',speciesId:4,price:16.49},
 {id:'tier-5',speciesId:5,price:350},{id:'tier-6',speciesId:6,price:8000},
 {id:'tier-7',speciesId:7,price:4500},{id:'tier-8',speciesId:8,price:250}
].map(a=>({...a,stock:10,old:0}));
const tx=a=>tr(...a);
const groupById=id=>groupRows.find(g=>g.id===id);
const speciesById=id=>speciesRows.find(s=>s.id===id);
const catKeys=groupRows.map(g=>g.key);
const catNames=()=>groupRows.map(g=>tx(g.names));
const catTitle=c=>tx(groupRows.find(g=>g.key===c).names);
const styleNames=()=>[tr('Süsswasser','Eau douce','Freshwater'),tr('Meerwasser','Eau de mer','Marine')];
const articleRecords=()=>read('wildlifeArticles',seedArticles);
function products(){return articleRecords().map(a=>{
 const s=speciesById(a.speciesId),g=groupById(s.groupId);
 return {...a,name:tx(s.names),latin:s.latin,c:g.key,brand:tx(g.names),style:s.water,variants:['1 ×'],desc:a.desc||s.description,image:a.image||'wildlife/'+s.id+'.jpg',species:s,group:g};
})}

const money=v=>'CHF '+Number(v).toFixed(2).replace(/\B(?=(\d{3})+\.)/g,'’');
function updateCatalogueStorage(){
 const state=readShop();if(state.wildlifeVersion)return;
 // Gear records stay available in the archive, including previous admin edits.
 const ids=new Set(seedArticles.map(a=>a.id));
 const older=(state.cart||[]).filter(l=>!ids.has(l.id));
 if(older.length)state.archivedCart=older;
 state.cart=(state.cart||[]).filter(l=>ids.has(l.id));
 for(const key of ['fav','compare']){
  if(Array.isArray(state[key])){state['archived_'+key]=state[key].filter(id=>!ids.has(id));state[key]=state[key].filter(id=>ids.has(id))}
 }
 state.wildlifeVersion=1;localStorage.setItem('ww.store',JSON.stringify(state));
}
updateCatalogueStorage();

