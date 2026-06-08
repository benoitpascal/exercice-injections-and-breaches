// L'Auberge du Pixel - Chapitre 3 : Les Coffres - SOLUTION

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const MON_ID = 3;

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

  // CORRIGE : on verifie que le coffre demande t'appartient bien.
  // Si l'id de l'URL n'est pas le tien, on refuse, point.
  if (id !== MON_ID) {
    return res.status(403).render('refus', { id });
  }

  res.render('coffre', { id, coffre, monId: MON_ID });
});

app.listen(PORT, () => {
  console.log(`Les Coffres ouverts sur le port ${PORT}`);
});
