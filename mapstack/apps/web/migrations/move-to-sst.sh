#!/bin/sh
set -e

echo "Migrating next app from severless to sst..."

echo "Copy .serverless to backup folder"
cp -R .serverless .serverless-backup

DEPLOYMENT_BUCKET_NAME=$(grep -o '"name": *"[^"]*"' .serverless/Template.MapStackNextApplication.AwsS3.json | grep -o '"[^"]*"$' | sed 's/"//g')
echo "Empty deployment s3 bucket: $DEPLOYMENT_BUCKET_NAME ...."
aws s3 rm s3://$DEPLOYMENT_BUCKET_NAME/ --recursive || true # skip error if bucket is deleted

echo "Install Serverless Components to Root: $HOME"
mkdir -p $HOME/.serverless/components/registry/npm/@sls-next/serverless-component@3.7.0
npm install @sls-next/serverless-component@3.7.0 --prefix $HOME/.serverless/components/registry/npm/@sls-next/serverless-component@3.7.0

echo "Run Destroy Serverless"
yarn sls:pre; echo "Set Serverless Config"
[ ! -d ".serverless" ] && yarn sls:destroy; echo "Serverless Destroyed"

echo "Deploying next sst..."
yarn sst:deploy; echo "SST Deployed"

echo "Cleaning up serverless..."
rm -rf .serverless-backup; echo "Serverless Cleaned"
