'use strict';
const animalMeasurements = {
  "1": {
    "length": "Im Mittel rund 23 cm",
    "weight": "56–226 g",
    "lengthFR": "En moyenne, environ 23 cm",
    "weightFR": "56–226 g",
    "lengthEN": "About 23 cm on average",
    "weightEN": "56–226 g",
    "source": "San Diego Zoo Wildlife Alliance",
    "url": "https://animals.sandiegozoo.org/animals/axolotl"
  },
  "2": {
    "length": "Häufig 3,25–4,25 m",
    "weight": "Etwa 385–635 kg",
    "lengthFR": "Souvent 3,25–4,25 m",
    "weightFR": "Environ 385–635 kg",
    "lengthEN": "Commonly 3.25–4.25 m",
    "weightEN": "About 385–635 kg",
    "source": "Florida Museum of Natural History",
    "url": "https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/tiger-shark/"
  },
  "3": {
    "length": "29,5 cm ohne Schwanzflosse beim abgebildeten Typusexemplar",
    "weight": "Rund 850 g im Mittel bei zwei Tieren der NORFANZ-Expedition",
    "lengthFR": "29,5 cm sans la nageoire caudale pour le spécimen type photographié",
    "weightFR": "Environ 850 g en moyenne pour deux individus de l’expédition NORFANZ",
    "lengthEN": "29.5 cm excluding the tail fin in the pictured type specimen",
    "weightEN": "About 850 g on average for two specimens from the NORFANZ expedition",
    "source": "Museum of New Zealand Te Papa Tongarewa",
    "url": "https://collections.tepapa.govt.nz/object/186533",
    "weightSource": "NIWA · NORFANZ, Appendix 4",
    "weightUrl": "https://docs.niwa.co.nz/library/public/NZAEBR28.pdf"
  },
  "4": {
    "length": "1,3–3,0 cm Gesamtlänge bei 30 untersuchten Tieren",
    "weight": "0,087–1,1 g in derselben Stichprobe",
    "lengthFR": "1,3–3,0 cm de longueur totale chez 30 individus étudiés",
    "weightFR": "0,087–1,1 g dans le même échantillon",
    "lengthEN": "1.3–3.0 cm total length in a sample of 30 fish",
    "weightEN": "0.087–1.1 g in the same sample",
    "source": "Prasad, Sabu & Prathibhakumari (2012), Tab. 1",
    "url": "https://www.researchtrend.net/jnbr/jnbr/VOL%201%282%29%202012/3%20Prasad%20et%20al%2C%202012.pdf"
  },
  "5": {
    "length": "8,7 cm bei einem untersuchten Exemplar",
    "weight": "8,8 g Frischgewicht beim selben Exemplar",
    "lengthFR": "8,7 cm pour un spécimen étudié",
    "weightFR": "8,8 g de masse fraîche pour ce même spécimen",
    "lengthEN": "8.7 cm in one measured specimen",
    "weightEN": "8.8 g wet weight in the same specimen",
    "source": "Landry, Hood & Davies (2020)",
    "url": "https://doi.org/10.3354/meps13444"
  },
  "6": {
    "length": "Häufig etwa 3 m Gesamtlänge",
    "weight": "Bis 272 kg laut publiziertem Höchstwert",
    "lengthFR": "Souvent environ 3 m de longueur totale",
    "weightFR": "Jusqu’à 272 kg selon le maximum publié",
    "lengthEN": "Commonly about 3 m total length",
    "weightEN": "Up to 272 kg, the published maximum",
    "source": "Florida Museum of Natural History",
    "url": "https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/oarfish/"
  },
  "7": {
    "length": "Bis etwa 4 m",
    "weight": "Bis etwa 900 kg",
    "lengthFR": "Jusqu’à environ 4 m",
    "weightFR": "Jusqu’à environ 900 kg",
    "lengthEN": "Up to about 4 m",
    "weightEN": "Up to about 900 kg",
    "source": "NOAA Fisheries",
    "url": "https://www.fisheries.noaa.gov/species/western-atlantic-bluefin-tuna"
  },
  "8": {
    "length": "Meist 10–20 cm Mantellänge (ohne Kopf und Arme)",
    "weight": "Meist 1–3 kg",
    "lengthFR": "Généralement 10–20 cm de manteau (hors tête et bras)",
    "weightFR": "Généralement 1–3 kg",
    "lengthEN": "Commonly 10–20 cm mantle length (excluding head and arms)",
    "weightEN": "Commonly 1–3 kg",
    "source": "FAO · Octopus vulgaris",
    "url": "https://www.fao.org/4/x0169f/x0169f80.pdf"
  },
  "9": {
  "length": "2-3 m",
  "weight": "160-200 kg",
  "lengthFR": "2-3 m",
  "weightFR": "160-200 kg",
  "lengthEN": "2-3 m",
  "weightEN": "160–200 kg",
  "source": "Smithsonian’s National Zoo",
  "url": "https://www.nationalzoo.si.edu/animals/arapaima"
},

"10": {
  "length": "10–15 cm",
  "weight": "20–50 g",
  "lengthFR": "10–15 cm",
  "weightFR": "20–50 g",
  "lengthEN": "10–15 cm",
  "weightEN": "20–50 g",
  "source": "Schätzwerte für ausgewachsene Longfin Albino Bristlenose Plecos",
  "url": ""
},
"11": {
  "length": "20–30 cm",
  "weight": "200–500 g",
  "lengthFR": "20–30 cm",
  "weightFR": "200–500 g",
  "lengthEN": "20–30 cm",
  "weightEN": "200–500 g",
  "source": "Schätzwerte für ausgewachsene Prachtschmerlen",
  "url": ""
},
"12": {
  "length": "10–13 cm",
  "weight": "20–50 g",
  "lengthFR": "10–13 cm",
  "weightFR": "20–50 g",
  "lengthEN": "10–13 cm",
  "weightEN": "20–50 g",
  "source": "Schätzwerte für ausgewachsene Cobalt Blue Zebra Cichliden",
  "url": ""
}
};
