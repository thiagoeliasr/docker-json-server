# specify the node base image with your desired version node:<version>
FROM node:6

WORKDIR /home/node/app
ADD app ./
ADD start.sh ./
CMD chmod 777 start.sh
ENTRYPOINT ["/home/node/app/start.sh"]
EXPOSE 3000
