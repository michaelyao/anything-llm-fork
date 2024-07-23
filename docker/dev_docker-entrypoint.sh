#!/bin/bash
# {
#   cd /app/server/ &&
#     npx prisma generate --schema=./prisma/schema.prisma &&
#     npx prisma migrate deploy --schema=./prisma/schema.prisma &&
#     # node /app/server/index.js
# } &
# { node /app/collector/index.js; } &
# wait -n
# exit $?
echo "this is dev_docker-entrypoint.sh"