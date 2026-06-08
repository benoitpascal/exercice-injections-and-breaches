# Chapitre 4 : La Reserve

> Salle concernee : la reserve, ou l'auberge range ses documents.
> Faille : traversee de repertoire (path traversal).
> Difficulte : quatrieme marche.

## Le decor

La reserve contient des documents publics : recettes, inventaire, regles de la
maison. Un petit lecteur permet d'ouvrir un document par son nom. Mais la reserve
jouxte un coffre a archives ou dort un document que personne ne devrait lire. Le
lecteur, mal concu, va te laisser y acceder.

Comme au chapitre precedent, la faille est dans le **serveur** (`app/server.js`).

Lance la salle :

```bash
docker compose up --build c04-path-traversal
```

Puis ouvre http://127.0.0.1:4104 dans ton navigateur.

---

## Acte 1 - Le terrain

Clique sur un document de la liste, par exemple "recette-tourte.txt". Son contenu
s'affiche. L'adresse devient `http://127.0.0.1:4104/lire?fichier=recette-tourte.txt`.
Ouvre les autres : tout fonctionne, tu lis les documents publics de la reserve.

---

## Acte 2 - Le declic

Dans le champ "Nom du document a lire", au lieu d'un nom de la liste, tape
**exactement** ceci, puis valide :

```text
../prive/livre-de-comptes-secret.txt
```

Le livre de comptes secret de l'auberge s'affiche : dettes du bourgmestre,
pot-de-vin, emplacement d'un coffre cache. Ce fichier ne fait pas partie de la
reserve publique, il est range ailleurs. Tu viens d'en sortir.

> J'ai fourni un **nom de fichier**. Avec quelques `../`, je suis remonte hors du
> dossier autorise et j'ai lu ce que je voulais.

---

## Acte 3 - L'autopsie

Ouvre `app/server.js` et trouve la ligne marquee `TODO securiser` :

```js
const chemin = path.join(DOSSIER_PUBLIC, demande);
```

`path.join` colle ton nom de fichier au dossier public. Le souci : il interprete
aussi les `..`, qui veulent dire "remonte d'un dossier". Donc
`documents/ + ../prive/secret.txt` devient `prive/secret.txt`, en dehors du dossier
prevu. Le serveur lit alors n'importe quel fichier auquel il a acces.

Pousser plus loin (sans danger, on est dans un conteneur jetable) : essaie
`../../../../etc/passwd`. Tu lis le fichier systeme du conteneur. Ca illustre
jusqu'ou la remontee peut aller. Et c'est exactement pour ce genre de cas que le
conteneur est verrouille : meme cette lecture reste prisonniere de la boite.

---

## Acte 4 - Le correctif

Dans `app/server.js`, apres avoir construit `chemin`, verifie que le chemin final
reste bien a l'interieur du dossier public avant de lire :

```js
const resolu = path.resolve(chemin);
const base = path.resolve(DOSSIER_PUBLIC);

if (resolu !== base && !resolu.startsWith(base + path.sep)) {
  erreur = "Acces refuse : ce document est hors de la reserve.";
} else {
  contenu = fs.readFileSync(resolu, 'utf8');
}
```

(Pense a retirer l'ancien `fs.readFileSync` non protege.) Sauvegarde. nodemon
recharge. Si rien ne bouge :

```bash
docker compose restart c04-path-traversal
```

> Correctif complet dans `solution/server.js`, a n'ouvrir qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Retente `../prive/livre-de-comptes-secret.txt`. Cette fois, la page repond "Acces
refuse : ce document est hors de la reserve". Les documents publics, eux, restent
lisibles. La porte de la reserve ne s'ouvre plus que sur la reserve.

---

## Ce que tu emportes

- Un nom de fichier venu de l'exterieur ne doit jamais servir a atteindre un
  fichier sans verifier qu'on reste dans le dossier autorise.
- Les `../` permettent de remonter l'arborescence : c'est le coeur du path traversal.
- La parade : resoudre le chemin en absolu, puis verifier qu'il commence par le
  dossier autorise. Encore mieux quand c'est possible : ne pas accepter de chemin
  du tout, mais une liste blanche de fichiers connus.

## Nettoyer

```bash
docker compose down
```
