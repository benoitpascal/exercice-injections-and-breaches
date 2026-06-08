// L'Auberge du Pixel - Chapitre 8 : le Panneau Indicateur
// Application VOLONTAIREMENT vulnerable (open redirect), a usage pedagogique uniquement.

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Les salles internes vers lesquelles le panneau peut t'orienter.
const salles = {
  cuisine: 'Les Cuisines : ca sent la tourte et le pain chaud.',
  cave: 'La Cave : tonneaux de biere et de cidre a perte de vue.',
  chambres: 'Les Chambres : des lits douillets a l\'etage.',
};

app.get('/', (req, res) => {
  res.render('panneau', { salles: Object.keys(salles) });
});

app.get('/salle/:nom', (req, res) => {
  const texte = salles[req.params.nom] || 'Cette salle n\'existe pas.';
  res.render('salle', { nom: req.params.nom, texte });
});

app.get('/aller', (req, res) => {
  const vers = req.query.vers || '/';

  // ATTENTION - TODO securiser :
  // On redirige vers la destination demandee sans verifier qu'elle reste dans
  // l'auberge. Une URL absolue externe (https://...) est acceptee telle quelle.
  res.redirect(vers);
});

app.listen(PORT, () => {
  console.log(`Le Panneau ouvert sur le port ${PORT}`);
});
