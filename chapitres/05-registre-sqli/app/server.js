// L'Auberge du Pixel - Chapitre 5 : le Registre des Clients
// Application VOLONTAIREMENT vulnerable (injection SQL), a usage pedagogique uniquement.
// Base SQLite embarquee en JS (sql.js) : aucun service externe a lancer.

const express = require('express');
const path = require('path');
const initSqlJs = require('sql.js');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

let db;

app.get('/', (req, res) => {
  res.render('registre', { erreur: null, utilisateur: null, requete: null });
});

app.post('/connexion', (req, res) => {
  const nom = req.body.nom || '';
  const mdp = req.body.mdp || '';

  // ATTENTION - TODO securiser :
  // On construit la requete SQL en collant directement les valeurs saisies.
  // Le texte de l'utilisateur se melange a la commande : c'est la faille.
  const requete = `SELECT nom, role, note FROM utilisateurs WHERE nom = '${nom}' AND mdp = '${mdp}'`;

  let utilisateur = null;
  let erreur = null;
  try {
    const r = db.exec(requete);
    if (r.length && r[0].values.length) {
      const cols = r[0].columns;
      const row = r[0].values[0];
      utilisateur = {};
      cols.forEach((c, i) => { utilisateur[c] = row[i]; });
    } else {
      erreur = 'Identifiants invalides.';
    }
  } catch (e) {
    erreur = 'La requete a echoue.';
  }

  res.render('registre', { erreur, utilisateur, requete });
});

// Initialisation de la base, puis demarrage du serveur.
(async () => {
  const SQL = await initSqlJs({ locateFile: (f) => path.join(__dirname, 'node_modules/sql.js/dist/', f) });
  db = new SQL.Database();
  db.run(`CREATE TABLE utilisateurs (id INTEGER PRIMARY KEY, nom TEXT, mdp TEXT, role TEXT, note TEXT);`);
  db.run(`INSERT INTO utilisateurs (nom, mdp, role, note) VALUES
    ('gardien', 'pixel123', 'Gardien de nuit', 'Acces au registre courant des clients.'),
    ('gru-admin', 'T4verne-Secret!', 'Tavernier', 'Acces complet : registre secret, comptes de la maison, et emplacement de la cle du grand coffre.');`);
  app.listen(PORT, () => console.log(`Le Registre ouvert sur le port ${PORT}`));
})();
