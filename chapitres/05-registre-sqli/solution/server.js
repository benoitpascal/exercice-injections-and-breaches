// L'Auberge du Pixel - Chapitre 5 : le Registre - SOLUTION

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

  // CORRIGE : requete parametree. Les valeurs ne sont plus collees dans le texte
  // de la requete ; elles sont passees a part, comme de simples donnees.
  const requete = 'SELECT nom, role, note FROM utilisateurs WHERE nom = ? AND mdp = ?';

  let utilisateur = null;
  let erreur = null;
  try {
    const stmt = db.prepare(requete);
    stmt.bind([nom, mdp]);
    if (stmt.step()) {
      utilisateur = stmt.getAsObject();
    } else {
      erreur = 'Identifiants invalides.';
    }
    stmt.free();
  } catch (e) {
    erreur = 'La requete a echoue.';
  }

  res.render('registre', { erreur, utilisateur, requete });
});

(async () => {
  const SQL = await initSqlJs({ locateFile: (f) => path.join(__dirname, 'node_modules/sql.js/dist/', f) });
  db = new SQL.Database();
  db.run(`CREATE TABLE utilisateurs (id INTEGER PRIMARY KEY, nom TEXT, mdp TEXT, role TEXT, note TEXT);`);
  db.run(`INSERT INTO utilisateurs (nom, mdp, role, note) VALUES
    ('gardien', 'pixel123', 'Gardien de nuit', 'Acces au registre courant des clients.'),
    ('gru-admin', 'T4verne-Secret!', 'Tavernier', 'Acces complet : registre secret, comptes de la maison, et emplacement de la cle du grand coffre.');`);
  app.listen(PORT, () => console.log(`Le Registre ouvert sur le port ${PORT}`));
})();
