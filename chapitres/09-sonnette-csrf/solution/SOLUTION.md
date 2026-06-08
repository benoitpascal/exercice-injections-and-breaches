# Solution de reference - Chapitre 9

> A n'ouvrir qu'apres avoir cherche par toi-meme.

## Le correctif

Dans la route `/sonner`, on exige un jeton anti-CSRF valide avant d'agir :

```js
if (req.body.jeton !== jetonValide) {
  return res.status(403).render('refus-csrf');
}
```

Le jeton est genere a chaque affichage de la page et glisse dans le vrai
formulaire (champ cache). Le serveur complet corrige est dans `solution/server.js`.

## Pourquoi ca marche

Une attaque CSRF fonctionne parce que le navigateur envoie automatiquement ton
cookie de session, meme quand la requete est declenchee par une autre page. Le
cookie ne prouve donc pas ton intention. Le jeton anti-CSRF, lui, n'est present
que dans la vraie page de l'auberge : une page exterieure ne peut pas le deviner.
En l'exigeant, on verifie que la demande vient bien de notre propre formulaire.

## La lecon transverse

Ici, la donnee de confiance abusee n'est pas un champ texte mais le cookie de
session, envoye tout seul. La defense consiste a exiger une preuve d'intention que
seul ton vrai formulaire possede (le jeton), pour toute action qui change un etat.

## Aller plus loin

- Les frameworks modernes fournissent une protection CSRF prete a l'emploi :
  l'activer plutot que la reecrire.
- Cookies en `SameSite=Lax` ou `Strict` : ils limitent l'envoi automatique du
  cookie depuis un autre site, une defense complementaire utile.
- Ne jamais faire d'action qui change un etat via une simple requete GET.
