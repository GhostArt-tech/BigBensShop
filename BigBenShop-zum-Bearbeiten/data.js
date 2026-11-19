'use strict';
const langs=['de','fr','en'];
const tr=(de,fr,en)=>[de,fr,en][langs.indexOf(lang)]||de;
const readShop=()=>{try{return JSON.parse(localStorage.getItem('ww.store'))||{}}catch{return {}}};
const read=(key,fb)=>readShop()[key]??fb;
const put=(key,value)=>localStorage.setItem('ww.store',JSON.stringify({...readShop(),[key]:value}));
let lang=read('lang','de'); if(!langs.includes(lang))lang='de';

const gearArchive=[
['r1','rods','BigBenShop','Alpine Spin',129,159,0,['2.10 m','2.40 m'],['Leichte, zweiteilige Carbonrute mit schneller Spitze und griffigem Korkhandteil. Für präzise Würfe mit Ködern von 5–21 g.','Canne légère en carbone en deux brins, poignée en liège. Pour les leurres de 5 à 21 g.','Light two-piece carbon rod with a fast tip and cork grip. Designed for 5–21 g lures.']],
['m1','reels','Aare','Drift 2500',99,0,0,['2500','3000'],['Fein einstellbare Frontbremse, leichtgängiger Lauf und eine flache Aluminiumspule für lange Würfe.','Frein avant progressif et bobine en aluminium pour des lancers précis.','A smooth front drag and shallow aluminium spool for controlled, long casts.']],
['l1','lures','Seebach','Minnow 75',14.9,19.9,0,['Perch','Silver'],['Schwebender Wobbler mit lebhaftem Lauf. 7.5 cm lang, 8 g schwer und ideal für flache Uferzonen.','Poisson nageur suspending de 7,5 cm et 8 g, idéal près des berges.','A lively suspending minnow. Its 7.5 cm body and 8 g weight suit shallow banks.']],
['g1','gear','BigBenShop','River Pack',69,0,2,['Olive','Graphite'],['Kompakte Angeltasche mit verstellbarem Gurt und übersichtlichen Fächern für deine Köderboxen.','Sac compact avec bandoulière réglable et compartiments pour boîtes à leurres.','Compact tackle bag with an adjustable strap and organised tackle compartments.']],
['r2','rods','Seebach','Creek Fly',189,0,1,['8 ft · #4','9 ft · #5'],['Vierteilige Fliegenrute für feine Präsentationen an Bächen und kleinen Flüssen.','Canne à mouche en quatre brins pour les petites rivières.','Four-piece fly rod for delicate presentations on streams and small rivers.']],
['m2','reels','BigBenShop','Lake Runner',119,139,2,['3000','4000'],['Robuste Stationärrolle mit kräftigem Getriebe und grosser Schnurfassung für den See.','Moulinet robuste à grande capacité pour la pêche en lac.','A durable fixed-spool reel with high line capacity for lake fishing.']],
['l2','lures','Aare','Stream Shad',9.9,0,0,['Amber','Green'],['Drei weiche Gummifische mit beweglichem Schaufelschwanz für Barsch und Zander.','Trois leurres souples à queue paddle pour la perche et le sandre.','Three paddle-tail soft lures for perch and zander.']],
['g2','gear','Seebach','Tackle Pouch',34,0,2,['Olive','Sand'],['Kleine Zubehörtasche mit Reissverschluss und Innenfächern für einen kurzen Angeltag.','Petite pochette zippée pour organiser les accessoires.','Small zippered organiser for essential tackle on short outings.']]
].map(([id,c,brand,name,price,old,style,variants,desc],i)=>({id,c,brand,name,price,old,style,variants,desc,stock:[18,12,32,9,6,7,23,11][i]}));

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const actions={search:'<circle cx="10.5" cy="10.5" r="6.8"/><path d="m16 16 5 5"/>',heart:'<path d="M20.8 4.9c-2.4-2.3-6-1.7-8.8 1.6-2.8-3.3-6.4-3.9-8.8-1.6-2.8 2.7-2.2 6.5.5 9.3L12 22l8.3-7.8c2.7-2.8 3.3-6.6.5-9.3Z"/>',user:'<circle cx="12" cy="7.5" r="3.8"/><path d="M4 21c.4-5 3.2-7 8-7s7.6 2 8 7"/>',bag:'<path d="M4 8h16l1 13H3L4 8Z"/><path d="M8.5 9V6a3.5 3.5 0 0 1 7 0v3"/>',truck:'<path d="M2 5h12v12H2zm12 4h4l4 5v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',tag:'<path d="m3 12 9-9h8v8l-9 10-8-9Z"/><circle cx="16" cy="7" r="1"/>',sliders:'<path d="M3 7h18M3 17h18"/><circle cx="9" cy="7" r="2.5" fill="currentColor"/><circle cx="15" cy="17" r="2.5" fill="currentColor"/>',box:'<path d="m3 7 9-4 9 4v10l-9 5-9-5V7Zm0 0 9 5 9-5m-9 5v10"/>',check:'<path d="m4 12 5 5L20 6"/>',plus:'<path d="M12 4v16M4 12h16"/>',globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>'};
const ic=(name,size=21)=>'<svg aria-hidden="true" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+actions[name]+'</svg>';
const logo=()=>'<a class="logo bigbenLogo" href="#home" aria-label="BigBenShop"><img src="favicon.svg" width="42" height="42" alt=""><span>BigBen<i>Shop</i></span></a>';
const photo=(src,alt,cls='')=>'<img class="'+cls+'" src="'+esc(src)+'" alt="'+esc(alt)+'" loading="lazy">';
const cart=()=>read('cart',[]),fav=()=>read('fav',[]),comp=()=>read('compare',[]);
const baseReviews={r1:[5,4,5],m1:[5,5],l1:[4,5,5],g1:[5,4],r2:[5],m2:[4],l2:[4,5],g2:[5]};
const reviews=id=>[...(baseReviews[id]||[]).map(score=>({score,demo:true})),...read('reviews',[]).filter(r=>r.id===id)];
const stars=id=>{const r=reviews(id);return r.length?'★ '+(r.reduce((n,x)=>n+x.score,0)/r.length).toFixed(1)+' <small>('+r.length+')</small>':'—'};
if(!sessionStorage.getItem('ww.visit')){put('visits',read('visits',0)+1);sessionStorage.setItem('ww.visit','1')}


