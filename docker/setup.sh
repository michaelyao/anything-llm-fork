#!/bin/bash
{
  cd /app/server/ &&
    yarn install --network-timeout 100000 && yarn cache clean
} &
{ cd /app/collector/ &&
    yarn install  --network-timeout 100000 && yarn cache clean
} &
{
    cd /app/frontend/ && 
    yarn install --network-timeout 100000 && yarn cache clean &&
    yarn build && \
    cp -r /app/frontend/dist /app/server/public
}
wait 
exit $?
