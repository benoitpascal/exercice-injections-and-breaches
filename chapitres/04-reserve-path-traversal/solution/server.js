// L'Auberge du Pixel - Chapitre 4 : La Reserve - SOLUTION

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const DOSSIER_PUBLIC = path.join(__dirname, 'documents');

function listePublique() {
  return fs.readdirSync(DOSSIER_PUBLIC);
}

app.get('/', (req, res) => {
  res.render('reserve', { fichiers: listePublique(), demande: null, contenu: null, erreur: null });
});

app.get('/lire', (req, res) => {
  const demande = (req.query.fichier || '').trim();
  let contenu = null;
  let erreur = null;

  const chemin = path.join(DOSSIER_PUBLIC, demande);

  // CORRIGE : on resout le chemin complet, puis on verifie qu'il reste bien
  // a l'interieur du dossier public. Tout chemin qui s'en echappe est refuse.
  const resolu = path.resolve(chemin);
  const base = path.resolve(DOSSIER_PUBLIC);

  if (resolu !== base && !resolu.startsWith(base + path.sep)) {
    erreur = "Acces refuse : ce document est hors de la reserve.";
  } else {
    try {
      contenu = fs.readFileSync(resolu, 'utf8');
    } catch (e) {
      erreur = "Impossible de lire ce document.";
    }
  }

  res.render('reserve', { fichiers: listePublique(), demande, contenu, erreur });
});

app.listen(PORT, () => {
  console.log(`La Reserve ouverte sur le port ${PORT}`);
});
