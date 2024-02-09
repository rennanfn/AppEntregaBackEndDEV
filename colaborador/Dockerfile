#Docker file para build Node + React. 
#Utilizando imagem node:bullseye-slim para teste, mais leve #

FROM node:18.14.2-alpine as dependencies

WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm i


FROM node:18.14.2-alpine as builder

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build

FROM node:18.14.2-buster-slim as runner

## Instala biblioteca Oracle no Linux / Container
WORKDIR /opt/oracle

RUN apt-get update && \
    apt-get install -y libaio1 unzip wget musl-dev
RUN wget https://download.oracle.com/otn_software/linux/instantclient/instantclient-basiclite-linuxx64.zip && \
    unzip instantclient-basiclite-linuxx64.zip && \
    rm -f instantclient-basiclite-linuxx64.zip && \
    cd instantclient* && \
    rm -f *jdbc* *occi* *mysql* *jar uidrvci genezi adrci && \
    echo /opt/oracle/instantclient* > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig && \
    ln -s /usr/lib/x86_64-linux-musl/libc.so /lib/libc.musl-x86_64.so.1

RUN apt-get install -y cron && apt install tzdata -y 

ENV TZ="America/Sao_Paulo"
WORKDIR /app

## If you are using a custom next.config.js file, uncomment this line.
# COPY --from=builder /my-project/next.config.js ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/dist ./dist
COPY src ./src


COPY .env-dev .env


RUN service cron start

#ADD crontab /etc/cron.d/hello-cron

#RUN chmod +x /etc/cron.d/hello-cron

#RUN touch /var/log/cron.log


#COPY main.js main.js
# RUN mkdir public
#RUN ln -s /app/src/storage public ##

EXPOSE 3335
CMD ["npm", "start"]

