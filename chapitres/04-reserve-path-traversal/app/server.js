// L'Auberge du Pixel - Chapitre 4 : La Reserve
// Application VOLONTAIREMENT vulnerable (path traversal), a usage pedagogique uniquement.

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Le dossier des documents publics de la reserve.
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

  // ATTENTION - TODO securiser :
  // On colle le nom demande au dossier public sans verifier qu'on reste
  // bien a l'interieur. Un nom contenant ../ permet de remonter et de
  // sortir du dossier pour lire n'importe quel fichier de la machine.
  const chemin = path.join(DOSSIER_PUBLIC, demande);

  try {
    contenu = fs.readFileSync(chemin, 'utf8');
  } catch (e) {
    erreur = "Impossible de lire ce document.";
  }

  res.render('reserve', { fichiers: listePublique(), demande, contenu, erreur });
});

app.listen(PORT, () => {
  console.log(`La Reserve ouverte sur le port ${PORT}`);
});
