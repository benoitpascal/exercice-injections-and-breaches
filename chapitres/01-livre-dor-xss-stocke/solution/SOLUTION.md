# Solution de reference - Chapitre 1

> A n'ouvrir qu'apres avoir cherche par toi-meme.

## Le correctif

Dans `app/views/livre-dor.ejs`, une seule ligne change. On remplace la balise
d'affichage **non echappee** par la balise **echappee** :

```diff
- <div class="contenu"><%- entree.message %></div>
+ <div class="contenu"><%= entree.message %></div>
```

Un seul caractere de difference (`-` devient `=`), et toute la faille disparait.

## Pourquoi ca marche

En EJS :

- `<%- valeur %>` insere la valeur **brute** dans le HTML. Si la valeur contient
  `<script>...</script>`, le navigateur l'interprete comme du vrai code.
- `<%= valeur %>` **echappe** la valeur avant de l'inserer : `<` devient `&lt;`,
  `>` devient `&gt;`, etc. Le navigateur affiche alors les caracteres tels quels,
  comme du texte, sans jamais les executer.

C'est exactement pour cette raison que le champ `auteur` n'etait pas vulnerable
des le depart : il utilisait deja `<%= %>`.

## La lecon transverse

La donnee du visiteur n'a pas change : c'est toujours la meme chaine de caracteres.
Ce qui a change, c'est la maniere dont on l'insere dans son contexte de destination
(ici, du HTML). **Echapper une donnee selon le contexte ou elle atterrit**, voila
le reflexe. Le meme principe reviendra a chaque chapitre, avec une syntaxe
differente selon le contexte (SQL, shell, template, prompt).

## Aller plus loin (defense en profondeur)

L'echappement a l'affichage est la bonne reponse pour le XSS. En complement, dans
une vraie application on ajoute souvent :

- une **Content-Security-Policy** (en-tete HTTP) qui interdit l'execution de scripts
  non autorises, meme si une faille passait au travers ;
- une validation des entrees a la reception (longueur, format attendu).

Mais l'echappement contextuel a l'affichage reste la protection centrale : ne jamais
faire confiance a une donnee venue de l'exterieur au moment de l'inserer dans une page.
