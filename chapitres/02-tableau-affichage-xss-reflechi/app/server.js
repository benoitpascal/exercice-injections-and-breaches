// L'Auberge du Pixel - Chapitre 2 : le Tableau d'Affichage
// Application VOLONTAIREMENT vulnerable (XSS reflechi), a usage pedagogique uniquement.

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Les avis de quete punaises au tableau.
const avis = [
  { titre: 'Loup rode dans la foret', details: 'Recompense : 20 pieces. Voir le garde a l entree.' },
  { titre: 'Toit de la grange a reparer', details: 'Demander a Gru le tavernier. Outils fournis.' },
  { titre: 'Caravane d epices recherchee', details: 'Disparue sur la route de l est il y a trois jours.' },
];

// Page du tableau. Le terme recherche arrive dans l URL (?q=...).
app.get('/', (req, res) => {
  const q = (req.query.q || '').trim();
  const resultats = q
    ? avis.filter((a) => (a.titre + ' ' + a.details).toLowerCase().includes(q.toLowerCase()))
    : avis;
  // On renvoie tel quel le terme recherche a la vue : c est ce terme,
  // venu de l URL, qui va etre reaffiche dans la page (et c est la faille).
  res.render('tableau', { q, resultats });
});

app.listen(PORT, () => {
  console.log(`Tableau d'Affichage ouvert sur le port ${PORT}`);
});
