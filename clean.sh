#!/bin/bash
set -eu

# Stop containers
docker-compose down

# Kill & Remove shim containers
docker rm -f $(docker ps -f "name=-peer-bcins-v2" -aq)

# Removing shim container images
docker rmi -f $(docker images -f "reference=*peer-bcins-v2*" -q)