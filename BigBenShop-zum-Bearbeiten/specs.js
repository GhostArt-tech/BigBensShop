
const equipmentMeasures={
 r1:[[210,122],[240,137]],r2:[[243.8,84],[274.3,94]],
 m1:[[12,235],[13,255]],m2:[[13,272],[14,298]],
 l1:[[7.5,8],[7.5,8]],l2:[[8,5],[8,5]],
 g1:[[32,540],[32,540]],g2:[[18,130],[18,130]],f1:[[10,100]], g3:[[12,80]]
};
function dimensionFacts(p,index=0){
 const langKey=lang==='de'?'':lang.toUpperCase();
 if(p.speciesId){const s=animalMeasurements[p.speciesId];return {length:s['length'+langKey]||s.length,weight:s['weight'+langKey]||s.weight}}
 const v=equipmentMeasures[p.id]?.[index]||equipmentMeasures[p.id]?.[0];
 return {length:v?v[0]+' cm':'—',weight:v?v[1]+' g':'—'};
}
function dimensionPanel(p,index=0){
 const data=dimensionFacts(p,index),source=p.speciesId&&animalMeasurements[p.speciesId];
 const ref=(url,title)=>`<a href="${esc(url)}" rel="noreferrer" target="_blank">${esc(title)}</a>`;
 return `<div class="measurePanel" id="measurePanel"><dl><div><dt>${tr('Länge','Longueur','Length')}</dt><dd>${esc(data.length)}</dd></div><div><dt>${tr('Gewicht','Poids','Weight')}</dt><dd>${esc(data.weight)}</dd></div></dl><small>${source?ref(source.url,source.source)+(source.weightUrl?' · '+ref(source.weightUrl,source.weightSource):''):p.id==='f1'?tr('Beispieldaten · Dosenhöhe und Nettofüllgewicht','Exemple · hauteur du contenant et poids net','Sample specifications · container height and net contents'):tr('Beispieldaten des Demoartikels','Caractéristiques indicatives de démonstration','Sample specifications for this demo item')}</small></div>`;
}
document.addEventListener('change',e=>{if(e.target.name!=='variant')return;const p=item(e.target.form?.dataset.id);if(p&&!p.speciesId&&$('#measurePanel'))$('#measurePanel').outerHTML=dimensionPanel(p,p.variants.indexOf(e.target.value))});

