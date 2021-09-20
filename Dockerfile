FROM node:lts

RUN useradd -d /opt/app -m -r -s /bin/bash app
USER app

COPY . /opt/app
RUN yarn install
RUN yarn build

ENTRYPOINT ["yarn", "start"]