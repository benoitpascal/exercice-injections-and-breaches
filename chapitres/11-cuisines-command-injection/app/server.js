// L'Auberge du Pixel - Chapitre 11 : les Cuisines
// Application VOLONTAIREMENT vulnerable (command injection), a usage pedagogique uniquement.
// A lancer UNIQUEMENT dans le conteneur durci prevu : une attaque reussie y reste prisonniere.

const express = require('express');
const path = require('path');
const { exec } = require('child_process');

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

  // ATTENTION - TODO securiser :
  // On insere l'entree directement dans une commande shell, qui est ensuite
  // executee. Les caracteres speciaux du shell (;, &&, |) permettent d'enchainer
  // d'autres commandes : c'est l'injection de commande.
  const commande = `cat /app/garde-manger.txt | grep -c -i ${ingredient}`;

  exec(commande, { timeout: 5000 }, (err, stdout, stderr) => {
    let sortie = '';
    if (stdout) sortie += stdout;
    if (stderr) sortie += stderr;
    if (!sortie && err) sortie = String(err.message);
    res.render('cuisines', { ingredient, commande, sortie: sortie || '(aucune sortie)' });
  });
});

app.listen(PORT, () => {
  console.log(`Les Cuisines ouvertes sur le port ${PORT}`);
});
