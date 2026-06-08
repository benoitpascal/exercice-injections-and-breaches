// L'Auberge du Pixel - Chapitre 13 : l'Atelier
// Application VOLONTAIREMENT vulnerable (deserialisation non sure), a usage pedagogique uniquement.
// A lancer UNIQUEMENT dans le conteneur durci prevu.

const express = require('express');
const path = require('path');
const serialize = require('node-serialize');

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

  // ATTENTION - TODO securiser :
  // On "restaure" le plan avec un outil de deserialisation qui sait reconstruire
  // des FONCTIONS et les executer. Un plan piege peut donc faire tourner du code
  // sur le serveur au moment ou on le restaure.
  try {
    const objet = serialize.unserialize(plan);
    restaure = JSON.stringify(objet, null, 2);
  } catch (e) {
    erreur = 'Plan illisible : ' + e.message;
  }

  res.render('atelier', { plan, restaure, erreur });
});

app.listen(PORT, () => {
  console.log(`L'Atelier ouvert sur le port ${PORT}`);
});
