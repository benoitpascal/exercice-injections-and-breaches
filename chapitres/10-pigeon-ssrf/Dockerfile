FROM node:20-alpine

ENV NODE_ENV=development
WORKDIR /app

# Dependances d'abord (cache de build).
COPY app/package*.json ./
RUN npm install

# Puis le code de l'application.
COPY app/ ./

# L'image node fournit deja l'utilisateur "node" (non privilegie).
# On lui donne la propriete du dossier, puis on bascule dessus :
# le conteneur ne tourne JAMAIS en root.
RUN chown -R node:node /app
USER node

EXPOSE 3000

# nodemon recharge l'app a chaque sauvegarde : pratique pour l'acte 4 (le correctif).
CMD ["npx", "nodemon", "--legacy-watch", "server.js"]
