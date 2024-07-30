#!/bin/bash


{ cd /app/collector/ &&
    pm2 --name llmcollector start "yarn dev"
} &
{ cd /app/frontend/ &&
    pm2 --name frontend start "yarn dev"
} &
{
  cd /app/server/ &&
    pm2 --name llmserver start "yarn dev"
} &
wait -n
exit $?
