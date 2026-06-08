# Solution de reference - Chapitre 12

> A n'ouvrir qu'apres avoir cherche par toi-meme.

## Le correctif

On arrete de compiler le message comme un template. Le message devient une simple
donnee, et on remplace un jeton sur, `{plat}`, par du texte :

```js
const rendu = message.split('{plat}').join(PLAT_DU_JOUR);
res.render('menu', { modele: message, rendu, erreur: null });
```

La vue affiche `rendu` en l'echappant (`<%= rendu %>`), donc tout `<%= ... %>` tape
par l'utilisateur apparait comme du texte. Le serveur complet corrige est dans
`solution/server.js`.

## Pourquoi ca marche

Dans la version vulnerable, `ejs.render(message, ...)` compilait le message de
l'utilisateur comme un programme : `<%= 7*7 %>` etait calcule, et on pouvait
atteindre des objets du serveur (`process.env`, et plus loin l'execution de code).
En remplacant juste un jeton et en affichant le resultat de maniere echappee, le
message n'est plus jamais execute : il ne reste que du texte.

## La lecon transverse

C'est la meme frontiere que pour le XSS, cote serveur cette fois : ne jamais traiter
une donnee venue de l'utilisateur comme du code (ici, comme un template). Si tu as
besoin de placeholders, utilise un mecanisme sur (un remplacement de jetons connus),
pas un moteur de template nourri avec l'entree brute.

## Aller plus loin

- Ne jamais passer une entree utilisateur a `render` / `compile` / `eval` d'un
  moteur de template.
- Selon le moteur, une SSTI peut aller jusqu'a l'execution de code complet sur le
  serveur (lecture de fichiers, commandes). C'est pour ca que cette salle, comme les
  Cuisines, tourne dans un conteneur durci.
- Les placeholders legitimes se font avec les variables fournies au template par le
  code, jamais en laissant l'utilisateur ecrire la syntaxe du template.
