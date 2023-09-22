import editDotEnv from 'edit-dotenv'
import fs from 'fs'

function readOutputStack() {
  const outputPath = '.serverless/stack.json'
  const rawData = fs.readFileSync(outputPath)
  return JSON.parse(rawData)
}

async function handler() {
  const configPath = '../../config.env'
  const dotEnv = fs.readFileSync(configPath).toString()
  const data = readOutputStack()
  const changes = {
    
    
    USER_POOL_ID: data.CognitoUserPoolId,
    USER_POOL_WEB_CLIENT_ID: data.WebCognitoUserPoolClientId,
    REGION: data.Region,
  }

  const newEnv = editDotEnv(dotEnv, changes)
  fs.writeFileSync(configPath, newEnv)

  const graphqlConfigPath = '.env'
  let graphqlDotEnv
  try {
    graphqlDotEnv = fs.readFileSync(graphqlConfigPath).toString()
  } catch (error) {
    graphqlDotEnv = ''
  }

  const graphqlChanges = {
    USER_POOL_ID: data.CognitoUserPoolId,
    USER_POOL_WEB_CLIENT_ID: data.WebCognitoUserPoolClientId,
    REGION: data.Region,
    
  }
  const newGraphqlEnv = editDotEnv(graphqlDotEnv, graphqlChanges)
  fs.writeFileSync(graphqlConfigPath, newGraphqlEnv)
}

handler()
