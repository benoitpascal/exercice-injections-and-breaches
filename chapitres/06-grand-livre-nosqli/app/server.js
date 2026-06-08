// L'Auberge du Pixel - Chapitre 6 : le Grand Livre
// Application VOLONTAIREMENT vulnerable (injection NoSQL), a usage pedagogique uniquement.
// Pas de vraie base Mongo : un mini moteur de recherche reproduit le comportement
// d'une base orientee documents (egalite, et operateurs comme $ne, $gt, $in).

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// La "collection" d'utilisateurs (documents).
const utilisateurs = [
  { nom: 'gru-admin', mdp: 'T4verne-Secret!', role: 'Tavernier', note: 'Acces au grand livre complet : dettes, comptes secrets, cle du coffre.' },
  { nom: 'gardien', mdp: 'pixel123', role: 'Gardien de nuit', note: 'Acces au grand livre courant.' },
];

// Mini moteur facon MongoDB : egalite stricte, ou operateurs $ne / $gt / $in.
function correspond(doc, filtre) {
  return Object.keys(filtre).every((cle) => {
    const cond = filtre[cle];
    const val = doc[cle];
    if (cond && typeof cond === 'object') {
      if ('$ne' in cond) return val !== cond['$ne'];
      if ('$gt' in cond) return val > cond['$gt'];
      if ('$in' in cond) return Array.isArray(cond['$in']) && cond['$in'].includes(val);
      return false;
    }
    return val === cond;
  });
}

app.get('/', (req, res) => {
  res.render('grand-livre', { erreur: null, utilisateur: null, filtre: null });
});

app.post('/connexion', (req, res) => {
  // ATTENTION - TODO securiser :
  // On construit le filtre directement a partir du corps de la requete, sans
  // verifier le type des valeurs. Si l'utilisateur envoie un operateur ($ne, ...)
  // au lieu d'une simple chaine, il est pris au pied de la lettre.
  const filtre = { nom: req.body.nom, mdp: req.body.mdp };

  const utilisateur = utilisateurs.find((u) => correspond(u, filtre)) || null;
  const erreur = utilisateur ? null : 'Identifiants invalides.';

  res.render('grand-livre', { erreur, utilisateur, filtre: JSON.stringify(filtre) });
});

app.listen(PORT, () => {
  console.log(`Le Grand Livre ouvert sur le port ${PORT}`);
});
