# git clone this repo and cd anything-llm to get to the root directory.
# touch server/storage/anythingllm.db to create empty SQLite DB file.
# cd docker/
# cp .env.example .env you must do this before building

docker compose --env-file .env  up -d --build 
