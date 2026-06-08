# Chapitre 16 : le Journal de Bord

> Salle concernee : le pupitre d'entree, ou l'on tient le journal de bord.
> Faille : injection dans les logs (log injection / CRLF), menant a des entrees forgees.
> Difficulte : seizieme marche.

## Le decor

A l'auberge, chaque arrivee est inscrite au journal de bord : une ligne par
evenement. Quand tu t'annonces, le portier ajoute une ligne
`heure - Arrivee de : ton nom`. Mais il recopie ton nom tel quel, retours a la
ligne compris. Tu vas t'en servir pour ecrire de fausses lignes "officielles".

La faille est dans le **serveur** (`app/server.js`).

Lance la salle :

```bash
docker compose up --build c16-log-journal
```

Puis ouvre http://127.0.0.1:4116 dans ton navigateur.

---

## Acte 1 - Le terrain

Annonce-toi avec un nom normal, par exemple `Roland`. Une nouvelle ligne apparait
proprement dans le journal : `... - Arrivee de : Roland`. Tout est en ordre, une
ligne par arrivee.

---

## Acte 2 - Le declic

Maintenant, dans le champ (c'est une zone de texte, tu peux donc aller a la ligne),
saisis ceci, retour a la ligne compris :

```text
Roland
2099-01-01 03:00 - Cle du grand coffre remise a Roland par le tavernier
```

Annonce-toi. Le journal contient maintenant **deux** lignes pour ton arrivee, dont
une fausse entree qui ressemble a un evenement officiel : on y lit que la cle du
grand coffre t'a ete remise par le tavernier. Tu viens de forger une preuve dans le
journal.

> J'ai fourni un **nom** (une donnee). En y glissant un retour a la ligne, j'ai cree
> une nouvelle ligne de journal, donc un faux evenement.

---

## Acte 3 - L'autopsie

Ouvre `app/server.js` et trouve la ligne marquee `TODO securiser` :

```js
const ligne = `${heure()} - Arrivee de : ${nom}`;
journal.push(ligne);
```

Le journal donne un sens a chaque ligne. En laissant passer un retour a la ligne
dans le nom, on laisse l'utilisateur creer autant de lignes qu'il veut, avec le
contenu qu'il veut. C'est tres utile pour un attaquant : effacer ses traces, accuser
quelqu'un d'autre, ou fabriquer un faux ordre.

---

## Acte 4 - Le correctif

On supprime les retours a la ligne du nom avant de l'inscrire. Une arrivee tiendra
toujours sur une seule ligne. Dans `app/server.js` :

```js
const nomPropre = nom.replace(/[\r\n]+/g, ' ').trim();
const ligne = `${heure()} - Arrivee de : ${nomPropre}`;
```

Sauvegarde. nodemon recharge. Si besoin :

```bash
docker compose restart c16-log-journal
```

> Correctif complet dans `solution/server.js`, a n'ouvrir qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Recolle le nom sur deux lignes et annonce-toi. Cette fois, tout se retrouve sur une
seule ligne de journal : ta fausse entree n'est plus qu'un bout de texte a la suite
de ton nom, et ne peut plus se faire passer pour un evenement separe.

---

## Ce que tu emportes

- Dans un journal (ou tout format ou le retour a la ligne separe des
  enregistrements), un retour a la ligne dans une donnee permet de forger de fausses
  entrees.
- La parade immediate : neutraliser les retours a la ligne (`\r` et `\n`) des
  donnees avant de les ecrire.
- La parade solide : journaliser en format structure (une ligne JSON par evenement),
  ou une donnee reste une valeur et ne peut pas casser la structure.
- Le meme mecanisme existe dans les en-tetes HTTP et les e-mails (CRLF injection).

## Nettoyer

```bash
docker compose down
```
