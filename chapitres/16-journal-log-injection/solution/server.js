// L'Auberge du Pixel - Chapitre 16 : le Journal de Bord - SOLUTION

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

const journal = [
  '2099-01-01 08:00 - Ouverture de l auberge par le tavernier.',
  '2099-01-01 09:15 - Arrivee de : Dame Pixelle.'
];

function heure() {
  return '2099-01-01 ' + String(9 + journal.length).padStart(2, '0') + ':30';
}

app.get('/', (req, res) => {
  res.render('journal', { journal: journal.join('\n') });
});

app.post('/arriver', (req, res) => {
  const nom = req.body.nom || '';

  // CORRIGE : on neutralise les retours a la ligne du nom avant de l'ecrire dans
  // le journal. Une entree = une ligne, toujours : impossible d'en forger d'autres.
  const nomPropre = nom.replace(/[\r\n]+/g, ' ').trim();

  const ligne = `${heure()} - Arrivee de : ${nomPropre}`;
  journal.push(ligne);

  res.render('journal', { journal: journal.join('\n') });
});

app.listen(PORT, () => {
  console.log(`Le Journal de Bord ouvert sur le port ${PORT}`);
});
