// L'Auberge du Pixel - Chapitre 8 : le Panneau Indicateur - SOLUTION

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

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

// On n'autorise que les destinations INTERNES : un chemin qui commence par un
// seul '/'. On refuse les URL absolues (https://...) et les '//' (protocol-relative).
function destinationInterne(vers) {
  return typeof vers === 'string' && vers.startsWith('/') && !vers.startsWith('//');
}

app.get('/aller', (req, res) => {
  const vers = req.query.vers || '/';

  // CORRIGE : si la destination n'est pas interne, on retombe sur l'accueil.
  if (!destinationInterne(vers)) {
    return res.redirect('/');
  }

  res.redirect(vers);
});

app.listen(PORT, () => {
  console.log(`Le Panneau ouvert sur le port ${PORT}`);
});
