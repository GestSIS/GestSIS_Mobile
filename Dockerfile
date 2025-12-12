FROM node:24

WORKDIR /app
RUN npm install -g @ionic/cli

CMD [ "sh" ]
