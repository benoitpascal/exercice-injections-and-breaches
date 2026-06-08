// L'Auberge du Pixel - Chapitre 10 : le Pigeon Voyageur - SOLUTION

const express = require('express');
const path = require('path');

// ---------- Serveur INTERNE (port 9000, non expose) ----------
const interne = express();
interne.get('/tableau-du-village', (req, res) => {
  res.type('text').send('TABLEAU DU VILLAGE\n- Foire aux bestiaux dimanche.\n- Le pont nord est repare.');
});
interne.get('/avis-de-foire', (req, res) => {
  res.type('text').send('AVIS DE FOIRE\n- Concours de tir a l arc.\n- Tournoi de des a la taverne.');
});
interne.get('/cle-maitre', (req, res) => {
  res.type('text').send('CLE MAITRE DE L AUBERGE : 9-3-7-1. Ouvre toutes les portes, y compris le grand coffre.');
});
interne.listen(9000, '127.0.0.1', () => {
  console.log('Service interne sur 127.0.0.1:9000 (non expose)');
});

// ---------- Serveur PUBLIC (port 3000) ----------
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// Liste blanche : le pigeon ne peut aller QUE vers ces adresses connues.
const DESTINATIONS_AUTORISEES = [
  'http://localhost:9000/tableau-du-village',
  'http://localhost:9000/avis-de-foire',
];

app.get('/', (req, res) => {
  res.render('pigeon', { url: 'http://localhost:9000/tableau-du-village', contenu: null, erreur: null });
});

app.post('/envoyer-pigeon', async (req, res) => {
  const url = (req.body.url || '').trim();
  let contenu = null;
  let erreur = null;

  // CORRIGE : on n'autorise que les destinations connues. Toute autre adresse
  // (le service interne, une IP locale, etc.) est refusee avant le moindre appel.
  if (!DESTINATIONS_AUTORISEES.includes(url)) {
    erreur = 'Destination non autorisee. Le pigeon ne va que vers les adresses connues du village.';
    return res.render('pigeon', { url, contenu, erreur });
  }

  try {
    const r = await fetch(url);
    contenu = await r.text();
  } catch (e) {
    erreur = "Le pigeon n'a rien pu rapporter de cette adresse.";
  }

  res.render('pigeon', { url, contenu, erreur });
});

app.listen(PORT, () => {
  console.log(`Le Pigeon ouvert sur le port ${PORT}`);
});
