// L'Auberge du Pixel - Chapitre 7 : le Vestiaire - SOLUTION

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

let profil = { id: 7, pseudo: 'Voyageur', role: 'client', or: 50 };

app.get('/', (req, res) => {
  res.render('vestiaire', { profil });
});

app.post('/profil', (req, res) => {
  // CORRIGE : on ne met a jour QUE les champs explicitement autorises.
  // Tout le reste du corps (role, or, ...) est ignore.
  if (typeof req.body.pseudo === 'string') {
    profil.pseudo = req.body.pseudo;
  }

  res.render('vestiaire', { profil });
});

app.listen(PORT, () => {
  console.log(`Le Vestiaire ouvert sur le port ${PORT}`);
});
