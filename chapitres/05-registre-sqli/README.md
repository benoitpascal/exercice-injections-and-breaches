# Chapitre 5 : le Registre des Clients

> Salle concernee : le bureau du registre, ou l'on tient la liste des clients.
> Faille : injection SQL (SQLi), ici un contournement d'authentification.
> Difficulte : cinquieme marche.

## Le decor

Pour consulter le registre, il faut s'identifier. Le bureau verifie le nom et le
mot de passe en interrogeant sa base de donnees. Mais la requete est mal construite,
et tu vas pouvoir entrer sans connaitre le moindre mot de passe.

Cette salle utilise une vraie base SQLite, embarquee dans le conteneur (rien a
installer). La faille est dans le **serveur** (`app/server.js`). Petit bonus
pedagogique : la page t'affiche la requete exacte envoyee a la base, pour que tu
voies ce qui se passe.

Lance la salle :

```bash
docker compose up --build c05-sqli-registre
```

Puis ouvre http://127.0.0.1:4105 dans ton navigateur.

---

## Acte 1 - Le terrain

Connecte-toi normalement avec un compte de gardien : nom `gardien`, mot de passe
`pixel123`. Tu accedes au registre courant. Regarde aussi la requete affichee en
bas : tu vois ton nom et ton mot de passe glisses dedans. Deconnecte-toi.

---

## Acte 2 - Le declic

Reviens a l'ecran de connexion. Dans le champ **nom d'utilisateur**, colle
**exactement** ceci (mets n'importe quoi dans le mot de passe) :

```text
gru-admin' --
```

Valide. Te voila connecte en tant que **tavernier** (`gru-admin`), avec l'acces
complet : registre secret, comptes de la maison, emplacement de la cle du grand
coffre. Tu n'as jamais connu son mot de passe.

> J'ai fourni un **nom**. En y glissant un peu de syntaxe SQL, j'ai modifie la
> logique de la requete et je me suis fait passer pour le tavernier.

---

## Acte 3 - L'autopsie

Regarde la requete affichee en bas de la page :

```sql
SELECT nom, role, note FROM utilisateurs WHERE nom = 'gru-admin' --' AND mdp = '...'
```

Les deux tirets `--` demarrent un commentaire en SQL : tout ce qui suit est ignore.
Donc la verification du mot de passe (`AND mdp = '...'`) disparait, et il ne reste
que `WHERE nom = 'gru-admin'`. La base te renvoie le tavernier.

Ouvre `app/server.js` et trouve la ligne marquee `TODO securiser` :

```js
const requete = `SELECT ... WHERE nom = '${nom}' AND mdp = '${mdp}'`;
```

Ton texte est colle directement dans la commande SQL. Tes caracteres (l'apostrophe,
les `--`) ne sont plus de simples donnees : ils deviennent de la grammaire SQL.

Variante a essayer : `' OR 1=1 --` dans le champ nom te connecte au premier compte
venu.

---

## Acte 4 - Le correctif

On va separer la commande et les donnees, grace a une **requete parametree**. La
requete contient des marqueurs `?`, et les valeurs sont fournies a part.

Dans `app/server.js`, remplace la construction de la requete et son execution par :

```js
const requete = 'SELECT nom, role, note FROM utilisateurs WHERE nom = ? AND mdp = ?';
const stmt = db.prepare(requete);
stmt.bind([nom, mdp]);
let utilisateur = null;
if (stmt.step()) {
  utilisateur = stmt.getAsObject();
} else {
  erreur = 'Identifiants invalides.';
}
stmt.free();
```

(Retire l'ancien `db.exec(requete)`.) Sauvegarde. nodemon recharge. Si rien ne bouge :

```bash
docker compose restart c05-sqli-registre
```

> Correctif complet dans `solution/server.js`, a n'ouvrir qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Retente `gru-admin' --` dans le champ nom. Cette fois : "Identifiants invalides".
Avec la requete parametree, ton texte est traite comme une simple valeur de nom :
la base cherche un utilisateur qui s'appelle litteralement `gru-admin' --`, et n'en
trouve aucun. Le vrai compte `gardien` / `pixel123`, lui, fonctionne toujours.

---

## Ce que tu emportes

- Coller une donnee dans une requete SQL, c'est lui donner le pouvoir de changer la
  commande. C'est la meme logique que le XSS, mais le contexte est SQL au lieu de HTML.
- La parade n'est pas d'echapper les apostrophes a la main (fragile) : c'est la
  requete parametree, qui separe une fois pour toutes la commande des donnees.
- Cette separation commande/donnees est le bon reflexe pour toute base.

## Nettoyer

```bash
docker compose down
```
