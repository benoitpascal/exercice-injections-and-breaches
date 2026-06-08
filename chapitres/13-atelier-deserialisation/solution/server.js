// L'Auberge du Pixel - Chapitre 13 : l'Atelier - SOLUTION

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

const EXEMPLE = '{"etabli":"chene","outils":["marteau","scie","ciseau"]}';

app.get('/', (req, res) => {
  res.render('atelier', { plan: EXEMPLE, restaure: null, erreur: null });
});

app.post('/restaurer', (req, res) => {
  const plan = req.body.plan || '';
  let restaure = null;
  let erreur = null;

  // CORRIGE : on lit le plan avec JSON.parse, qui ne reconstruit que des donnees
  // (objets, tableaux, nombres, chaines) et n'execute jamais rien. Un plan piege
  // n'est plus que du texte inerte.
  try {
    const objet = JSON.parse(plan);
    restaure = JSON.stringify(objet, null, 2);
  } catch (e) {
    erreur = 'Plan illisible : ' + e.message;
  }

  res.render('atelier', { plan, restaure, erreur });
});

app.listen(PORT, () => {
  console.log(`L'Atelier ouvert sur le port ${PORT}`);
});
