# Chapitre 1 : le Livre d'Or

> Salle concernee : l'entree de l'Auberge.
> Faille : injection de code dans le navigateur, variante **stockee** (XSS stocke).
> Difficulte : premiere marche.

## Le decor

A l'entree de l'Auberge du Pixel trone un grand livre relie de cuir : le Livre d'Or.
Chaque voyageur y laisse un mot. Le tavernier est fier de son livre... mais il a
commis une imprudence. Tout ce qu'on y ecrit est reaffiche tel quel aux visiteurs
suivants, sans la moindre precaution. A toi de decouvrir ce que ca permet.

Lance la salle :

```bash
docker compose up --build c01-xss-livre-dor
```

Puis ouvre http://127.0.0.1:4101 dans ton navigateur.

---

## Acte 1 - Le terrain

Regarde la page. Un formulaire, deux messages d'ambiance deja signes.

Signe le livre normalement : mets un nom, un message de voyageur ("Belle auberge,
je reviendrai"), valide. Ton message apparait dans la liste. Tout est normal,
rien ne semble dangereux. C'est exactement l'impression que la faille adore donner.

Garde bien en tete cette sensation de "tout va bien". Le contraste arrive.

---

## Acte 2 - Le declic

Re-signe le livre, mais cette fois, au lieu d'un message, colle **exactement** ceci
dans la zone de message :

```html
<script>alert('Auberge piratee !')</script>
```

Valide.

Une fenetre d'alerte surgit. Tu n'as pas touche au code de l'application. Tu as
juste rempli un champ de formulaire... et pourtant, du **code** s'est execute dans
la page.

Retiens cette phrase, c'est le coeur de tout l'exercice :

> J'etais cense fournir une **donnee**. J'ai fourni une **instruction**.
> Et le systeme l'a obeie.

---

## Acte 3 - L'autopsie

### Pourquoi ca a marche

Ferme l'alerte et recharge la page (F5). L'alerte **revient**. Quitte la page,
reviens : elle revient encore. Ton `<script>` n'etait pas un accident d'affichage
ponctuel. Il a ete **enregistre** par le serveur, et il est rejoue a chaque ouverture
de la page. C'est ca qu'on appelle un XSS **stocke** : la charge dort dans les
donnees et se reveille a chaque visite (par opposition au XSS reflechi, qui ne
frappe qu'une fois, dans la reponse immediate).

Ouvre maintenant `app/views/livre-dor.ejs` et trouve la ligne marquee `TODO securiser` :

```html
<div class="contenu"><%- entree.message %></div>
```

La balise `<%- %>` insere ton message **brut** dans la page HTML. Le navigateur ne
fait pas la difference entre "du texte que le tavernier voulait afficher" et "des
balises a executer" : il voit `<script>`, donc il execute. Juste au-dessus, le nom
de l'auteur utilise `<%= %>` (avec un `=`) : essaie d'injecter ton script dans le
champ **nom** plutot que dans le message, tu verras qu'il ne s'execute pas. Indice
sur la solution, deja.

### Pousser l'attaque plus loin

Une alerte, c'est mignon. Mesure la vraie portee. Re-signe avec ceci :

```html
<img src=x onerror="document.body.innerHTML='<h1 style=color:red;text-align:center;margin-top:40vh>AUBERGE PIRATEE</h1>'">
```

Toute la page est remplacee. Un attaquant pourrait tout aussi bien rediriger le
visiteur, voler ses informations de session, ou afficher un faux formulaire de
connexion. Et comme c'est **stocke**, dans une vraie auberge ce piege frapperait
**chaque visiteur** qui ouvre la page, pas seulement toi. Tu n'as eu besoin
d'aucun acces privilegie : juste d'un champ de formulaire ouvert au public.

---

## Acte 4 - Le correctif

On va apprendre au livre a se mefier de ce qu'on y ecrit.

Dans `app/views/livre-dor.ejs`, sur la ligne marquee `TODO securiser`, remplace
le `<%-` par `<%=` (change juste le tiret en signe egal) :

```html
<div class="contenu"><%= entree.message %></div>
```

Sauvegarde. nodemon recharge l'application tout seul (tu verras passer une ligne
dans le terminal). Si rien ne bouge, relance la salle :

```bash
docker compose restart c01-xss-livre-dor
```

Ce changement minime dit a EJS : avant d'inserer le message dans la page, **echappe**
les caracteres dangereux. Le `<` deviendra `&lt;`, et le navigateur affichera les
caracteres au lieu de les interpreter.

> La correction de reference complete est dans `solution/SOLUTION.md`,
> a ne consulter qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Recharge la page. Surprise : les pieges que tu avais plantes aux actes 2 et 3
**s'affichent maintenant en clair**, sous forme de texte. Tu vois litteralement
`<script>alert('Auberge piratee !')</script>` ecrit dans le livre, comme du texte
ordinaire. Plus aucune alerte, plus aucun defacement.

Re-tente une injection neuve, par acquit de conscience :

```html
<script>alert('encore moi')</script>
```

Cette fois, le navigateur l'affiche comme du texte inerte. La donnee n'a pas
change ; c'est la facon de l'inserer dans son contexte qui a change. La frontiere
entre donnee et code a ete retablie.

---

## Ce que tu emportes

- Une donnee venue de l'exterieur est hostile tant qu'on ne l'a pas traitee selon
  son contexte de destination (ici : du HTML).
- "Echapper" une donnee, c'est neutraliser les caracteres qui auraient un sens
  special dans ce contexte.
- Une faille stockee est rejouee a chaque visite : son rayon d'action est large.
- La meme logique va revenir a chaque chapitre. Seule la syntaxe de la defense
  changera selon le contexte (SQL, shell, template, prompt).

## Nettoyer avant de passer a la suite

```bash
docker compose down
```

Les messages que tu as injectes vivaient en memoire : ils disparaissent a l'arret.
La salle repart vierge au prochain `up`.
