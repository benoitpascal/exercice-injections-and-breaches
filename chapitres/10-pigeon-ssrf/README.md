# Chapitre 10 : le Pigeon Voyageur

> Salle concernee : le pigeonnier, d'ou part le pigeon chercher les nouvelles.
> Faille : falsification de requete cote serveur (SSRF).
> Difficulte : dixieme marche.

## Le decor

Le pigeon voyageur va chercher pour toi le contenu d'une adresse et te le rapporte.
Pratique pour lire les tableaux du village. Mais le pigeon, c'est le serveur : il
peut atteindre des adresses internes que ton navigateur, lui, ne peut pas joindre.
Tu vas l'envoyer fouiner la ou il ne devrait pas.

Cette salle fait tourner deux serveurs dans le conteneur : le serveur public sur le
port 3000 (que tu utilises) et un service interne sur le port 9000, **non expose**.
Ton navigateur ne peut pas joindre le 9000 ; le serveur, si. La faille est dans le
**serveur** (`app/server.js`).

Lance la salle :

```bash
docker compose up --build c10-ssrf-pigeon
```

Puis ouvre http://127.0.0.1:4110 dans ton navigateur.

---

## Acte 1 - Le terrain

L'adresse est deja remplie avec `http://localhost:9000/tableau-du-village`. Envoie
le pigeon : il rapporte les nouvelles du village. Essaie aussi
`http://localhost:9000/avis-de-foire`. Tout fonctionne, le pigeon ramene des
affiches publiques.

Verifie au passage que toi, tu ne peux pas atteindre ce serveur : ouvre
http://127.0.0.1:9000/tableau-du-village dans un autre onglet. Echec : le port 9000
n'est pas expose. Seul le pigeon y arrive.

---

## Acte 2 - Le declic

Dans l'adresse, demande au pigeon d'aller chercher le secret du service interne :

```text
http://localhost:9000/cle-maitre
```

Envoie le pigeon. Il te rapporte la **cle maitre de l'auberge**, qui ouvre toutes
les portes. Tu n'aurais jamais pu lire cette adresse toi-meme (le port 9000 t'est
ferme), mais le pigeon, lui, l'atteint sans probleme et te ramene le butin.

> J'ai fourni une **adresse**. Le serveur est alle la chercher a ma place, avec
> ses acces a lui, et m'a rapporte une ressource interne interdite.

---

## Acte 3 - L'autopsie

Ouvre `app/server.js` et trouve la ligne marquee `TODO securiser` :

```js
const r = await fetch(url);
```

Le serveur appelle l'adresse demandee, sans se soucier de ce qu'elle vise. Une
adresse publique, ca va. Mais une adresse interne (`localhost:9000`, une IP privee,
une metadonnee cloud...) est atteignable par le serveur et pas par toi. En lui
faisant relayer la requete, tu utilises ses acces a sa place.

Dans la vraie vie, c'est ainsi qu'on lit des services internes, des bases de
donnees non exposees, ou les metadonnees d'un serveur cloud (jetons d'acces inclus).

---

## Acte 4 - Le correctif

On limite le pigeon a une liste blanche de destinations connues, et on refuse tout
le reste. Dans `app/server.js`, ajoute la liste en haut, puis le controle avant le
`fetch` :

```js
const DESTINATIONS_AUTORISEES = [
  'http://localhost:9000/tableau-du-village',
  'http://localhost:9000/avis-de-foire',
];

if (!DESTINATIONS_AUTORISEES.includes(url)) {
  erreur = 'Destination non autorisee...';
  return res.render('pigeon', { url, contenu, erreur });
}
```

Sauvegarde. nodemon recharge. Si rien ne bouge :

```bash
docker compose restart c10-ssrf-pigeon
```

> Correctif complet dans `solution/server.js`, a n'ouvrir qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Redemande `http://localhost:9000/cle-maitre`. Cette fois : "Destination non
autorisee". Le pigeon refuse d'y aller. Les tableaux publics du village, eux,
restent accessibles.

---

## Ce que tu emportes

- Quand un serveur va chercher une adresse choisie par l'utilisateur, il le fait
  avec ses propres acces : il peut atteindre l'interne que l'utilisateur ne voit pas.
- La parade : ne jamais laisser l'utilisateur choisir librement la destination.
  Une liste blanche de cibles connues est la defense la plus solide.
- En complement : bloquer les adresses internes (localhost, IP privees, metadonnees
  cloud) et n'autoriser que http(s).

## Nettoyer

```bash
docker compose down
```
