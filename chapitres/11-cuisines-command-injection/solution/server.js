// L'Auberge du Pixel - Chapitre 11 : les Cuisines - SOLUTION

const express = require('express');
const path = require('path');
const { execFile } = require('child_process');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.render('cuisines', { ingredient: '', commande: null, sortie: null });
});

app.post('/compter', (req, res) => {
  const ingredient = (req.body.ingredient || '').trim();

  // CORRIGE : on n'utilise plus de shell. execFile lance directement le programme
  // "grep" avec ses arguments donnes a part. L'entree devient un simple argument
  // (un motif de recherche), jamais interprete par un shell : plus d'enchainement possible.
  execFile('grep', ['-c', '-i', ingredient, '/app/garde-manger.txt'], (err, stdout, stderr) => {
    let sortie = '';
    if (stdout) sortie += stdout;
    if (stderr) sortie += stderr;
    if (!sortie) sortie = '0\n'; // grep renvoie un code non nul quand le compte est 0
    res.render('cuisines', { ingredient, commande: null, sortie });
  });
});

app.listen(PORT, () => {
  console.log(`Les Cuisines ouvertes sur le port ${PORT}`);
});
