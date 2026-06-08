# Chapitre 13 : l'Atelier

> Salle concernee : l'atelier, ou l'on range les plans d'etabli.
> Faille : deserialisation non sure (insecure deserialization), menant a l'execution de code.
> Difficulte : treizieme marche. Salle a risque : conteneur durci.

## Le decor

Dans l'atelier, tu peux sauvegarder ton "plan d'etabli" (la disposition de tes
outils) et le restaurer plus tard en collant le plan sauvegarde. Pour le restaurer,
l'application utilise un outil de deserialisation un peu trop puissant : il sait
reconstruire des fonctions, et les executer. Un plan piege devient alors une arme.

Comme les Cuisines et le Menu, cette salle peut mener a de l'execution de code :
conteneur **durci**. La faille est dans le **serveur** (`app/server.js`).

Lance la salle :

```bash
docker compose up --build c13-deserialisation
```

Puis ouvre http://127.0.0.1:4113 dans ton navigateur.

---

## Acte 1 - Le terrain

Le champ est pre-rempli avec un plan normal :
`{"etabli":"chene","outils":["marteau","scie","ciseau"]}`. Clique sur "Restaurer le
plan". Le plan s'affiche tel quel, proprement. Normal : c'est juste des donnees.

---

## Acte 2 - Le declic

Maintenant, efface tout et colle ce plan piege :

```text
{"rce":"_$$ND_FUNC$$_function(){return require('child_process').execSync('cat /app/plan-secret.txt').toString()}()"}
```

Restaure. La propriete "rce" du plan restaure contient... le **plan secret de
l'atelier** et la combinaison de l'etabli blinde. Au moment de restaurer, l'outil a
reconstruit la fonction cachee dans le plan et l'a executee, qui est allee lire un
fichier secret.

> J'ai fourni un **plan a restaurer** (des donnees). L'outil y a vu une fonction et
> l'a executee. Mes donnees sont devenues du code.

---

## Acte 3 - L'autopsie

Ouvre `app/server.js` et trouve la ligne marquee `TODO securiser` :

```js
const objet = serialize.unserialize(plan);
```

`node-serialize.unserialize` n'est pas un simple lecteur de donnees : il sait
reconstruire des fonctions, grace a un marqueur special (`_$$ND_FUNC$$_`). Et la
fonction se declenche toute seule a la restauration (le `()` final en fait un appel
immediat). Donc en restaurant ton plan, le serveur a execute ton code.

Le piege est sournois parce que l'action a l'air anodine : on "restaure des donnees".
Personne ne s'attend a ce que lire un plan execute quelque chose.

---

## Acte 4 - Le correctif

On lit le plan avec `JSON.parse`, qui ne connait que des donnees (objets, tableaux,
nombres, chaines) et n'execute jamais rien. Dans `app/server.js` :

```js
const objet = JSON.parse(plan);
```

Tu peux aussi retirer l'import `const serialize = require('node-serialize');`. Comme
c'est un conteneur sans rechargement auto, applique le correctif :

```bash
docker compose restart c13-deserialisation
```

> Correctif complet dans `solution/server.js`, a n'ouvrir qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Recolle le plan piege et restaure. Cette fois, la propriete "rce" s'affiche telle
quelle, comme une longue chaine de texte (`_$$ND_FUNC$$_function...`), sans jamais
s'executer. JSON.parse n'a vu que du texte. Le plan normal du debut, lui, se
restaure toujours correctement.

---

## Ce que tu emportes

- Deserialiser des donnees non fiables avec un outil capable de reconstruire (et
  d'executer) du code, c'est ouvrir la porte a l'execution de code a distance.
- C'est la meme frontiere que partout : une donnee ne doit jamais pouvoir devenir
  du code.
- La parade : des formats de donnees pures (JSON.parse), et une validation de la
  structure obtenue avant de s'en servir. Jamais d'outil qui ressuscite du code.

## Nettoyer

```bash
docker compose down
```
