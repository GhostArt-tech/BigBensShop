
const equipmentMeasures={
 r1:[[210,122],[240,137]],r2:[[243.8,84],[274.3,94]],
 m1:[[12,235],[13,255]],m2:[[13,272],[14,298]],
 l1:[[7.5,8],[7.5,8]],l2:[[8,5],[8,5]],
 g1:[[32,540],[32,540]],g2:[[18,130],[18,130]],f1:[[10,100]], g3:[[12,80]], f2:[[14,100]]
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
 return `<div class="measurePanel" id="measurePanel"><dl><div><dt>${tr('Länge','Longueur','Length')}</dt><dd>${esc(data.length)}</dd></div><div><dt>${tr('Gewicht','Poids','Weight')}</dt><dd>${esc(data.weight)}</dd></div></dl><small>${source?ref(source.url,source.source)+(source.weightUrl?' · '+ref(source.weightUrl,source.weightSource):''):p.id==='f1'?tr('Beispieldaten · Dosenhöhe und Nettofüllgewicht','Exemple · hauteur du contenant et poids net','Sample specifications · container height and net contents'):p.id==='f2'?tr('Beispieldaten · Dosenhöhe und Nettofüllgewicht','Exemple · hauteur du contenant et poids net','Sample specifications · container height and net contents'):tr('Beispieldaten des Demoartikels','Caractéristiques indicatives de démonstration','Sample specifications for this demo item')}</small></div>`;
}
document.addEventListener('change',e=>{if(e.target.name!=='variant')return;const p=item(e.target.form?.dataset.id);if(p&&!p.speciesId&&$('#measurePanel'))$('#measurePanel').outerHTML=dimensionPanel(p,p.variants.indexOf(e.target.value))});
// Diesen ganzen Block am Ende von specs.js einfügen.
// Pro Artikel: ID, Name, CHF, Bestand, Variante, Länge in cm, Gewicht in g,
// Bild-ID, Angelart und Beschreibungen auf Deutsch, Französisch und Englisch.
// Bei Futter stehen die Masse für Dosenhöhe und Nettofüllgewicht.
{
  const sortiment = {
    food: [
      ['f-mikro', 'Mikrogranulat', 9.90, 24, '80 g', 8, 80, 'f3', -1,
        'Langsam sinkendes Feingranulat für kleine Aquarienfische.', 'Microgranulés à descente lente pour petits poissons.', 'Slow-sinking micro granules for small aquarium fish.'],
      ['f-algen', 'Spirulina-Algentabs', 12.50, 18, '120 g', 10, 120, 'f4', -1,
        'Sinkende Futtertabletten mit Spirulina für pflanzenfressende Bodenfische.', 'Pastilles à la spiruline pour poissons de fond herbivores.', 'Sinking spirulina tablets for herbivorous bottom feeders.'],
      ['f-teich', 'Teichsticks', 14.90, 15, '250 g', 17, 250, 'f5', -1,
        'Schwimmende Futtersticks für Teichfische, die an der Oberfläche fressen.', 'Bâtonnets flottants pour poissons de bassin se nourrissant en surface.', 'Floating sticks for surface-feeding pond fish.']
    ],
    rods: [
      ['r-barsch', 'Barsch UL 180', 79, 8, '1,80 m · 1–7 g', 180, 82, 'r3', 0,
        'Kurze, leichte Spinnrute für kleine Barschköder.', 'Canne ultralégère pour petits leurres à perche.', 'Ultralight spinning rod for small perch lures.'],
      ['r-zander', 'Zander Jig 270', 149, 6, '2,70 m · 15–50 g', 270, 165, 'r4', 0,
        'Straffe Uferjigrute für Gummifische und direkte Köderführung.', 'Canne ferme pour manier les leurres souples depuis la berge.', 'Fast-action shore jigging rod for soft plastics.'],
      ['r-feeder', 'Feeder 360', 119, 10, '3,60 m · bis 90 g', 360, 245, 'r5', 2,
        'Grundrute mit sensibler Spitze zum Fischen mit Futterkorb.', 'Canne à scion sensible pour la pêche au feeder.', 'Feeder rod with a sensitive tip for bite detection.'],
      ['r-reise', 'Reiserute VierTeiler', 99, 7, '2,40 m · 10–30 g', 240, 148, 'r6', 0,
        'Vierteilige Spinnrute, die zerlegt in den Reisekoffer passt.', 'Canne spinning en quatre brins pour les voyages.', 'Four-piece travel spinning rod that packs into a suitcase.'],
      ['r-nymphe', 'Nymphenrute 305', 179, 5, '3,05 m · Klasse 3', 305, 98, 'r7', 1,
        'Lange Fliegenrute für die kontrollierte Drift einer Nymphe.', 'Longue canne à mouche pour contrôler la dérive d’une nymphe.', 'Long fly rod for controlling a drifting nymph.']
    ],
    reels: [
      ['m-bach', 'Bachrolle 1000', 54.90, 12, '1000', 10, 182, 'm3', 0,
        'Kompakte Stationärrolle für leichte Ruten und feine Schnur.', 'Moulinet compact pour cannes légères et lignes fines.', 'Compact spinning reel for light rods and fine line.'],
      ['m-match', 'Matchrolle 3000', 84, 9, '3000 · flache Spule', 12, 245, 'm4', 2,
        'Die flache Spule fasst feine Monofilschnur für das Posenfischen.', 'Bobine peu profonde pour nylon fin et pêche au flotteur.', 'Shallow-spool reel for fine monofilament and float fishing.'],
      ['m-frei', 'Freilaufrolle 5000', 109, 7, '5000 · Freilauf', 15, 395, 'm5', 2,
        'Zuschaltbarer Freilauf für das Grundangeln auf Karpfen.', 'Moulinet débrayable pour la pêche de la carpe au posé.', 'Baitrunner-style reel for carp fishing with static baits.'],
      ['m-kueste', 'Küstenrolle 4000', 135, 6, '4000 · Frontbremse', 14, 295, 'm6', 0,
        'Stationärrolle mit grossem Spulenkopf für weite Würfe vom Ufer.', 'Moulinet à large bobine pour les longs lancers du bord.', 'Wide-spool spinning reel for long casts from shore.']
    ],
    lures: [
      ['l-spinner', 'Kupferblatt-Spinner', 6.90, 30, 'Kupfer · Grösse 2', 5, 6, 'l3', 0,
        'Das rotierende Kupferblatt erzeugt beim Einholen Druckwellen.', 'La palette cuivrée tourne et vibre à la récupération.', 'The copper blade spins and vibrates on the retrieve.'],
      ['l-krebs', 'Gummikrebs 65', 8.90, 22, '4 Stück · Oliv', 6.5, 4, 'l4', 0,
        'Weicher Krebs mit beweglichen Scheren. Masse und Gewicht gelten je Köder.', 'Écrevisse souple à pinces mobiles. Dimensions et poids par leurre.', 'Soft craw with moving claws. Measurements are per lure.'],
      ['l-popper', 'Oberflächenpopper 60', 11.90, 16, 'Froschgrün', 6, 8, 'l5', 0,
        'Die konkave Stirn verdrängt bei kurzen Zügen Wasser an der Oberfläche.', 'La tête concave projette de l’eau à chaque tirée en surface.', 'The cupped face splashes water with each short tug.']
    ],
    gear: [
      ['g-rutenfutteral', 'Rutenfutteral Duo', 39, 10, '125 cm · zwei Fächer', 125, 480, 'g4', 2,
        'Gepolsterte Tasche mit getrennten Fächern für zwei zerlegte Ruten.', 'Fourreau rembourré à deux compartiments pour cannes démontées.', 'Padded two-compartment case for disassembled rods.'],
      ['g-rollentasche', 'Rollentasche Neopren', 14.90, 18, 'Grösse M', 17, 85, 'g5', 2,
        'Weiche Hülle zum Schutz der Angelrolle beim Transport.', 'Housse souple pour protéger le moulinet pendant le transport.', 'Soft pouch that protects a reel in transit.'],
      ['g-vorfach', 'Vorfachmappe', 12.90, 20, '10 Innenhüllen', 16, 70, 'g6', 2,
        'Flache Mappe mit zehn Hüllen für vorbereitete Vorfächer.', 'Pochette plate à dix enveloppes pour bas de ligne montés.', 'Flat wallet with ten sleeves for ready-tied leaders.'],
      ['g-watguertel', 'Watgürtel mit Tasche', 29, 9, 'Verstellbar bis 120 cm', 120, 210, 'g7', 2,
        'Breiter Gürtel mit abnehmbarer Tasche für kleines Zubehör.', 'Ceinture large avec pochette amovible pour petits accessoires.', 'Wide wading belt with a detachable accessory pouch.'],
      ['g-packsack', 'Rollverschluss-Packsack', 24.90, 14, '5 Liter', 34, 125, 'g8', 2,
        'Packsack mit Rollverschluss für Wechselkleidung und persönliche Dinge.', 'Sac à fermeture enroulable pour vêtements et effets personnels.', 'Roll-top bag for spare clothing and personal items.']
    ]
  };

  for (const [kategorie, artikel] of Object.entries(sortiment)) {
    for (const [id, name, price, stock, variante, cm, gramm, photoId, style, de, fr, en] of artikel) {
      if (gearArchive.some(produkt => produkt.id === id)) continue;
      gearArchive.push({
        id, name, price, stock, photoId, style,
        c: kategorie, brand: 'BigBenShop', old: 0,
        variants: [variante], desc: [de, fr, en]
      });
      equipmentMeasures[id] = [[cm, gramm]];
    }
  }
}

