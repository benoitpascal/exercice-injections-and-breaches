# Solution de reference - Chapitre 6

> A n'ouvrir qu'apres avoir cherche par toi-meme.

## Le correctif

On force les champs attendus a etre des chaines de caracteres avant de construire
le filtre :

```js
const filtre = {
  nom: String(req.body.nom == null ? '' : req.body.nom),
  mdp: String(req.body.mdp == null ? '' : req.body.mdp),
};
```

Le serveur complet corrige est dans `solution/server.js`.

## Pourquoi ca marche

L'attaque reposait sur l'envoi d'un objet (`{"$ne": ""}`) la ou le code attendait
une chaine. En forcant `String(...)`, cet objet devient la chaine `"[object Object]"`,
inerte, qui ne correspond a aucun utilisateur. Les connexions legitimes, deja des
chaines, ne changent pas.

## La lecon transverse

Comme en SQL, une donnee externe s'est melee a la logique de la requete. La
difference : le vecteur n'est pas la syntaxe (apostrophes) mais le **type** des
valeurs. D'ou la defense : maitriser le type et la forme des entrees.

## Aller plus loin

- Mieux qu'une coercion ponctuelle : valider les entrees avec un schema (par
  exemple zod, joi, ou les validations du framework) qui rejette tout ce qui n'est
  pas une chaine attendue.
- Avec un vrai pilote Mongo, configurer les options qui interdisent les operateurs
  venant des entrees (selon le driver et la version).
- Ne jamais stocker un mot de passe en clair : ici simplifie, en vrai on compare un
  hash (bcrypt, argon2).
