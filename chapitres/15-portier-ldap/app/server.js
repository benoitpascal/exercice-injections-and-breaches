// L'Auberge du Pixel - Chapitre 15 : le Portier
// Application VOLONTAIREMENT vulnerable (injection LDAP), a usage pedagogique uniquement.
//
// Pour rester sans serveur LDAP a installer, l'annuaire est ici un petit moteur en
// JS pur qui evalue un filtre LDAP (avec les operateurs &, |, =, et le caractere
// special *). La faille est la meme que sur un vrai annuaire : on construit le
// filtre en collant l'entree de l'utilisateur, donc ses caracteres speciaux
// changent le sens du filtre.

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// L'annuaire de l'auberge (l'equivalent des entrees d'un serveur LDAP).
const ANNUAIRE = [
  { uid: 'gardien', motDePasse: 'pixel123', role: 'Gardien', secret: null },
  { uid: 'gru-admin', motDePasse: 'T4verne-du-Pixel!', role: 'Tavernier',
    secret: 'Coffre maitre : 7-1-4. La cle de la cave est sous la troisieme latte.' }
];

// Extrait les sous-filtres de premier niveau d'une chaine comme "(a=b)(c=d)".
function sousFiltres(s) {
  const out = [];
  let profondeur = 0;
  let debut = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') { if (profondeur === 0) debut = i; profondeur++; }
    else if (s[i] === ')') { profondeur--; if (profondeur === 0) out.push(s.slice(debut, i + 1)); }
  }
  return out;
}

// Evalue si une entree correspond a un filtre LDAP (sous-ensemble : &, |, =, *).
function correspond(entree, filtre) {
  filtre = filtre.trim();
  if (filtre.startsWith('(&')) {
    return sousFiltres(filtre.slice(2, -1)).every((f) => correspond(entree, f));
  }
  if (filtre.startsWith('(|')) {
    return sousFiltres(filtre.slice(2, -1)).some((f) => correspond(entree, f));
  }
  const m = filtre.match(/^\(([^=()]+)=(.*)\)$/);
  if (!m) return false;
  const attr = m[1];
  const val = m[2];
  const valeurEntree = entree[attr];
  if (valeurEntree == null) return false;
  // Le caractere special * de LDAP : presence (n'importe quelle valeur) ou jokers.
  if (val === '*') return true;
  if (val.includes('*')) {
    const motif = '^' + val.split('*').map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$';
    return new RegExp(motif).test(String(valeurEntree));
  }
  return String(valeurEntree) === val;
}

function chercher(filtre) {
  return ANNUAIRE.filter((e) => correspond(e, filtre));
}

app.get('/', (req, res) => {
  res.render('portier', { resultat: null, uid: '' });
});

app.post('/entrer', (req, res) => {
  const uid = req.body.uid || '';
  const motDePasse = req.body.motDePasse || '';

  // ATTENTION - TODO securiser :
  // On construit le filtre LDAP en collant directement l'identifiant et le mot de
  // passe. Si l'utilisateur y glisse un caractere special LDAP (comme *), il change
  // le sens du filtre.
  const filtre = `(&(uid=${uid})(motDePasse=${motDePasse}))`;

  const trouve = chercher(filtre);
  let resultat;
  if (trouve.length > 0) {
    resultat = { ok: true, filtre, entree: trouve[0] };
  } else {
    resultat = { ok: false, filtre, entree: null };
  }
  res.render('portier', { resultat, uid });
});

app.listen(PORT, () => {
  console.log(`Le Portier ouvert sur le port ${PORT}`);
});
