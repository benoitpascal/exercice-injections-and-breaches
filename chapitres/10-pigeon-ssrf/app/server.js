// L'Auberge du Pixel - Chapitre 10 : le Pigeon Voyageur
// Application VOLONTAIREMENT vulnerable (SSRF), a usage pedagogique uniquement.
//
// Deux serveurs dans le meme conteneur :
//  - le serveur PUBLIC sur le port 3000 (celui que ton navigateur atteint) ;
//  - un serveur INTERNE sur le port 9000, lie a 127.0.0.1 et NON expose par Docker.
// Ton navigateur ne peut pas joindre le 9000. Mais le serveur public (le pigeon),
// lui, le peut. C'est exactement ce que la faille SSRF va te laisser exploiter.

const express = require('express');
const path = require('path');

// ---------- Serveur INTERNE (port 9000, accessible seulement depuis le conteneur) ----------
const interne = express();

interne.get('/tableau-du-village', (req, res) => {
  res.type('text').send('TABLEAU DU VILLAGE\n- Foire aux bestiaux dimanche.\n- Le pont nord est repare.');
});
interne.get('/avis-de-foire', (req, res) => {
  res.type('text').send('AVIS DE FOIRE\n- Concours de tir a l arc.\n- Tournoi de des a la taverne.');
});
// Ce service interne garde un secret qu'aucun visiteur ne devrait pouvoir lire.
interne.get('/cle-maitre', (req, res) => {
  res.type('text').send('CLE MAITRE DE L AUBERGE : 9-3-7-1. Ouvre toutes les portes, y compris le grand coffre.');
});

interne.listen(9000, '127.0.0.1', () => {
  console.log('Service interne sur 127.0.0.1:9000 (non expose)');
});

// ---------- Serveur PUBLIC (port 3000, expose) ----------
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.render('pigeon', { url: 'http://localhost:9000/tableau-du-village', contenu: null, erreur: null });
});

app.post('/envoyer-pigeon', async (req, res) => {
  const url = (req.body.url || '').trim();
  let contenu = null;
  let erreur = null;

  // ATTENTION - TODO securiser :
  // Le pigeon (le serveur) va chercher l'URL demandee, quelle qu'elle soit, y
  // compris des adresses internes que ton navigateur ne peut pas atteindre.
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
