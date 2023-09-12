FROM mongo:4.4

COPY ./init-replica.sh /docker-entrypoint-initdb.d/

CMD ["--replSet", "rs0"]
