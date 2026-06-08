# Chapitre 2 : le Tableau d'Affichage

> Salle concernee : le hall de l'Auberge, ou sont punaises les avis de quete.
> Faille : injection de code dans le navigateur, variante **reflechie** (XSS reflechi).
> Difficulte : deuxieme marche.

## Le decor

A cote du Livre d'Or, un grand tableau de liege porte les avis de quete. Une barre
de recherche permet d'y trouver un avis par mot-cle. Ce que tu cherches est repris
dans la page sous la forme "Resultats pour : ...". Le tavernier a refait la meme
imprudence qu'au Livre d'Or, mais a un endroit different. A toi de voir.

Lance la salle :

```bash
docker compose up --build c02-xss-tableau
```

Puis ouvre http://127.0.0.1:4102 dans ton navigateur.

---

## Acte 1 - Le terrain

Cherche un avis normalement : tape `loup`, valide. La page affiche "Resultats pour :
loup" et l'avis correspondant. Essaie `toit`, `epices`. Tout fonctionne, la recherche
te renvoie ce que tu attends.

---

## Acte 2 - Le declic

Dans la barre de recherche, au lieu d'un mot-cle, colle **exactement** ceci, puis valide :

```html
<script>alert('Tableau pirate !')</script>
```

Une alerte surgit. Comme au chapitre precedent, tu n'as touche a aucun code : ton
texte de recherche s'est execute comme une instruction.

Regarde aussi la barre d'adresse de ton navigateur : elle contient maintenant
quelque chose comme `?q=<script>...`. Ton attaque est **dans l'URL**. Retiens-le,
c'est la difference avec le chapitre 1.

---

## Acte 3 - L'autopsie

### Pourquoi ca a marche

Ouvre `app/views/tableau.ejs` et trouve la ligne marquee `TODO securiser` :

```html
Resultats pour : "<%- q %>"
```

La balise `<%- %>` insere le terme recherche **brut** dans la page. Le navigateur
recoit ton `<script>` et l'execute, exactement comme au Livre d'Or. Juste au-dessus,
la valeur du champ de recherche utilise `<%= %>` (avec un `=`) : elle est deja
protegee, ce qui te montre encore l'endroit ou regarder.

### La difference avec le chapitre 1 : reflechi contre stocke

Maintenant, efface tout dans la barre de recherche, ou ouvre simplement
http://127.0.0.1:4102 sans rien apres. L'alerte ne se declenche plus. Recharge :
toujours rien.

C'est ca, un XSS **reflechi** : la charge n'est jamais enregistree. Elle ne vit que
le temps d'une requete, dans l'URL. Au chapitre 1, le `<script>` etait stocke en
base et rejoue a chaque visite ; ici, il faut que la victime ouvre **le lien piege**
pour que ca parte.

### La portee reelle

L'attaque vit dans l'URL, donc un attaquant fabrique un lien comme
`http://.../?q=<script>...vole tes infos...</script>`, le maquille, et te l'envoie
par message ou par mail. Si tu cliques, le script s'execute dans ton navigateur,
sur le site de confiance. Le tableau lui-meme n'a jamais ete modifie : c'est toi,
en ouvrant le lien, qui declenches le piege.

---

## Acte 4 - Le correctif

Dans `app/views/tableau.ejs`, sur la ligne marquee `TODO securiser`, remplace le
`<%-` par `<%=` (le tiret devient un signe egal) :

```html
Resultats pour : "<%= q %>"
```

Sauvegarde. nodemon recharge l'application. Si rien ne bouge :

```bash
docker compose restart c02-xss-tableau
```

EJS va desormais echapper le terme recherche avant de l'inserer dans la page.

> Correction de reference complete dans `solution/`, a n'ouvrir qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Relance ta recherche piegee (ou recolle le lien avec `?q=<script>...`). Cette fois,
la page affiche en clair : `Resultats pour : "<script>alert('Tableau pirate !')</script>"`,
sous forme de texte. Plus aucune alerte.

La donnee venue de l'URL n'a pas change ; c'est la facon de l'inserer dans la page
qui a change.

---

## Ce que tu emportes

- Meme faille que le chapitre 1 (du code injecte via une donnee), mais la donnee
  vient cette fois de l'**URL**, pas de la base.
- Reflechi : la charge vit dans le lien, le temps d'une requete. Stocke : la charge
  dort en base et frappe a chaque visite.
- La defense est identique : echapper la donnee selon son contexte d'affichage.

## Nettoyer

```bash
docker compose down
```
