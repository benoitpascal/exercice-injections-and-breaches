// L'Auberge du Pixel - Chapitre 7 : le Vestiaire
// Application VOLONTAIREMENT vulnerable (mass assignment), a usage pedagogique uniquement.

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// Ton profil de client a l'auberge. Tu es cense pouvoir changer ton pseudo,
// rien d'autre. Le role et l'or sont geres par la maison.
let profil = { id: 7, pseudo: 'Voyageur', role: 'client', or: 50 };

app.get('/', (req, res) => {
  res.render('vestiaire', { profil });
});

app.post('/profil', (req, res) => {
  // ATTENTION - TODO securiser :
  // On recopie TOUT le corps de la requete dans le profil, sans filtrer les
  // champs autorises. Si le corps contient role ou or, ils sont ecrases aussi.
  Object.assign(profil, req.body);

  // (l'or est cense etre un nombre ; on le normalise juste pour l'affichage)
  if (typeof profil.or === 'string') profil.or = parseInt(profil.or, 10) || profil.or;

  res.render('vestiaire', { profil });
});

app.listen(PORT, () => {
  console.log(`Le Vestiaire ouvert sur le port ${PORT}`);
});
