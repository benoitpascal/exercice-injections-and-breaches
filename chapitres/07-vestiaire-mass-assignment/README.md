# Chapitre 7 : le Vestiaire

> Salle concernee : le vestiaire, ou chaque client recupere son badge.
> Faille : affectation en masse (mass assignment).
> Difficulte : septieme marche.

## Le decor

Au vestiaire, ton badge affiche ton pseudo, ton statut (client) et ton or. Tu es
cense pouvoir changer ton pseudo, et rien d'autre : le statut et l'or sont geres
par la maison. Mais le formulaire est mal cable, et tu vas pouvoir te promouvoir
toi-meme.

La faille est dans le **serveur** (`app/server.js`).

Lance la salle :

```bash
docker compose up --build c07-mass-assignment
```

Puis ouvre http://127.0.0.1:4107 dans ton navigateur.

---

## Acte 1 - Le terrain

Change ton pseudo avec le formulaire, par exemple "Roland". Valide. Ton badge se
met a jour. Statut : toujours client. Or : toujours 50. Normal, tu n'as touche
qu'au pseudo.

---

## Acte 2 - Le declic

Le formulaire normal n'envoie que le pseudo. On passe par le **mode avance**, qui
ajoute des champs bruts a la requete. Dans la zone de texte, tape :

```text
role=Tavernier&or=9999
```

Clique sur "Envoyer avec ces champs". Ton badge passe au statut **Tavernier**, ton
or grimpe a 9999, et un **panneau du personnel** apparait, avec le code de la cave
et l'emplacement de la cle du grand coffre.

> Le formulaire ne devait me laisser changer que mon pseudo. En ajoutant des champs,
> j'ai modifie des proprietes qui ne m'appartenaient pas.

---

## Acte 3 - L'autopsie

Ouvre `app/server.js` et trouve la ligne marquee `TODO securiser` :

```js
Object.assign(profil, req.body);
```

`Object.assign` recopie **tous** les champs envoyes dans ton profil. Le serveur ne
fait aucune distinction entre "champs que l'utilisateur a le droit de changer" et
"champs reserves a la maison". Donc `role` et `or`, glisses dans la requete, ecrasent
les vraies valeurs. C'est l'affectation en masse : on lie aveuglement les donnees
recues aux proprietes d'un objet.

Dans la vraie vie, c'est ainsi qu'on se transforme en administrateur en ajoutant un
champ `isAdmin=true` a une mise a jour de profil.

---

## Acte 4 - Le correctif

On ne met a jour que les champs explicitement autorises. Dans `app/server.js`,
remplace la recopie globale par :

```js
if (typeof req.body.pseudo === 'string') {
  profil.pseudo = req.body.pseudo;
}
```

(Retire l'ancien `Object.assign(profil, req.body)`.) Sauvegarde. nodemon recharge.
Si rien ne bouge :

```bash
docker compose restart c07-mass-assignment
```

> Correctif complet dans `solution/server.js`, a n'ouvrir qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Renvoie `role=Tavernier&or=9999` via le mode avance. Cette fois, seul le pseudo
peut bouger : ton statut reste client, ton or reste 50, et le panneau du personnel
n'apparait pas. Les champs interdits sont ignores.

---

## Ce que tu emportes

- Recopier en bloc les donnees recues dans un objet (Object.assign, mise a jour
  "en masse" d'un ORM) laisse l'utilisateur ecrire des champs qu'il ne devrait pas.
- La parade : une liste blanche. Decider cote serveur quels champs sont modifiables,
  et ignorer tout le reste.
- Enumerer ce qui est autorise, jamais ce qui est interdit : on oublie toujours un
  champ sensible dans une liste noire.

## Nettoyer

```bash
docker compose down
```
