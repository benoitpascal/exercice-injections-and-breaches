# Chapitre 8 : le Panneau Indicateur

> Salle concernee : le panneau a l'entree, qui oriente vers les salles.
> Faille : redirection ouverte (open redirect).
> Difficulte : huitieme marche.

## Le decor

Le panneau indicateur t'envoie vers les salles de l'auberge en passant par une
adresse du type `/aller?vers=/salle/cuisine`. Pratique. Sauf qu'il accepte
n'importe quelle destination, y compris en dehors de l'auberge.

La faille est dans le **serveur** (`app/server.js`).

Lance la salle :

```bash
docker compose up --build c08-open-redirect
```

Puis ouvre http://127.0.0.1:4108 dans ton navigateur.

---

## Acte 1 - Le terrain

Clique sur "Vers cuisine", "Vers cave". Le panneau te conduit a la bonne salle.
Regarde l'adresse : tu passes a chaque fois par `/aller?vers=/salle/...`. Tout est
interne a l'auberge.

---

## Acte 2 - Le declic

Dans le champ "Destination libre", efface le contenu et tape une adresse externe :

```text
https://example.com
```

Clique sur "M'y conduire". Le panneau de l'auberge vient de t'envoyer **hors de
l'auberge**, sur un site qui ne lui appartient pas.

> J'ai fourni une **destination**. Le panneau m'y a envoye sans se demander si
> elle faisait partie de l'auberge.

---

## Acte 3 - L'autopsie

Ouvre `app/server.js` et trouve la ligne marquee `TODO securiser` :

```js
res.redirect(vers);
```

Le serveur redirige vers la destination demandee, quelle qu'elle soit. Un chemin
interne comme `/salle/cave`, ca va. Mais une URL absolue comme `https://example.com`
est acceptee pareil : la redirection sort du site.

Pourquoi c'est dangereux : c'est l'arme du hameconnage. Un attaquant fabrique un
lien qui commence par le domaine de confiance de l'auberge,
`http://.../aller?vers=https://faux-site...`, te l'envoie, et tu atterris sur un
faux site en croyant rester chez un site de confiance. Le mauvais domaine est
cache derriere le bon.

---

## Acte 4 - Le correctif

On n'autorise que les destinations internes : un chemin qui commence par un seul
`/`. Dans `app/server.js`, ajoute la verification avant la redirection :

```js
function destinationInterne(vers) {
  return typeof vers === 'string' && vers.startsWith('/') && !vers.startsWith('//');
}

if (!destinationInterne(vers)) {
  return res.redirect('/');
}
res.redirect(vers);
```

Sauvegarde. nodemon recharge. Si rien ne bouge :

```bash
docker compose restart c08-open-redirect
```

> Correctif complet dans `solution/server.js`, a n'ouvrir qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Retape `https://example.com` dans la destination libre. Cette fois, le panneau te
ramene a l'accueil de l'auberge au lieu de t'envoyer dehors. Les destinations
internes (`/salle/cave`) continuent de fonctionner.

---

## Ce que tu emportes

- Rediriger vers une destination fournie par l'utilisateur, sans verification,
  permet d'envoyer les gens n'importe ou (surtout vers des faux sites).
- La parade : n'accepter que des destinations internes (un chemin commencant par
  un seul `/`), ou mieux, une liste de cibles connues referencees par identifiant.
- C'est un cas particulier de la meme regle : une donnee externe ne doit pas dicter
  un comportement sensible sans controle.

## Nettoyer

```bash
docker compose down
```
