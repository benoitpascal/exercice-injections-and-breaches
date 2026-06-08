# Solution de reference - Chapitre 7

> A n'ouvrir qu'apres avoir cherche par toi-meme.

## Le correctif

On remplace la recopie globale du corps par une mise a jour des seuls champs
autorises :

```js
if (typeof req.body.pseudo === 'string') {
  profil.pseudo = req.body.pseudo;
}
```

Le serveur complet corrige est dans `solution/server.js`.

## Pourquoi ca marche

`Object.assign(profil, req.body)` copiait tous les champs envoyes, y compris ceux
que l'utilisateur n'a pas le droit de changer (role, or). En ne lisant que les
champs explicitement permis, les champs interdits du corps sont ignores : ils ne
peuvent plus ecraser quoi que ce soit.

## La lecon transverse

Encore une donnee externe a qui on a donne trop de pouvoir : ici, le corps de la
requete pouvait modifier n'importe quel champ de l'objet. La defense est une liste
blanche : decider cote serveur quels champs sont modifiables, et ignorer le reste.

## Aller plus loin

- Liste blanche plutot que liste noire : enumerer ce qui est autorise, pas ce qui
  est interdit (on oublie toujours un champ interdit).
- Avec un ORM, se mefier des methodes de creation/mise a jour "en masse" : preciser
  les champs autorises (par exemple via un DTO ou une option de selection de champs).
