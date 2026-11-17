FROM node:26

WORKDIR /app
RUN npm install -g @ionic/cli pnpm@12

CMD [ "sh" ]
