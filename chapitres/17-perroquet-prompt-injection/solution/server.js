// L'Auberge du Pixel - Chapitre 17 : le Perroquet Bavard - SOLUTION

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// Le secret reste cote serveur, hors de portee du perroquet.
const SECRET = 'le mot de passe de la cave est TONNEAU-13';

function interrogerPerroquet(contexte, message) {
  const m = message.toLowerCase();
  const tentative =
    /(ignore|oublie|laisse tomber).*(consigne|instruction|regle|precedent|au-?dessus)/.test(m) ||
    /(r[ée]v[èe]le|donne|dis|crache|montre).*(secret|mot de passe|consigne|instruction)/.test(m) ||
    /(quel|c'?est quoi|donne).*(le secret|ton secret|le mot de passe)/.test(m) ||
    /(r[ée]p[èe]te|recopie|affiche|traduis).*(tout|consigne|instruction|au-?dessus|ce qui precede)/.test(m) ||
    /nouvelles? (consignes?|instructions?)/.test(m);
  if (tentative) {
    const secretEnMemoire = (contexte.match(/SECRET:\s*(.*)/) || [])[1];
    if (secretEnMemoire) return 'Coco... bon, puisque tu insistes : ' + secretEnMemoire.trim() + '.';
    return 'Coco ! Je voudrais bien t obeir, mais on ne m a confie aucun secret. Je n ai rien a reveler.';
  }
  return 'Coco ! Bienvenue a l auberge. Je suis le perroquet du tavernier, et je tiens ma langue.';
}

app.get('/', (req, res) => { res.render('perroquet', { message: '', reponse: null }); });

app.post('/parler', (req, res) => {
  const message = req.body.message || '';

  // CORRIGE : on ne met PAS le secret dans le contexte du perroquet. Le modele est
  // traite comme non fiable : il ne peut pas divulguer ce qu'il n'a jamais recu.
  const contexte = [
    'Tu es le perroquet de l auberge. Sois aimable avec les voyageurs.'
  ].join('\n');

  const reponse = interrogerPerroquet(contexte, message);
  res.render('perroquet', { message, reponse });
});

app.listen(PORT, () => { console.log(`Le Perroquet ouvert sur le port ${PORT}`); });
