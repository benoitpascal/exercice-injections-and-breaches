# Chapitre 14 : le Parchemin Scelle

> Salle concernee : le bureau du messager, qui lit les parchemins scelles.
> Faille : entite externe XML (XXE), menant a la lecture de fichiers.
> Difficulte : quatorzieme marche.

## Le decor

Le messager lit pour toi les parchemins ecrits au format XML. Tu lui en deposes un,
il t'en lit le message. Mais sa facon de lire est trop permissive : si le parchemin
declare une "entite externe" pointant vers un fichier, le messager va lire ce
fichier et te le recracher. Tu vas lui faire lire des secrets.

> Note : pour rester sans dependance lourde, cette salle lit le parchemin avec un
> petit analyseur maison qui se comporte comme un parseur XML laisse en
> configuration permissive (entites externes activees). C'est exactement ce qui
> rend un vrai parseur vulnerable. La faille et la defense sont identiques.

La faille est dans le **serveur** (`app/server.js`).

Lance la salle :

```bash
docker compose up --build c14-xxe-parchemin
```

Puis ouvre http://127.0.0.1:4114 dans ton navigateur.

---

## Acte 1 - Le terrain

Le champ contient deja un parchemin simple :

```xml
<?xml version="1.0"?>
<message>Bonjour, voici un parchemin tout simple.</message>
```

Lis le parchemin : le messager t'affiche le message. Normal.

---

## Acte 2 - Le declic

Efface tout et colle ce parchemin piege :

```xml
<?xml version="1.0"?>
<!DOCTYPE message [ <!ENTITY xxe SYSTEM "file:///app/parchemin-secret.txt"> ]>
<message>&xxe;</message>
```

Lis-le. Au lieu d'un message normal, le messager te lit le **sceau secret du maitre
des lieux** : le mot de passe du registre royal et l'emplacement de l'heritier cache.
Tu n'as ecrit aucun de ces mots : tu as juste declare une entite qui pointe vers un
fichier, et le messager est alle le lire.

> J'ai fourni un **parchemin** (des donnees XML). En y declarant une entite externe,
> j'ai fait lire au serveur un fichier qui ne me regardait pas.

---

## Acte 3 - L'autopsie

Ouvre `app/server.js` et regarde la lecture, marquee `TODO securiser` : elle est
faite avec `entitesExternes: true`. Dans la fonction `lireParchemin`, ce reglage
declenche ceci :

```js
entites[nom] = fs.readFileSync(chemin, 'utf8');
```

Quand le parchemin declare `<!ENTITY xxe SYSTEM "file:///app/...">`, l'analyseur
lit le fichier pointe et remplace `&xxe;` par son contenu. C'est le coeur de XXE :
un document de donnees (XML) a le droit de declarer des entites qui vont chercher
des ressources externes, et un parseur permissif les resout.

---

## Acte 4 - Le correctif

On desactive le traitement des entites externes. Le plus simple et le plus sur :
refuser tout parchemin qui contient une definition de type (DOCTYPE) ou une entite.
Dans `app/server.js`, remplace la fonction `lireParchemin` par une version qui
rejette ces parchemins (et ne resout plus aucune entite) :

```js
function lireParchemin(xml) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) {
    return { contenu: null, erreur: 'Parchemin refuse : DOCTYPE et entites externes interdits.' };
  }
  const corps = (xml.match(/<message>([\s\S]*?)<\/message>/) || ['', ''])[1];
  return { contenu: corps, erreur: null };
}
```

Et dans la route `/lire`, appelle `lireParchemin(parchemin)` sans option. Sauvegarde.
nodemon recharge. Si rien ne bouge :

```bash
docker compose restart c14-xxe-parchemin
```

> Correctif complet dans `solution/server.js`, a n'ouvrir qu'apres avoir essaye.

---

## Acte 5 - L'epreuve

Recolle le parchemin piege et lis-le. Cette fois : "Parchemin refuse". La presence
d'un DOCTYPE suffit a le rejeter, donc l'entite externe n'est jamais resolue. Le
parchemin simple du debut, lui, se lit toujours sans probleme.

---

## Ce que tu emportes

- Le XML permet de declarer des entites qui peuvent pointer vers des fichiers. Un
  parseur permissif les resout, ce qui laisse lire des fichiers du serveur (XXE).
- La parade : desactiver le traitement des DTD et des entites externes (dans un
  vrai projet, c'est une option de configuration du parseur).
- Encore la meme regle : une donnee (le parchemin) ne doit pas pouvoir declencher
  un acces que l'utilisateur n'a pas le droit de faire.

## Nettoyer

```bash
docker compose down
```
