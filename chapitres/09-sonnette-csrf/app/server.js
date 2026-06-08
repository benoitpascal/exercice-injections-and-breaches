// L'Auberge du Pixel - Chapitre 9 : la Sonnette
// Application VOLONTAIREMENT vulnerable (CSRF), a usage pedagogique uniquement.

const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// Etat (un seul "toi" pour l'exercice).
let bourse = 100;
let coups = 0;
let jetonValide = null;

// Tu es considere comme connecte si le cookie de session est present.
function estConnecte(req) {
  return (req.headers.cookie || '').includes('session=le-gardien');
}

app.get('/', (req, res) => {
  // On te "connecte" automatiquement et on pose un cookie de session.
  res.cookie('session', 'le-gardien', { httpOnly: false });
  // Un jeton est genere et glisse dans le vrai formulaire (mais pas encore verifie).
  jetonValide = crypto.randomBytes(8).toString('hex');
  res.render('sonnette', { bourse, coups, jeton: jetonValide });
});

app.post('/sonner', (req, res) => {
  if (!estConnecte(req)) return res.status(401).send('Tu n es pas connecte.');

  // ATTENTION - TODO securiser :
  // On execute l'action des que la session est valide, sans verifier que la
  // demande vient bien de TOI (aucun controle du jeton anti-CSRF). Du coup,
  // n'importe quelle page peut declencher cette action en utilisant ta session.
  if (bourse >= 25) {
    bourse -= 25;
    coups += 1;
  }
  res.redirect('/');
});

// Page piegee : elle represente un site exterieur (ici l'auberge rivale).
// En l'ouvrant alors que tu es connecte, elle declenche /sonner a ton insu.
app.get('/auberge-rivale', (req, res) => {
  res.render('rivale');
});

app.listen(PORT, () => {
  console.log(`La Sonnette ouverte sur le port ${PORT}`);
});
