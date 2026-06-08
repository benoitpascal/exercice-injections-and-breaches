# L'Auberge du Pixel : les Failles

> Un parcours pratique pour comprendre les failles de securite web, de l'interieur.
> Tu attaques, tu comprends, tu repares, tu re-testes. Une faille, une salle, une histoire.

L'Auberge du Pixel s'est fait pirater. Tu arrives comme apprenti gardien des lieux,
et ta mission est simple : visiter chaque salle, trouver la breche, comprendre comment
elle fonctionne, puis la colmater de tes mains.

Chaque faille est un chapitre autonome, joue en cinq actes :

1. **Le terrain** : tu utilises la salle normalement. Tout a l'air sain.
2. **Le declic** : une seule manip (un texte a coller, une URL a modifier) provoque
   quelque chose de visiblement anormal. Sans toucher au code.
3. **L'autopsie** : on ouvre le code coupable, on comprend pourquoi l'attaque marche,
   on la pousse un cran plus loin.
4. **Le correctif** : tu modifies toi-meme la zone fautive, guide pas a pas.
5. **L'epreuve** : tu rejoues l'attaque. Elle echoue, et tu vois pourquoi a l'ecran.

Le fil rouge, repete a chaque salle :

> J'etais cense fournir une **donnee**. J'ai fourni une **instruction**.
> Et le systeme l'a obeie. Securiser, c'est retablir la frontiere entre les deux.

---

## Securite : a lire avant de commencer

Ce depot contient des applications **volontairement vulnerables**. C'est normal et voulu.

- Lance-le sur **ta machine perso ou une VM jetable**, jamais sur une infra de production
  ni un serveur partage.
- Chaque salle tourne dans un conteneur Docker isole : utilisateur non privilegie,
  capacites systeme retirees, memoire/CPU/processus limites, port accessible
  uniquement depuis `127.0.0.1`. Une attaque reussie reste **prisonniere du conteneur**.
- En cas de doute ou de comportement etrange : `docker compose down && docker compose up --build`
  repart a neuf. Le pire scenario, c'est de relancer un conteneur.
- Honnetete : Docker n'est pas un coffre-fort inviolable face a un attaquant expert.
  Mais ici, l'attaquant joue un code pedagogique connu. Le risque reel, c'est le degat
  accidentel, et l'isolation conteneur s'en charge tres bien.

---

## Prerequis

- Docker et Docker Compose installes.
- Un navigateur.
- Rien d'autre : tout le code et les dependances sont dans les conteneurs.

## Lancer une salle

Chaque chapitre se lance par son service. Exemple pour le chapitre 1 :

```bash
docker compose up --build c01-xss-livre-dor
```

Puis ouvre l'adresse indiquee dans le README du chapitre (ici http://127.0.0.1:4101).

Pour arreter et nettoyer :

```bash
docker compose down
```

---

## La carte de l'Auberge

| Salle | Faille | Statut |
|-------|--------|--------|
| 01 - Le Livre d'Or | XSS stocke | **Disponible** |
| 02 - Le Tableau d'Affichage | XSS reflechi | **Disponible** |
| 03 - Les Coffres | IDOR / controle d acces | **Disponible** |
| 04 - La Reserve | Path traversal | **Disponible** |
| 05 - Le Registre des Clients | Injection SQL | **Disponible** |
| 06 - Le Grand Livre | Injection NoSQL | **Disponible** |
| 07 - Le Vestiaire | Mass assignment | A venir |
| 08 - Le Panneau Indicateur | Open redirect | A venir |
| 09 - La Sonnette | CSRF | A venir |
| 10 - Le Pigeon Voyageur | SSRF | A venir |
| 11 - Les Cuisines | Command injection | A venir |
| 12 - Le Menu du Jour | SSTI (injection de template) | A venir |
| 13 - L'Atelier | Code injection / deserialisation | A venir |
| 14 - Le Parchemin Scelle | XXE | A venir |
| 15 - Le Portier | Injection LDAP | A venir |
| 16 - Le Journal de Bord | CRLF / log injection | A venir |
| 17 - Le Perroquet Bavard | Prompt injection (directe puis indirecte) | A venir |

> Quelques salles "signature" seront aussi proposees dans d'autres stacks
> (Flask, Next) pour montrer que la faille est universelle : seule la syntaxe
> de la defense change.

## Structure du depot

```
auberge-du-pixel/
  docker-compose.yml         orchestration de toutes les salles
  README.md                  ce fichier
  commun/
    theme.css                le theme pixel partage par toutes les salles
  chapitres/
    01-livre-dor-xss-stocke/
      README.md              le chapitre en 5 actes
      Dockerfile
      app/                   le code vulnerable (que tu edites a l'acte 4)
      solution/              le correctif de reference (a n'ouvrir qu'apres)
    02-tableau-affichage-xss-reflechi/
      ...                    meme structure
```

> Le theme vit dans `commun/theme.css` et est recopie dans le dossier
> `app/public/` de chaque salle, pour que chaque conteneur reste autonome.

