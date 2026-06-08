# Solution de reference - Chapitre 3

> A n'ouvrir qu'apres avoir cherche par toi-meme.

## Le correctif

Dans `app/server.js`, route `/coffre/:id`, on ajoute un controle d'acces juste
avant d'afficher le coffre :

```js
if (id !== MON_ID) {
  return res.status(403).render('refus', { id });
}
```

Le serveur complet corrige est dans `solution/server.js`.

## Pourquoi ca marche

La faille ne venait pas de l'affichage mais de l'absence de verification : on
servait n'importe quel coffre des qu'on en connaissait le numero. Le controle
relie la ressource demandee (l'id du coffre) a l'identite de la personne (MON_ID),
et refuse tout ce qui ne correspond pas.

## La lecon transverse

Comme dans les chapitres precedents, une donnee venue de l'exterieur (ici l'id de
l'URL) est traitee comme une instruction de confiance. La defense n'est plus
l'echappement mais le **controle d'acces** : a chaque acces a une ressource, se
demander "cette personne a-t-elle le droit ?", cote serveur, jamais cote client.

## Aller plus loin

- Ne jamais se reposer sur le fait qu'un identifiant est "difficile a deviner"
  (UUID, hash). C'est utile, mais ce n'est pas un controle d'acces.
- Centraliser la verification des droits (un middleware, une fonction unique)
  plutot que de la repeter, oubliable, dans chaque route.
