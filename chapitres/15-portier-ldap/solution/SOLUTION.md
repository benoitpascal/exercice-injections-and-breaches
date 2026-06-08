# Solution de reference - Chapitre 15

> A n'ouvrir qu'apres avoir cherche par toi-meme.

## Le correctif

On echappe les metacaracteres LDAP de l'identifiant et du mot de passe avant de
construire le filtre :

```js
function echapperLdap(valeur) {
  return String(valeur)
    .replace(/\\/g, '\\5c').replace(/\*/g, '\\2a')
    .replace(/\(/g, '\\28').replace(/\)/g, '\\29').replace(/\u0000/g, '\\00');
}
const filtre = `(&(uid=${echapperLdap(uid)})(motDePasse=${echapperLdap(motDePasse)}))`;
```

Le serveur complet corrige est dans `solution/server.js`.

## Pourquoi ca marche

Le caractere `*` est special en LDAP : dans un filtre, il veut dire "n'importe
quelle valeur". En l'envoyant comme mot de passe, on transformait
`(motDePasse=...)` en "le mot de passe existe, peu importe lequel", donc le portier
laissait entrer sans connaitre le vrai mot de passe. En echappant `*` (et les
autres metacaracteres) avant de l'inserer, il redevient un simple caractere : le
filtre cherche alors un mot de passe litteralement egal a `*`, que personne n'a.

## La lecon transverse

Encore la frontiere donnee / instruction : l'entree de l'utilisateur (une donnee)
ne doit pas pouvoir piloter la structure du filtre (l'instruction). On la neutralise
en echappant ce qui a un sens special dans le langage de destination.

## Aller plus loin

- Avec une vraie librairie LDAP, utilise les fonctions d'echappement fournies (par
  exemple pour les filtres et pour les DN), ou des requetes parametrees.
- Verifie aussi le role cote serveur apres l'authentification : ne te fie jamais a
  un champ envoye par le client pour decider des droits.
