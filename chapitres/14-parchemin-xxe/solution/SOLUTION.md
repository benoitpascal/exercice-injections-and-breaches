# Solution de reference - Chapitre 14

> A n'ouvrir qu'apres avoir cherche par toi-meme.

## Le correctif

On refuse tout parchemin contenant une definition de type (DOCTYPE) ou une entite,
et on ne resout plus aucune entite externe :

```js
if (/<!DOCTYPE|<!ENTITY/i.test(xml)) {
  return { contenu: null, erreur: 'Parchemin refuse...' };
}
```

Le serveur complet corrige est dans `solution/server.js`.

## Pourquoi ca marche

La faille XXE vient de ce que l'analyseur resolvait les entites externes : une
entite `SYSTEM "file://..."` faisait lire un fichier de la machine. En interdisant
le DOCTYPE et les entites (donc en desactivant la resolution d'entites externes),
le parchemin ne peut plus pointer vers un fichier : il ne reste que son message.

## Le lien avec un vrai parseur XML

Cette salle utilise un petit analyseur maison pour rester sans dependance native,
mais le probleme est exactement celui d'un vrai parseur XML laisse en configuration
permissive. La defense reelle est la meme : desactiver le traitement des DTD et des
entites externes dans le parseur (souvent une simple option de configuration).

## Aller plus loin

- Dans un vrai projet, configure ton parseur XML pour interdire les DTD et les
  entites externes (l'option exacte depend de la librairie).
- Si tu n'as pas besoin de XML, prefere un format plus simple (JSON), qui n'a pas
  ce mecanisme d'entites.
- XXE peut aussi servir a faire des requetes sortantes (SSRF) via des entites
  pointant vers des URL : la meme desactivation protege contre les deux.
