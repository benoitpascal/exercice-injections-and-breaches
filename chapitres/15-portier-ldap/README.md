# Chapitre 15 : le Portier

> Salle concernee : la porte d'entree, gardee par le portier.
> Faille : injection LDAP (LDAP injection), menant a un contournement de connexion.
> Difficulte : quinzieme marche.

## Le decor

Le portier verifie ton identifiant et ton mot de passe en interrogeant l'annuaire de
l'auberge. Pour cela, il construit une "question" (un filtre LDAP) en collant
directement ce que tu tapes. Le souci : certains caracteres ont un sens special dans
ce langage, et tu vas t'en servir pour changer la question.

> Note : pour rester sans serveur LDAP a installer, l'annuaire est ici un petit
> moteur en JS pur qui evalue un filtre LDAP (operateurs `&`, `|`, `=`, et le
> caractere special `*`). La faille est exactement celle d'un vrai annuaire dont on
> construit le filtre par collage de chaines.

La faille est dans le **serveur** (`app/server.js`).

Lance la salle :

```bash
docker compose up --build c15-ldap-portier
```

Puis ouvre http://127.0.0.1:4115 dans ton navigateur.

---

## Acte 1 - Le terrain

Connecte-toi normalement, avec un compte de service de l'auberge :

- Identifiant : `gardien`
- Mot de passe : `pixel123`

Le portier s'ecarte : te voila connecte en tant que Gardien. Regarde le filtre
affiche : `(&(uid=gardien)(motDePasse=pixel123))`. Il demande une entree dont l'uid
vaut `gardien` ET le mot de passe vaut `pixel123`. Logique.

Essaie un mauvais mot de passe : le portier refuse.

---

## Acte 2 - Le declic

Maintenant, vise le compte du patron. Entre :

- Identifiant : `gru-admin`
- Mot de passe : `*`

Le portier s'ecarte : **te voila connecte en tant que Tavernier**, et il te livre
la note confidentielle du compte (le code du coffre maitre), sans que tu connaisses
le vrai mot de passe. Regarde le filtre : `(&(uid=gru-admin)(motDePasse=*))`.

> J'ai fourni un **mot de passe** (une donnee). Le caractere `*` y a un sens special
> ("n'importe quelle valeur"), donc ma donnee a change la question du portier en :
> "uid gru-admin ET un mot de passe, peu importe lequel".

---

## Acte 3 - L'autopsie

Ouvre `app/server.js` et trouve la ligne marquee `TODO securiser` :

```js
const filtre = `(&(uid=${uid})(motDePasse=${motDePasse}))`;
```

Le filtre est fabrique en collant tes saisies. Or `*` veut dire "presence / n'importe
quelle valeur" en LDAP. En l'envoyant comme mot de passe, tu transformes la
condition `motDePasse=...` en "le mot de passe existe", ce qui est vrai pour tout le
monde. D'autres caracteres (`(`, `)`, `\`) permettent des manipulations encore plus
poussees du filtre.

---

## Acte 4 - Le correctif

On echappe les metacaracteres LDAP de chaque saisie avant de l'inserer dans le
filtre. Dans `app/server.js`, ajoute une fonction d'echappement et utilise-la :

```js
function echapperLdap(valeur) {
  return String(valeur)
    .replace(/\\/g, '\\5c').replace(/\*/g, '\\2a')
    .replace(/\(/g, '\\28').replace(/\)/g, '\\29').replace(/\u0000/g, '\\00');
}
const filtre = `(&(uid=${echapperLdap(uid)})(motDePasse=${echapperLdap(motDePasse)}))`;
```

Sauvegarde. nodemon recharge. Si besoin :

```bash
docker compose restart c15-ldap-portier
```

> Correctif complet dans `solution/server.js`, a n'ouvrir qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Reessaie `gru-admin` avec le mot de passe `*`. Le portier ne bouge plus : le filtre
montre maintenant `motDePasse=\2a`, c'est-a-dire le caractere `*` traite comme une
lettre ordinaire. Le portier cherche un mot de passe litteralement egal a `*`, que
personne n'a. La connexion normale `gardien` / `pixel123`, elle, fonctionne toujours.

---

## Ce que tu emportes

- Construire une requete (LDAP, SQL, etc.) en collant l'entree utilisateur, c'est
  laisser ses caracteres speciaux reecrire ta requete.
- En LDAP, `*` `(` `)` `\` sont speciaux : il faut les echapper, ou passer par les
  fonctions de la librairie prevues pour ca.
- Et toujours : verifie les droits cote serveur apres connexion, ne te fie pas a un
  champ venu du client pour decider d'un role.

## Nettoyer

```bash
docker compose down
```
