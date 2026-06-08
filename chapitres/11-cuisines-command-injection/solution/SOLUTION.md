# Solution de reference - Chapitre 11

> A n'ouvrir qu'apres avoir cherche par toi-meme.

## Le correctif

On abandonne le shell. Au lieu de construire une chaine de commande, on lance
directement le programme avec ses arguments passes a part, via `execFile` :

```js
const { execFile } = require('child_process');

execFile('grep', ['-c', '-i', ingredient, '/app/garde-manger.txt'], (err, stdout, stderr) => {
  // ...
});
```

Le serveur complet corrige est dans `solution/server.js`.

## Pourquoi ca marche

Avec `exec`, l'entree etait collee dans une chaine que le **shell** interpretait :
les `;`, `&&`, `|` y avaient un sens et permettaient d'enchainer des commandes.
Avec `execFile`, il n'y a pas de shell : `grep` est lance directement, et l'entree
devient un seul argument (un motif de recherche). Tape ce que tu veux dedans, ce
ne sera jamais qu'un texte recherche, jamais une commande.

## La lecon transverse

Encore une donnee externe qui se melait a une commande. La defense n'est pas de
filtrer les caracteres dangereux a la main (fragile), mais de supprimer le shell :
appeler le programme directement avec des arguments separes.

## Aller plus loin

- Si tu peux eviter d'appeler un programme externe, fais-le (ici, lire et compter
  dans le fichier en JavaScript pur eviterait tout appel systeme).
- Si tu dois absolument passer par un shell, valide l'entree contre une liste tres
  stricte (par exemple uniquement des lettres), mais c'est un pis-aller.
- Donne au processus le minimum de droits (pas de root), ce que fait deja le
  conteneur de cette salle.
