#!/bin/sh

# abort on any non-zero exit code
set -e

cd server

# ensure required environment variables are defined
if [ -z "$CF_ACCOUNT_ID" ] || [ -z "$CF_API_TOKEN" ] || [ -z "$CF_CUSTOM_DOMAIN" ] || [ -z "$CF_SCRIPT_NAME" ]; then
  echo "\$CF_ACCOUNT_ID, \$CF_API_TOKEN, \$CF_CUSTOM_DOMAIN, and \$CF_SCRIPT_NAME are required"
  exit 1
fi

# install deno
DENO_VERSION="v1.40.3"
DENOFLARE_VERSION="v0.6.0"
curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=./deno-$DENO_VERSION sh -s $DENO_VERSION

# denoflare push the worker script to cloudflare
DENO_VERSION=$DENO_VERSION DENOFLARE_VERSION=${DENOFLARE_VERSION} ./deno-$DENO_VERSION/bin/deno run --unstable --allow-all https://raw.githubusercontent.com/skymethod/denoflare/$DENOFLARE_VERSION/cli/cli.ts \
push ./index.ts --account-id $CF_ACCOUNT_ID --api-token $CF_API_TOKEN --custom-domain $CF_CUSTOM_DOMAIN --name $CF_SCRIPT_NAME \