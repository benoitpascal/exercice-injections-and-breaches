# Solution de reference - Chapitre 13

> A n'ouvrir qu'apres avoir cherche par toi-meme.

## Le correctif

On remplace l'outil de deserialisation qui sait reconstruire des fonctions par un
simple `JSON.parse`, qui ne reconstruit que des donnees :

```js
const objet = JSON.parse(plan);
```

On peut aussi retirer l'import `const serialize = require('node-serialize');`. Le
serveur complet corrige est dans `solution/server.js`.

## Pourquoi ca marche

`node-serialize.unserialize` sait reconstruire des fonctions a partir d'un marqueur
special, et il les execute. Un plan piege contenant une fonction se declenche donc
au moment de la restauration. `JSON.parse`, lui, ne connait que des donnees : un
objet, un tableau, un nombre, une chaine. Le marqueur de fonction n'est plus qu'une
chaine de caracteres inerte, jamais executee.

## La lecon transverse

C'est la meme frontiere encore : une donnee venue de l'exterieur (le plan) ne doit
jamais pouvoir devenir du code. Deserialiser avec un outil capable d'executer, c'est
exactement ouvrir cette porte.

## Aller plus loin

- Ne jamais deserialiser des donnees non fiables avec un outil qui reconstruit du
  code (node-serialize, certaines configurations de YAML, le pickle de Python, la
  serialisation Java native, etc.).
- Preferer des formats de donnees pures (JSON) et valider la structure obtenue
  (par exemple avec un schema) avant de l'utiliser.
