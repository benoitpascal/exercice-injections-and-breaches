FROM node:20-alpine

ENV NODE_ENV=development
ENV HOME=/tmp
WORKDIR /app

COPY app/package*.json ./
RUN npm install
COPY app/ ./

RUN chown -R node:node /app
USER node

EXPOSE 3000

# Pas de nodemon ici : ces salles tournent en systeme de fichiers verrouille.
# Apres avoir edite le correctif, relance la salle avec "docker compose restart".
CMD ["node", "server.js"]
