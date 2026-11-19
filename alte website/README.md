# BigBensShop

## Lokal starten

Im Projektordner mit Node.js ab Version 20 `node server.js` ausführen und die im Terminal angezeigte HTTP-Adresse öffnen. Der Standardport ist 3000. Das Terminal zeigt auch den absoluten Pfad des verwendeten Datenordners an.

## Inhalte ändern

| Datei | Inhalt |
| --- | --- |
| `data/products.json` | Artikelstamm als Liste. Jeder Artikel hat einen `name`. `category`, `description`, `priceCHF` (Zahl) und `imageUrl` steuern die Artikelkarte. |
| `data/groups.json` | Tiergruppen mit `id` und `name`. Der Filter berücksichtigt die `tiergruppeId` des Artikels sowie seine Kategorie. |
| `data/legal.json` | Impressum im Feld `imprint`, AGB im Feld `terms`. Die mitgelieferten Texte sind Muster. |
| `examples/products.example.json` | Beispielkatalog zum Kopieren nach `data/products.json`. |
| `data/marketplace.json` | Vom Server verwaltete Konten, Sitzungen und Community-Angebote. |

JSON als UTF-8 speichern. Die API liest die Dateien bei jeder Anfrage. Ein sichtbarer Browsertab lädt Änderungen alle fünf Sekunden, beim Zurückwechseln und über **Aktualisieren**. Bei fehlerhaftem JSON zeigt die betroffene Ansicht eine Meldung und behält ihre letzte gültige Anzeige. Nach der Korrektur lädt sie wieder automatisch.

Zum Prüfen eines geänderten Artikels im selben Browser `/api/v1/products` öffnen. Zeigt die API andere Werte, den beim Serverstart ausgegebenen Datenpfad mit dem bearbeiteten Ordner vergleichen.

Lokale Artikelbilder unter `public/images` ablegen und zum Beispiel mit `"imageUrl": "/images/forelle.svg"` referenzieren. Erlaubt sind SVG, JPG, JPEG, PNG und WEBP mit Buchstaben, Ziffern, Bindestrichen und Unterstrichen im Dateinamen. Die mitgelieferten Fotos liegen als JPG im Projekt. Urheber, Lizenz und Quelle sind in den Artikeldetails verlinkt. Bei einem fehlenden Bild erscheint eine Fischillustration.

## API

Alle Pfade beginnen mit `/api/v1`. POST-Anfragen verwenden JSON. Für Konten und Angebote nutzt das Frontend das Sitzungscookie des Servers.

| Methode | Pfad | Zweck |
| --- | --- | --- |
| GET | `/products`, `/groups` | Artikelstamm mit Community-Artikeln und Tiergruppen abrufen |
| GET | `/legal/imprint`, `/legal/terms` | Impressum oder AGB als `content` abrufen |
| POST | `/auth/register`, `/auth/login`, `/auth/logout` | Konto anlegen, anmelden oder abmelden |
| GET | `/auth/me`, `/offers` | Angemeldete Person oder öffentliche Angebote abrufen |
| POST | `/offers` | Angebot mit `title`, `description`, `category`, `priceCHF` und optional `imageDataUrls` erstellen (angemeldet) |
| DELETE | `/offers/{id}` | Eigenes Angebot löschen (Admins dürfen alle Angebote löschen) |

Pro Angebot sind bis zu vier Fotos als Base64-Data-URLs in JPG, PNG oder WEBP mit je maximal 2 MiB möglich. Das erste Foto ist das Titelbild. Bestehende Clients können weiterhin ein einzelnes Foto als `imageDataUrl` senden.
