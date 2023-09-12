#!/bin/bash
set -e;

echo "Initiating MongoDB replica set...";
mongo --eval 'rs.initiate({_id: "rs0", members: [{_id: 0, host: "localhost:27017"}]})'
