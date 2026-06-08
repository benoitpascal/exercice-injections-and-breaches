# Chapitre 3 : Les Coffres

> Salle concernee : la salle des coffres, au sous-sol de l'Auberge.
> Faille : reference directe non securisee a un objet (IDOR), une forme de
> controle d'acces casse.
> Difficulte : troisieme marche.

## Le decor

Chaque client de l'auberge dispose d'un coffre prive, ferme, numerote. Tu es le
client n&deg;3 et tu peux consulter ton coffre. Le tavernier pensait que chacun ne
verrait que le sien. Il s'est trompe.

Cette fois, la faille n'est pas dans l'affichage mais dans le **serveur** : c'est
donc le fichier `app/server.js` que tu corrigeras a l'acte 4, pas un template.

Lance la salle :

```bash
docker compose up --build c03-idor-coffres
```

Puis ouvre http://127.0.0.1:4103 dans ton navigateur.

---

## Acte 1 - Le terrain

Tu es connecte en tant que client n&deg;3. Clique sur "Ouvrir mon coffre". Tu vois
ton or et ta note privee. L'adresse devient `http://127.0.0.1:4103/coffre/3`. Tout
est normal : c'est bien ton coffre.

---

## Acte 2 - Le declic

Dans la barre d'adresse, change juste le numero : remplace `/coffre/3` par
`/coffre/1`, puis valide.

Tu vois maintenant le coffre de **Dame Eloise** : son or, et sa note privee. Tu
n'aurais jamais du. Essaie `/coffre/2`, puis `/coffre/4` : tu lis le contenu prive
de chaque client de l'auberge, simplement en changeant un chiffre.

> J'ai fourni une **reference** (un numero). Le systeme m'a remis l'objet
> sans verifier que j'avais le droit de le voir.

---

## Acte 3 - L'autopsie

Ouvre `app/server.js` et trouve la route marquee `TODO securiser` :

```js
app.get('/coffre/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const coffre = coffres[id];
  // ...affiche le coffre demande, quel qu'il soit.
});
```

Le numero `:id` vient directement de l'URL. Le serveur va chercher le coffre
correspondant et l'affiche, sans jamais se demander : "est-ce que ce coffre
appartient bien a la personne qui le demande ?". C'est ca, un IDOR : une reference
directe a un objet (ici un identifiant de coffre) que l'application sert sans
controler les droits.

La portee reelle : imagine que ce soit ta page de facture, `/facture/1042`. En
changeant le numero, tu lirais les factures des autres clients. Ce type de faille
est partout des qu'un identifiant predictible circule dans une URL.

---

## Acte 4 - Le correctif

Dans `app/server.js`, juste avant d'afficher le coffre, ajoute un controle : si
l'identifiant demande n'est pas le tien, on refuse.

```js
if (id !== MON_ID) {
  return res.status(403).render('refus', { id });
}
```

(La page de refus existe deja dans l'application, elle n'attendait que d'etre
utilisee.) Sauvegarde. nodemon recharge. Si rien ne bouge :

```bash
docker compose restart c03-idor-coffres
```

> Correctif complet dans `solution/server.js`, a n'ouvrir qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Retourne sur `http://127.0.0.1:4103/coffre/1`. Cette fois, la page affiche "Acces
refuse" : le coffre de Dame Eloise ne t'appartient pas. Ton propre coffre,
`/coffre/3`, reste accessible. Le controle distingue bien ce qui est a toi de ce
qui ne l'est pas.

---

## Ce que tu emportes

- Une reference fournie de l'exterieur (un id dans l'URL) ne doit jamais etre
  servie sans verifier que la personne a le droit d'y acceder.
- Le fait qu'un objet existe ne signifie pas que tout le monde peut le voir :
  exister et avoir le droit d'y acceder sont deux questions differentes.
- Les identifiants predictibles (1, 2, 3...) rendent la faille triviale a exploiter,
  mais des identifiants "au hasard" ne suffisent pas a securiser : il faut un
  vrai controle d'acces cote serveur.

## Nettoyer

```bash
docker compose down
```
