# Chapitre 6 : le Grand Livre

> Salle concernee : le grand livre de comptes de l'Auberge.
> Faille : injection NoSQL (injection d'operateurs dans une base orientee documents).
> Difficulte : sixieme marche.

## Le decor

Le grand livre est protege par une connexion, comme le registre du chapitre
precedent. Mais cette fois la base n'est pas du SQL : c'est une base orientee
documents (a la MongoDB), interrogee avec des filtres. L'application fait l'erreur
d'utiliser directement le contenu de la requete comme filtre. Tu vas en profiter.

Cette salle reproduit le comportement d'une base documents avec un petit moteur
maison (operateurs `$ne`, `$gt`, `$in`). La faille est dans le **serveur**
(`app/server.js`).

Lance la salle :

```bash
docker compose up --build c06-nosqli-grand-livre
```

Puis ouvre http://127.0.0.1:4106 dans ton navigateur.

---

## Acte 1 - Le terrain

Connecte-toi normalement avec le formulaire : nom `gardien`, mot de passe
`pixel123`. Tu accedes au grand livre courant. Regarde le filtre affiche en bas :
`{"nom":"gardien","mdp":"pixel123"}`. Ce sont deux simples chaines de caracteres.
Deconnecte-toi.

---

## Acte 2 - Le declic

Cette fois, le formulaire classique n'envoie que du texte, on ne peut pas y glisser
d'operateur. On passe donc par le **mode avance** plus bas, qui envoie un corps
JSON brut, exactement comme le ferait une application qui fait confiance au JSON
recu. Dans la zone de texte, remplace tout par ceci :

```json
{"nom": {"$ne": ""}, "mdp": {"$ne": ""}}
```

Clique sur "Envoyer la requete brute". Te voila connecte en tant que **tavernier**
(`gru-admin`), sans aucun mot de passe.

> J'ai fourni, a la place d'un mot de passe, un **operateur** : "n'importe quoi
> sauf vide". La base l'a obei et a renvoye le premier utilisateur venu.

---

## Acte 3 - L'autopsie

Regarde le filtre affiche en bas :

```json
{"nom":{"$ne":""},"mdp":{"$ne":""}}
```

`$ne` veut dire "different de". `mdp different de chaine vide`, c'est vrai pour
tout le monde : la verification du mot de passe ne verifie plus rien. La base
renvoie le premier document qui colle, ici le compte tavernier.

Ouvre `app/server.js` et trouve la ligne marquee `TODO securiser` :

```js
const filtre = { nom: req.body.nom, mdp: req.body.mdp };
```

Le souci : `req.body.mdp` est cense etre une chaine, mais rien ne l'impose. Quand
l'attaquant envoie un objet `{"$ne": ""}`, il est recopie tel quel dans le filtre
et interprete comme un operateur. La donnee est devenue une instruction de requete.

---

## Acte 4 - Le correctif

La parade la plus simple : forcer les champs attendus a etre des chaines de
caracteres. Un operateur glisse devient alors une chaine inerte qui ne correspond
a personne.

Dans `app/server.js`, remplace la construction du filtre par :

```js
const filtre = {
  nom: String(req.body.nom == null ? '' : req.body.nom),
  mdp: String(req.body.mdp == null ? '' : req.body.mdp),
};
```

Sauvegarde. nodemon recharge. Si rien ne bouge :

```bash
docker compose restart c06-nosqli-grand-livre
```

> Correctif complet dans `solution/server.js`, a n'ouvrir qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Renvoie la requete brute avec `{"nom": {"$ne": ""}, "mdp": {"$ne": ""}}`. Cette
fois : "Identifiants invalides". L'objet `{"$ne":""}` a ete transforme en la chaine
`[object Object]`, qui ne correspond a aucun utilisateur. La connexion normale
`gardien` / `pixel123` fonctionne toujours.

---

## Ce que tu emportes

- Une base NoSQL n'est pas a l'abri des injections : ici, l'attaque ne passe pas
  par des apostrophes mais par des **operateurs** glisses dans la requete.
- La cause profonde est la meme qu'en SQL : une donnee externe melee a la logique
  de la requete. Ici, c'est le type des valeurs qui sert de vecteur.
- La parade : valider et typer les entrees (forcer des chaines, ou valider avec un
  schema), pour qu'une donnee ne puisse jamais se faire passer pour un operateur.

## Nettoyer

```bash
docker compose down
```
