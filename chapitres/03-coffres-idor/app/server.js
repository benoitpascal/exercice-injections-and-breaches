// L'Auberge du Pixel - Chapitre 3 : Les Coffres
// Application VOLONTAIREMENT vulnerable (IDOR), a usage pedagogique uniquement.

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Tu es connecte en tant que ce client. Pas d'authentification reelle ici :
// ce n'est pas le sujet du chapitre. On suppose simplement que tu es le client 3.
const MON_ID = 3;

// Les coffres des clients de l'auberge. Chacun a un contenu prive.
const coffres = {
  1: { proprietaire: 'Dame Eloise', or: 540, secret: "Lettre d'amour cachee sous le double-fond." },
  2: { proprietaire: 'Sire Edric', or: 120, secret: "Reconnaissance de dette envers un usurier." },
  3: { proprietaire: 'Toi', or: 75, secret: "Une carte griffonnee menant a un tresor." },
  4: { proprietaire: 'Le marchand Talvas', or: 980, secret: "Liste de contacts de contrebande." },
};

app.get('/', (req, res) => {
  res.render('accueil', { monId: MON_ID, moi: coffres[MON_ID] });
});

app.get('/coffre/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const coffre = coffres[id];

  if (!coffre) {
    return res.status(404).render('introuvable', { id });
  }

  // ATTENTION - TODO securiser :
  // On affiche le coffre demande SANS verifier qu'il t'appartient.
  // L'identifiant vient de l'URL, et on lui fait aveuglement confiance.
  // (Le correctif consiste a refuser si l'id demande n'est pas le tien.)

  res.render('coffre', { id, coffre, monId: MON_ID });
});

app.listen(PORT, () => {
  console.log(`Les Coffres ouverts sur le port ${PORT}`);
});
