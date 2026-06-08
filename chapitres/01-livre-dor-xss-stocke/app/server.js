// L'Auberge du Pixel - Chapitre 1 : le Livre d'Or
// Application VOLONTAIREMENT vulnerable (XSS stocke), a usage pedagogique uniquement.
// Ne jamais deployer ce code ailleurs que dans l'exercice.

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Moteur de templates EJS.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// "Base de donnees" en memoire : la liste des messages du livre d'or.
// Quelques messages d'ambiance pour ne pas demarrer sur une page vide.
const livreDor = [
  { auteur: 'Gru le Tavernier', message: "Bienvenue a l'Auberge du Pixel, voyageur." },
  { auteur: "Mira l'Archere", message: 'Bonne biere, bons lits. Je recommande.' },
];

// Page d'accueil : on affiche tous les messages enregistres.
app.get('/', (req, res) => {
  res.render('livre-dor', { livreDor });
});

// Reception d'un nouveau message.
// On enregistre la donnee BRUTE, telle que le visiteur l'a tapee,
// sans aucune verification ni transformation. C'est ici que la faille prend racine :
// le message sera ensuite reaffiche tel quel a chaque visite.
app.post('/signer', (req, res) => {
  const auteur = (req.body.auteur || 'Anonyme').trim();
  const message = (req.body.message || '').trim();
  if (message) {
    livreDor.push({ auteur, message });
  }
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Livre d'Or ouvert sur le port ${PORT}`);
});
