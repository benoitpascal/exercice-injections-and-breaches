// L'Auberge du Pixel - Chapitre 12 : le Menu du Jour
// Application VOLONTAIREMENT vulnerable (SSTI), a usage pedagogique uniquement.
// A lancer UNIQUEMENT dans le conteneur durci prevu.

const express = require('express');
const path = require('path');
const ejs = require('ejs');

const app = express();
const PORT = 3000;

// Un secret range dans l'environnement du serveur (comme le serait une vraie cle).
if (!process.env.SECRET_AUBERGE) {
  process.env.SECRET_AUBERGE = 'Cle du grand coffre : 4-1-1-9';
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

const PLAT_DU_JOUR = 'tourte aux champignons';

app.get('/', (req, res) => {
  res.render('menu', { modele: '', rendu: null, erreur: null });
});

app.post('/menu', (req, res) => {
  const modele = req.body.message || '';
  let rendu = null;
  let erreur = null;

  // ATTENTION - TODO securiser :
  // On compile le message de l'utilisateur COMME un template EJS. Tout ce qu'il
  // ecrit entre <%= %> ou <% %> est donc execute comme du code sur le serveur.
  try {
    rendu = ejs.render(modele, { plat: PLAT_DU_JOUR });
  } catch (e) {
    erreur = 'Le menu n a pas pu etre prepare : ' + e.message;
  }

  res.render('menu', { modele, rendu, erreur });
});

app.listen(PORT, () => {
  console.log(`Le Menu ouvert sur le port ${PORT}`);
});
