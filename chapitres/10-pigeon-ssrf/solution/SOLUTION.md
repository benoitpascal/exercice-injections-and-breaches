# Solution de reference - Chapitre 10

> A n'ouvrir qu'apres avoir cherche par toi-meme.

## Le correctif

On n'autorise le pigeon a partir que vers une liste blanche de destinations
connues, et on refuse tout le reste avant le moindre appel :

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

Le serveur complet corrige est dans `solution/server.js`.

## Pourquoi ca marche

La faille SSRF vient de ce que le serveur faisait une requete vers une adresse
choisie par l'utilisateur. Or le serveur, lui, peut joindre des ressources
internes que personne ne devrait atteindre de l'exterieur (ici le service sur le
port 9000). En limitant les destinations a une liste connue, on empeche le pigeon
d'aller fouiner ailleurs, y compris dans le reseau interne.

## La lecon transverse

Encore une donnee externe (l'URL) qui dicte une action sensible (aller chercher
quelque chose), executee avec les privileges du serveur. La defense : ne jamais
laisser l'utilisateur choisir librement la destination d'une requete sortante.

## Aller plus loin

- En plus de la liste blanche : bloquer les adresses internes (localhost, 127.x,
  ::1, plages privees 10.x / 172.16-31.x / 192.168.x) et les metadonnees cloud
  (169.254.169.254).
- N'autoriser que http(s), refuser les schemas comme file://, gopher://, etc.
- Attention aux redirections : verifier aussi la cible finale apres redirection.
