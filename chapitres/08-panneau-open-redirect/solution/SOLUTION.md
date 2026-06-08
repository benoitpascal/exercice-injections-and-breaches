# Solution de reference - Chapitre 8

> A n'ouvrir qu'apres avoir cherche par toi-meme.

## Le correctif

On verifie que la destination reste interne avant de rediriger :

```js
function destinationInterne(vers) {
  return typeof vers === 'string' && vers.startsWith('/') && !vers.startsWith('//');
}

if (!destinationInterne(vers)) {
  return res.redirect('/');
}
res.redirect(vers);
```

Le serveur complet corrige est dans `solution/server.js`.

## Pourquoi ca marche

`res.redirect(vers)` suivait n'importe quelle destination, y compris une URL
absolue externe. En n'acceptant qu'un chemin qui commence par un seul `/`, on
exclut les `https://...` et les `//site-externe` : la redirection ne peut plus
sortir de l'auberge.

## La lecon transverse

Une donnee externe (la destination) dictait un comportement sensible (vers ou
envoyer l'utilisateur). La defense : ne jamais rediriger vers une cible fournie
telle quelle. Restreindre aux destinations internes, ou mieux encore, ne jamais
mettre l'URL dans le parametre mais un identifiant correspondant a une cible connue.

## Pourquoi c'est dangereux

L'open redirect sert surtout au hameconnage : un lien sur un domaine de confiance
(celui de l'auberge) qui rebondit vers un faux site. La victime voit le bon domaine
dans le lien, clique, et atterrit ailleurs.

## Aller plus loin

- Encore plus sur : une liste blanche de destinations (un identifiant -> une cible
  connue cote serveur), plutot que de laisser passer un chemin libre.
- Se mefier des variantes : `/\evil.com`, `https:/evil.com`, encodages. Valider
  apres normalisation.
