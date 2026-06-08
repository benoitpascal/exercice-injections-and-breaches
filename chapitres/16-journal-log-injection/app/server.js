// L'Auberge du Pixel - Chapitre 16 : le Journal de Bord
// Application VOLONTAIREMENT vulnerable (injection dans les logs / CRLF),
// a usage pedagogique uniquement.

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// Le journal de bord de l'auberge (une ligne par evenement).
const journal = [
  '2099-01-01 08:00 - Ouverture de l auberge par le tavernier.',
  '2099-01-01 09:15 - Arrivee de : Dame Pixelle.'
];

// Une horloge volontairement fixe pour que l'exercice soit reproductible.
function heure() {
  return '2099-01-01 ' + String(9 + journal.length).padStart(2, '0') + ':30';
}

app.get('/', (req, res) => {
  res.render('journal', { journal: journal.join('\n') });
});

app.post('/arriver', (req, res) => {
  const nom = req.body.nom || '';

  // ATTENTION - TODO securiser :
  // On ecrit le nom tel quel dans le journal. Si le nom contient un retour a la
  // ligne, il cree de fausses lignes dans le journal (entrees forgees).
  const ligne = `${heure()} - Arrivee de : ${nom}`;
  journal.push(ligne);

  res.render('journal', { journal: journal.join('\n') });
});

app.listen(PORT, () => {
  console.log(`Le Journal de Bord ouvert sur le port ${PORT}`);
});
