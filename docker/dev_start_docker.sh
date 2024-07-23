# git clone this repo and cd anything-llm to get to the root directory.
# touch server/storage/anythingllm.db to create empty SQLite DB file.
# cd docker/
# cp .env.example .env you must do this before building
# add -d if run in demon mode 
A_UID=$(id -u) \
A_GID=$(id -g) \
docker compose --env-file .env -f ./docker-compose_dev.yml up -d --build 
# docker compose --env-file .env -f ./docker-compose_dev.yml  build --no-cache