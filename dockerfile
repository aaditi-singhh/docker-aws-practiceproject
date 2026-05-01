#build the frontend [dist folder]
#copy the dist folder content in Backend/public folder


FROM node:20-alpine as frontend-builder 
COPY ./Frontend /app

WORKDIR /app

RUN npm install

RUN npm run build

#build the backend

FROM node:20-alpine

COPY ./Backend /app