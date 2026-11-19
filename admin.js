// Lokaler Admin-Befehl: node admin.js email@beispiel.ch
// Nur Personen mit direktem Zugriff auf den Server können Rollen vergeben.
const fs = require('node:fs');
const path = require('node:path');
const filename = path.join(__dirname, 'data', 'marketplace.json');
const email = (process.argv[2] || '').trim().toLowerCase();
if (!email) { console.error('Verwendung: node admin.js email@beispiel.ch'); process.exit(1); }
const db = JSON.parse(fs.readFileSync(filename, 'utf8'));
const user = (db.users || []).find(u => u.email === email);
if (!user) { console.error('Konto nicht gefunden. Zuerst registrieren.'); process.exit(1); }
user.role = 'admin';
fs.writeFileSync(filename, JSON.stringify(db, null, 2) + '\n');
console.log('Admin gesetzt:', email);
