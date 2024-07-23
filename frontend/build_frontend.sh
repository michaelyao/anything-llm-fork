yarn install --network-timeout 100000 && yarn cache clean &&
yarn build && \
    cp -r /app/frontend/dist /app/server/public