#!/usr/bin/env bash
# Met a jour le repo depuis une archive (delta ou complete), puis pousse.
#
# Usage, depuis la racine de ton repo (le dossier qui contient docker-compose.yml) :
#   ./maj.sh ~/Downloads/maj-ch07-ch08.tar.gz "Chapitres 7 et 8"
#
# Le 2e argument (message de commit) est optionnel.

set -euo pipefail

ARCHIVE="${1:?Indique le chemin de l'archive en premier argument}"
MESSAGE="${2:-Mise a jour de l'exercice}"

if [ ! -d .git ]; then
  echo "Erreur : lance ce script depuis la racine de ton repo (le dossier qui contient .git)." >&2
  exit 1
fi

if [ ! -f "$ARCHIVE" ]; then
  echo "Erreur : archive introuvable : $ARCHIVE" >&2
  exit 1
fi

echo "Extraction de l'archive par-dessus le repo..."
tar -xzf "$ARCHIVE"

echo "Commit et push..."
git add -A
if git diff --cached --quiet; then
  echo "Rien de nouveau a committer. Le repo est deja a jour."
  exit 0
fi
git commit -m "$MESSAGE"
git push

echo "Termine. Repo mis a jour et pousse."
