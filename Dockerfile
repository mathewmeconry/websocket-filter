FROM node:lts

RUN useradd -d /opt/app -m -r -s /bin/bash app
USER app

COPY ./src /opt/app/src
COPY ./package.json /opt/app/package.json
COPY ./yarn.lock /opt/app/yarn.lock
COPY ./tsconfig.json /opt/app/tsconfig.json
WORKDIR /opt/app
RUN yarn install
RUN yarn build

ENTRYPOINT ["yarn", "start"]