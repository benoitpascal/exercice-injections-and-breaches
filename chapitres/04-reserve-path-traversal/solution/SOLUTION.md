# Solution de reference - Chapitre 4

> A n'ouvrir qu'apres avoir cherche par toi-meme.

## Le correctif

Dans `app/server.js`, apres avoir construit le chemin, on verifie qu'il reste a
l'interieur du dossier public avant de lire le fichier :

```js
const resolu = path.resolve(chemin);
const base = path.resolve(DOSSIER_PUBLIC);

if (resolu !== base && !resolu.startsWith(base + path.sep)) {
  erreur = "Acces refuse : ce document est hors de la reserve.";
} else {
  contenu = fs.readFileSync(resolu, 'utf8');
}
```

Le serveur complet corrige est dans `solution/server.js`.

## Pourquoi ca marche

`path.join` assemble le nom demande au dossier public, mais il interprete aussi
les `..` qui font remonter d'un cran. Un nom comme `../prive/...` sort donc du
dossier. La parade : resoudre le chemin final en absolu, puis verifier qu'il
commence bien par le chemin absolu du dossier autorise. Sinon, on refuse.

## La lecon transverse

Encore une donnee venue de l'exterieur (le nom de fichier) traitee comme une
instruction de confiance. La defense consiste a ne jamais utiliser cette donnee
pour atteindre une ressource sans verifier qu'elle reste dans les limites prevues.

## Aller plus loin

- Mieux encore quand c'est possible : ne pas accepter de chemin du tout, mais une
  liste blanche (un identifiant qui correspond a un fichier connu cote serveur).
- Se mefier aussi des variantes encodees (`%2e%2e%2f`) : valider apres decodage.
