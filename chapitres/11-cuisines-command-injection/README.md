# Chapitre 11 : les Cuisines

> Salle concernee : les cuisines de l'Auberge et leur garde-manger.
> Faille : injection de commande systeme (command injection).
> Difficulte : onzieme marche. Salle a risque : conteneur durci.

## Le decor

Les cuisines disposent d'un petit outil : le marmiton compte pour toi un ingredient
en stock. Sous le capot, il lance une commande systeme avec ce que tu tapes. Et il
le fait tres mal : tu vas pouvoir lui faire executer n'importe quoi.

C'est la salle la plus sensible jusqu'ici : une injection de commande, c'est de
l'execution de code sur le serveur. Elle tourne donc dans un conteneur **durci**
(utilisateur non privilegie, systeme de fichiers en lecture seule, capacites
retirees, memoire et processus limites). Meme une attaque reussie reste prisonniere
de cette boite jetable : au pire, `docker compose down && docker compose up --build`
repart a neuf. La faille est dans le **serveur** (`app/server.js`).

Lance la salle :

```bash
docker compose up --build c11-command-injection
```

Puis ouvre http://127.0.0.1:4111 dans ton navigateur.

---

## Acte 1 - Le terrain

Tape `farine` et compte. Le marmiton repond 3. Regarde la commande affichee : il a
lance quelque chose comme `cat /app/garde-manger.txt | grep -c -i farine`. Essaie
`oeufs` : il repond 2. Tout est normal.

---

## Acte 2 - Le declic

Maintenant, au lieu d'un ingredient, tape ceci :

```text
x; cat /app/secret-cuisine.txt
```

Compte. En plus du resultat du grep (0, car il n'y a pas d'ingredient "x"), le
marmiton t'affiche la **recette secrete de la maison** et la combinaison du
garde-manger blinde. Tu viens de lui faire executer une seconde commande, qui n'a
rien a voir avec compter un ingredient.

> J'ai fourni un **ingredient**. Avec un `;`, j'ai enchaine ma propre commande, et
> le serveur l'a executee.

---

## Acte 3 - L'autopsie

Ouvre `app/server.js` et trouve la ligne marquee `TODO securiser` :

```js
const commande = `cat /app/garde-manger.txt | grep -c -i ${ingredient}`;
exec(commande, ...);
```

Ton texte est colle dans une chaine que le **shell** execute. Or le shell donne un
sens special a certains caracteres : `;` separe deux commandes, `&&` enchaine, `|`
redirige. En tapant `x; cat ...`, tu fermes la premiere commande et tu en ajoutes
une deuxieme, executee avec les droits du serveur.

Pousser plus loin (sans danger, on est dans le conteneur durci jetable) : essaie
`x; ls /` pour lister la racine, ou `x; cat /etc/passwd`. Tu executes ce que tu
veux. Et c'est precisement pour ce pouvoir que cette salle est verrouillee : pas
de root, systeme en lecture seule, et rien de l'hote n'est monte. L'execution reste
enfermee dans la boite.

---

## Acte 4 - Le correctif

On supprime le shell. Au lieu de construire une chaine, on lance directement le
programme avec ses arguments passes a part, via `execFile`. Dans `app/server.js`,
remplace l'import et la commande par :

```js
const { execFile } = require('child_process');

// dans la route /compter :
execFile('grep', ['-c', '-i', ingredient, '/app/garde-manger.txt'], (err, stdout, stderr) => {
  let sortie = (stdout || '') + (stderr || '');
  if (!sortie) sortie = '0\n';
  res.render('cuisines', { ingredient, commande: null, sortie });
});
```

(Retire l'ancien `exec(...)` et l'import `{ exec }`.) Comme c'est un conteneur sans
rechargement automatique, applique le correctif en relancant la salle :

```bash
docker compose restart c11-command-injection
```

> Correctif complet dans `solution/server.js`, a n'ouvrir qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Retape `x; cat /app/secret-cuisine.txt`. Cette fois, le marmiton repond simplement
0 : il a cherche un ingredient nomme litteralement "x; cat /app/secret-cuisine.txt"
et ne l'a pas trouve. Le `;` n'a plus aucun pouvoir, parce qu'il n'y a plus de shell
pour l'interpreter. Compter `farine` fonctionne toujours.

---

## Ce que tu emportes

- Coller une entree dans une commande shell, c'est lui donner le pouvoir d'executer
  d'autres commandes. C'est la plus grave des injections : du code qui tourne sur
  ton serveur.
- La parade n'est pas de filtrer les caracteres a la main, mais de supprimer le
  shell : appeler le programme directement avec des arguments separes (execFile).
- En profondeur : donner au processus le minimum de droits (pas de root) et
  l'enfermer, exactement ce que fait le conteneur durci de cette salle.

## Nettoyer

```bash
docker compose down
```
