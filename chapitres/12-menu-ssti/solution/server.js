// L'Auberge du Pixel - Chapitre 12 : le Menu du Jour - SOLUTION

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

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
  const message = req.body.message || '';

  // CORRIGE : le message de l'utilisateur est une DONNEE, jamais un template.
  // On remplace seulement le jeton {plat} par le plat du jour, par simple
  // remplacement de texte. Rien n'est compile ni execute.
  const rendu = message.split('{plat}').join(PLAT_DU_JOUR);

  // La vue affiche "rendu" en l'echappant : un <%= ... %> tape par l'utilisateur
  // s'affiche comme du texte inerte.
  res.render('menu', { modele: message, rendu, erreur: null });
});

app.listen(PORT, () => {
  console.log(`Le Menu ouvert sur le port ${PORT}`);
});
