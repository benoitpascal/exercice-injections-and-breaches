# Chapitre 9 : la Sonnette

> Salle concernee : le comptoir, ou trone la sonnette du service.
> Faille : falsification de requete entre sites (CSRF).
> Difficulte : neuvieme marche.

## Le decor

Sur le comptoir, une sonnette : chaque coup commande une tournee et te coute 25
pieces. C'est une action volontaire, que toi seul devrais declencher. Mais le
comptoir ne verifie pas que la demande vient vraiment de toi, et une page
exterieure va pouvoir sonner a ta place, avec ta bourse.

La faille est dans le **serveur** (`app/server.js`).

> Note : un vrai CSRF vient d'un **autre site**. Pour rester dans un seul
> conteneur, on simule ce site exterieur par une page piegee de l'exercice
> ("l'auberge rivale"). Le mecanisme et la defense sont identiques.

Lance la salle :

```bash
docker compose up --build c09-csrf-sonnette
```

Puis ouvre http://127.0.0.1:4109 dans ton navigateur.

---

## Acte 1 - Le terrain

Regarde ta bourse (100) et le compteur de coups (0). Clique sur "Sonner". Ta bourse
descend a 75, le compteur passe a 1. Normal : tu as sonne volontairement.

---

## Acte 2 - Le declic

Reviens a l'accueil. En bas, un message de l'auberge d'en face : clique sur "Voir
l'offre de l'Auberge Rivale". Tu arrives sur une page qui te felicite et te fait
patienter.

Reviens maintenant a l'Auberge du Pixel (le lien sur la page rivale). Surprise : ta
bourse a encore baisse et le compteur de coups a augmente. Tu n'as pas touche a la
sonnette : c'est la page rivale qui l'a actionnee a ta place.

> Je n'ai fait qu'ouvrir une page exterieure. Elle a declenche une action a
> l'auberge en mon nom, en profitant de ma session deja ouverte.

---

## Acte 3 - L'autopsie

Ouvre la page rivale, puis regarde sa source (clic droit, "code source"). Elle
contient un formulaire cache qui s'envoie tout seul vers `/sonner`, dans une iframe
invisible.

Pourquoi ca marche : quand cette page declenche la requete vers l'auberge, ton
navigateur **joint automatiquement ton cookie de session**. Cote auberge, ouvre
`app/server.js`, route `/sonner`, marquee `TODO securiser` :

```js
if (bourse >= 25) { bourse -= 25; coups += 1; }
```

L'action s'execute des que la session est valide. Or le cookie de session est
envoye tout seul, meme pour une requete venue d'ailleurs. Le cookie prouve que tu
es connecte, mais **pas que tu as voulu cette action**. C'est tout le probleme.

---

## Acte 4 - Le correctif

On exige un jeton anti-CSRF : un secret present uniquement dans le vrai formulaire
de l'auberge, qu'une page exterieure ne peut pas connaitre. Le jeton est deja
genere et glisse dans le formulaire (champ cache) ; il ne reste qu'a le verifier.

Dans `app/server.js`, au debut de la route `/sonner`, ajoute :

```js
if (req.body.jeton !== jetonValide) {
  return res.status(403).render('refus-csrf');
}
```

(La page de refus existe deja.) Sauvegarde. nodemon recharge. Si rien ne bouge :

```bash
docker compose restart c09-csrf-sonnette
```

> Correctif complet dans `solution/server.js`, a n'ouvrir qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Refais le tour par l'auberge rivale. Cette fois, ta bourse ne bouge plus : la
demande forgee par la page rivale n'a pas le bon jeton, elle est refusee. Ton vrai
bouton "Sonner", lui, fonctionne toujours, parce que son formulaire porte le jeton.

---

## Ce que tu emportes

- Un cookie de session prouve que tu es connecte, pas que tu as voulu l'action :
  le navigateur l'envoie automatiquement, meme pour une requete venue d'ailleurs.
- La parade : un jeton anti-CSRF, present seulement dans ton vrai formulaire, exige
  pour toute action qui change un etat.
- Complement utile : des cookies en `SameSite`, et jamais d'action sensible en GET.

## Nettoyer

```bash
docker compose down
```
