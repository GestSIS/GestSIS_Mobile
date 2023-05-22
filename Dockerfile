FROM node:18-alpine

WORKDIR /app
RUN npm install -g @ionic/cli

CMD [ "sh" ]
