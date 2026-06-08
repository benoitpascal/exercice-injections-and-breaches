# Solution de reference - Chapitre 16

> A n'ouvrir qu'apres avoir cherche par toi-meme.

## Le correctif

Avant d'ecrire le nom dans le journal, on remplace tout retour a la ligne par un
espace :

```js
const nomPropre = nom.replace(/[\r\n]+/g, ' ').trim();
const ligne = `${heure()} - Arrivee de : ${nomPropre}`;
```

Le serveur complet corrige est dans `solution/server.js`.

## Pourquoi ca marche

Dans un journal, une ligne = un evenement. Le nom contenait des retours a la ligne
(`\n`, et parfois `\r\n`), donc il s'etalait sur plusieurs lignes et fabriquait de
fausses entrees qui ressemblaient a des evenements officiels. En supprimant les
retours a la ligne, le nom reste sur une seule ligne : il ne peut plus se faire
passer pour plusieurs entrees.

## La lecon transverse

Toujours la meme frontiere : une donnee (le nom) ne doit pas pouvoir prendre la
structure du contenant (le journal, ou chaque ligne a un sens). On neutralise le
caractere qui sert de separateur de structure.

## Aller plus loin

- Ce probleme existe aussi dans les en-tetes HTTP (CRLF injection / "response
  splitting"), les e-mails, etc. : partout ou un retour a la ligne separe des
  enregistrements.
- Encore mieux qu'un nettoyage : journaliser en format structure (par exemple une
  ligne JSON par evenement), ou le nom est une valeur de champ et ne peut pas
  casser la structure, meme avec des retours a la ligne.
