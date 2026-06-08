// L'Auberge du Pixel - Chapitre 14 : le Parchemin Scelle
// Application VOLONTAIREMENT vulnerable (XXE), a usage pedagogique uniquement.
//
// Pour rester sans dependance native fragile, le parchemin XML est lu par un petit
// analyseur maison qui se comporte comme un parseur XML laisse en configuration
// PERMISSIVE (entites externes activees). C'est exactement ce qui rend un vrai
// parseur vulnerable a XXE. La faille et la defense sont les memes.

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

const EXEMPLE = '<?xml version="1.0"?>\n<message>Bonjour, voici un parchemin tout simple.</message>';

// Analyse le parchemin. Avec entitesExternes:true, il resout les entites SYSTEM
// "file://..." en lisant le fichier pointe : c'est la faille XXE.
function lireParchemin(xml, options) {
  options = options || {};
  const entites = {};

  if (options.entitesExternes) {
    const re = /<!ENTITY\s+(\w+)\s+SYSTEM\s+"file:\/\/([^"]+)"\s*>/g;
    let m;
    while ((m = re.exec(xml)) !== null) {
      const nom = m[1];
      const chemin = m[2];
      try {
        entites[nom] = fs.readFileSync(chemin, 'utf8');
      } catch (e) {
        entites[nom] = '';
      }
    }
  }

  const corps = (xml.match(/<message>([\s\S]*?)<\/message>/) || ['', ''])[1];
  const contenu = corps.replace(/&(\w+);/g, (full, nom) => (nom in entites ? entites[nom] : full));
  return { contenu, erreur: null };
}

app.get('/', (req, res) => {
  res.render('parchemin', { parchemin: EXEMPLE, contenu: null, erreur: null });
});

app.post('/lire', (req, res) => {
  const parchemin = req.body.parchemin || '';

  // ATTENTION - TODO securiser :
  // On lit le parchemin en RESOLVANT les entites externes. Une entite SYSTEM
  // "file://..." fait alors lire au serveur le fichier pointe, et son contenu
  // est injecte dans le message.
  const r = lireParchemin(parchemin, { entitesExternes: true });

  res.render('parchemin', { parchemin, contenu: r.contenu, erreur: r.erreur });
});

app.listen(PORT, () => {
  console.log(`Le Parchemin ouvert sur le port ${PORT}`);
});
