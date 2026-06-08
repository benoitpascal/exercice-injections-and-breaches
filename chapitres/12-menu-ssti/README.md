# Chapitre 12 : le Menu du Jour

> Salle concernee : l'ardoise du menu, a l'entree de la salle commune.
> Faille : injection de template cote serveur (SSTI).
> Difficulte : douzieme marche. Salle a risque : conteneur durci.

## Le decor

Le tavernier te laisse composer l'annonce du menu, avec la possibilite d'inserer le
plat du jour grace a un petit code, `<%= plat %>`. Pratique. Sauf que, pour le
faire, l'application traite tout ton message comme un **programme**. Et si elle
execute `<%= plat %>`, elle execute aussi tout ce que tu mets entre `<%= %>`.

Comme les Cuisines, cette salle peut mener a de l'execution de code sur le serveur :
elle tourne donc dans un conteneur **durci** (non-root, lecture seule, capacites
retirees). La faille est dans le **serveur** (`app/server.js`).

Lance la salle :

```bash
docker compose up --build c12-ssti-menu
```

Puis ouvre http://127.0.0.1:4112 dans ton navigateur.

---

## Acte 1 - Le terrain

Ecris une annonce normale en utilisant le placeholder, par exemple :

```text
Au menu ce soir : <%= plat %>
```

Affiche. Tu obtiens "Au menu ce soir : tourte aux champignons". Le placeholder a
bien ete remplace par le plat du jour. Pratique, non ?

---

## Acte 2 - Le declic

Si `<%= plat %>` est calcule, alors n'importe quel calcul l'est aussi. Tape :

```text
<%= 7*7 %>
```

Affiche. Resultat : **49**. Ton texte a ete execute comme du code, pas affiche tel
quel. Maintenant, pousse vers quelque chose de sensible. Tape :

```text
<%= JSON.stringify(process.env) %>
```

L'annonce te recrache les variables d'environnement du serveur, et parmi elles la
**cle du grand coffre** (rangee dans `SECRET_AUBERGE`). Tu lis des secrets du
serveur, juste en ecrivant le menu.

> J'ai fourni un **texte d'annonce**. Le serveur l'a traite comme un programme, et
> a execute mon code.

---

## Acte 3 - L'autopsie

Ouvre `app/server.js` et trouve la ligne marquee `TODO securiser` :

```js
rendu = ejs.render(modele, { plat: PLAT_DU_JOUR });
```

`ejs.render(modele, ...)` compile **ton message** comme un template EJS et l'execute.
C'est pratique pour `<%= plat %>`, mais ca veut dire que `<%= ... %>` execute
n'importe quel code JavaScript cote serveur : lire l'environnement, et selon le
moteur, aller jusqu'a executer des commandes. C'est l'injection de template cote
serveur : on a laisse l'utilisateur ecrire un programme.

---

## Acte 4 - Le correctif

On arrete de traiter le message comme un template. Le message redevient une simple
donnee, et on remplace un jeton sur, `{plat}`, par du texte. Dans `app/server.js`,
remplace la route `/menu` par :

```js
app.post('/menu', (req, res) => {
  const message = req.body.message || '';
  const rendu = message.split('{plat}').join(PLAT_DU_JOUR);
  res.render('menu', { modele: message, rendu, erreur: null });
});
```

Tu peux aussi retirer l'import `const ejs = require('ejs');` devenu inutile. Comme
c'est un conteneur sans rechargement automatique, applique le correctif :

```bash
docker compose restart c12-ssti-menu
```

> Correctif complet dans `solution/server.js`, a n'ouvrir qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Le placeholder est desormais `{plat}` (et non plus `<%= plat %>`). Ecris
`Au menu ce soir : {plat}` : tu obtiens bien la tourte. Maintenant retape
`<%= 7*7 %>` ou `<%= JSON.stringify(process.env) %>` : cette fois, ils s'affichent
**tels quels, comme du texte**. Plus aucun calcul, plus aucune fuite. Le message
n'est plus jamais execute.

---

## Ce que tu emportes

- Donner une entree utilisateur a un moteur de template (render, compile, eval),
  c'est lui laisser ecrire un programme execute sur ton serveur.
- C'est la meme frontiere que le XSS, cote serveur : une donnee ne doit jamais
  devenir du code.
- Pour des placeholders, utilise un mecanisme sur (remplacement de jetons connus)
  et affiche le resultat de maniere echappee, jamais un moteur de template nourri
  avec l'entree brute.

## Nettoyer

```bash
docker compose down
```
