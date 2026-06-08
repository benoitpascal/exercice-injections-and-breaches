# Solution de reference - Chapitre 5

> A n'ouvrir qu'apres avoir cherche par toi-meme.

## Le correctif

On remplace la requete construite par concatenation par une requete parametree :

```js
const requete = 'SELECT nom, role, note FROM utilisateurs WHERE nom = ? AND mdp = ?';
const stmt = db.prepare(requete);
stmt.bind([nom, mdp]);
let utilisateur = null;
if (stmt.step()) {
  utilisateur = stmt.getAsObject();
} else {
  erreur = 'Identifiants invalides.';
}
stmt.free();
```

Le serveur complet corrige est dans `solution/server.js`.

## Pourquoi ca marche

Dans la version vulnerable, le texte de l'utilisateur etait colle dans la chaine
SQL : l'apostrophe et les `--` y prenaient un sens grammatical. Avec une requete
parametree, la base recoit d'abord la commande (avec ses `?`), puis les valeurs a
part. Une valeur reste une valeur, quoi qu'elle contienne : elle ne peut plus
modifier la structure de la requete.

## La lecon transverse

Encore une donnee externe qui devient instruction. Comme pour le XSS, la defense
consiste a maintenir la frontiere entre donnee et code, ici via la separation
commande / parametres offerte par le pilote de base de donnees.

## Aller plus loin

- Ne jamais "echapper les apostrophes a la main" : c'est fragile et contournable.
  La requete parametree est la seule reponse robuste.
- En complement : ne jamais stocker un mot de passe en clair (ici simplifie pour
  l'exercice). En vrai, on stocke un hash (bcrypt, argon2) et on compare le hash.
- Donner a l'application un compte base avec le minimum de droits necessaires.
