// L'Auberge du Pixel - Chapitre 14 : le Parchemin Scelle - SOLUTION

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

const EXEMPLE = '<?xml version="1.0"?>\n<message>Bonjour, voici un parchemin tout simple.</message>';

// CORRIGE : on refuse tout parchemin contenant une definition de type (DOCTYPE)
// ou une entite, ce qui coupe net les entites externes. Et on ne resout AUCUNE
// entite externe : on lit seulement le contenu du message.
function lireParchemin(xml) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) {
    return { contenu: null, erreur: 'Parchemin refuse : les definitions de type (DOCTYPE) et les entites externes sont interdites.' };
  }
  const corps = (xml.match(/<message>([\s\S]*?)<\/message>/) || ['', ''])[1];
  return { contenu: corps, erreur: null };
}

app.get('/', (req, res) => {
  res.render('parchemin', { parchemin: EXEMPLE, contenu: null, erreur: null });
});

app.post('/lire', (req, res) => {
  const parchemin = req.body.parchemin || '';
  const r = lireParchemin(parchemin);
  res.render('parchemin', { parchemin, contenu: r.contenu, erreur: r.erreur });
});

app.listen(PORT, () => {
  console.log(`Le Parchemin ouvert sur le port ${PORT}`);
});
