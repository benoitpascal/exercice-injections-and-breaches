// L'Auberge du Pixel - Chapitre 9 : la Sonnette - SOLUTION

const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

let bourse = 100;
let coups = 0;
let jetonValide = null;

function estConnecte(req) {
  return (req.headers.cookie || '').includes('session=le-gardien');
}

app.get('/', (req, res) => {
  res.cookie('session', 'le-gardien', { httpOnly: false });
  jetonValide = crypto.randomBytes(8).toString('hex');
  res.render('sonnette', { bourse, coups, jeton: jetonValide });
});

app.post('/sonner', (req, res) => {
  if (!estConnecte(req)) return res.status(401).send('Tu n es pas connecte.');

  // CORRIGE : on exige un jeton anti-CSRF valide. Ce jeton n'est present que
  // dans le vrai formulaire de l'auberge. Une page exterieure ne peut pas le
  // connaitre, donc sa demande forgee est refusee.
  if (req.body.jeton !== jetonValide) {
    return res.status(403).render('refus-csrf');
  }

  if (bourse >= 25) {
    bourse -= 25;
    coups += 1;
  }
  res.redirect('/');
});

app.get('/auberge-rivale', (req, res) => {
  res.render('rivale');
});

app.listen(PORT, () => {
  console.log(`La Sonnette ouverte sur le port ${PORT}`);
});
