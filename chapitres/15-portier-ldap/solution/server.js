// L'Auberge du Pixel - Chapitre 15 : le Portier - SOLUTION

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

const ANNUAIRE = [
  { uid: 'gardien', motDePasse: 'pixel123', role: 'Gardien', secret: null },
  { uid: 'gru-admin', motDePasse: 'T4verne-du-Pixel!', role: 'Tavernier',
    secret: 'Coffre maitre : 7-1-4. La cle de la cave est sous la troisieme latte.' }
];

function sousFiltres(s) {
  const out = []; let profondeur = 0; let debut = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') { if (profondeur === 0) debut = i; profondeur++; }
    else if (s[i] === ')') { profondeur--; if (profondeur === 0) out.push(s.slice(debut, i + 1)); }
  }
  return out;
}
function correspond(entree, filtre) {
  filtre = filtre.trim();
  if (filtre.startsWith('(&')) return sousFiltres(filtre.slice(2, -1)).every((f) => correspond(entree, f));
  if (filtre.startsWith('(|')) return sousFiltres(filtre.slice(2, -1)).some((f) => correspond(entree, f));
  const m = filtre.match(/^\(([^=()]+)=(.*)\)$/);
  if (!m) return false;
  const val = m[2]; const valeurEntree = entree[m[1]];
  if (valeurEntree == null) return false;
  if (val === '*') return true;
  if (val.includes('*')) {
    const motif = '^' + val.split('*').map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$';
    return new RegExp(motif).test(String(valeurEntree));
  }
  return String(valeurEntree) === val;
}
function chercher(filtre) { return ANNUAIRE.filter((e) => correspond(e, filtre)); }

// CORRIGE : on echappe les metacaracteres LDAP de l'entree avant de l'inserer dans
// le filtre. Le caractere * (entre autres) perd alors son pouvoir special : il est
// traite comme un caractere ordinaire, pas comme un joker.
function echapperLdap(valeur) {
  return String(valeur)
    .replace(/\\/g, '\\5c')
    .replace(/\*/g, '\\2a')
    .replace(/\(/g, '\\28')
    .replace(/\)/g, '\\29')
    .replace(/\u0000/g, '\\00');
}

app.get('/', (req, res) => { res.render('portier', { resultat: null, uid: '' }); });

app.post('/entrer', (req, res) => {
  const uid = req.body.uid || '';
  const motDePasse = req.body.motDePasse || '';
  const filtre = `(&(uid=${echapperLdap(uid)})(motDePasse=${echapperLdap(motDePasse)}))`;
  const trouve = chercher(filtre);
  const resultat = trouve.length > 0
    ? { ok: true, filtre, entree: trouve[0] }
    : { ok: false, filtre, entree: null };
  res.render('portier', { resultat, uid });
});

app.listen(PORT, () => { console.log(`Le Portier ouvert sur le port ${PORT}`); });
