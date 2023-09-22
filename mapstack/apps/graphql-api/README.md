# Restoring backup tables

    This presumably that the table has been configure with PITR (pioin in time recovery)
    1. Go to aws console for DynamoDB and click on 'Tables' tab
    2. Select any table from the list, 'graphql-api-dev-MapsTable-119ZVK7LD9IVG' table
    3. Click on 'Backups' table of the selected table
    4. In 'Point-in-time recovery (PITR)' click on 'Restore' button
    5. Enter the name of restored table, let say maps-restored
    6. In 'Secondary indexes' select 'Restore the entire table'
    7. Click 'Restore' button and wait for the table to be fully restored.
    8. Once the table has been fully restored select the restored table 'maps-restored'
    9. Go to 'Overview' tab in click on 'PITR' button
    10. select 'Turn on point-in-time-recovery' then save
    11. Delete the original table, 'graphql-api-dev-MapsTable-119ZVK7LD9IVG' and wait till the deleting process finished.
    12. Select 'map-restored' table then go to 'Backup' tab
    13. Click on 'Restore' button
    14. Enter 'graphql-api-dev-MapsTable-119ZVK7LD9IVG' in to 'Name of restored table' field.
    15. In 'Secondary indexes' select 'Restore the entire table' then click on 'Restore' button
    16. Once 'graphql-api-dev-MapsTable-119ZVK7LD9IVG' has been fully restored go to 'Exports and Streams' tab
    17. in 'DynamoDB stream details' click on 'Enable' button
    18. Back in to mapstack project, go to 'mapstack/apps/graphql-api' and run 'yarn deploy'

# Backup

## Backup and Restore tables

The followings are the instruction on how to backup and restore DynamoDB for 'graphql-api'. There is detial video instruction bellow

- [Backup](https://drive.google.com/drive/u/1/folders/1qKso04wI_pVkJ7hSOMquXIoygfeMBlVF)

## Backup

1.  Open any 'resource.yml' of any table
2.  Add followings line under 'Properties' section

```yaml
MapsTable:
  Type: AWS::DynamoDB::Table
  Properties:
    PointInTimeRecoverySpecification:
      PointInTimeRecoveryEnabled: true
```

3.  Run 'yarn deploy'
4.  Go to aws console for DynamoDB and click on 'Tables' tab
5.  Select the table and go to 'Backups' tab
6.  You should see 'Point-in-time recovery (PITR)' status is on

## Restoring backup tables

Backups is simple but restoring table is long process and will have to do it manually, the followings are the steps required to restore a table

### Restore a table

1.  Go to aws console for DynamoDB and click on 'Tables' tab
2.  Select any table from the list, 'graphql-api-dev-MapsTable-119ZVK7LD9IVG' table
3.  Click on 'Backups' table of the selected table
4.  In 'Point-in-time recovery (PITR)' click on 'Restore' button
5.  Enter the name of restored table, let say maps-restored
6.  In 'Secondary indexes' select 'Restore the entire table'
7.  Click 'Restore' button and wait for the table to be fully restored.
8.  Once the table has been fully restored select the restored table 'maps-restored'
9.  Go to 'Overview' tab in click on 'PITR' button
10. select 'Turn on point-in-time-recovery' then save

### Delete the original table,

This step is very critical, only when you so sure that the table has been backup

1.  Select the table 'graphql-api-dev-MapsTable-119ZVK7LD9IVG' and click the 'Delete' button and wait till the deleting process is completed.

### Create another backup from the the restored table

2.  Select 'map-restored' table then go to 'Backup' tab
3.  Click on 'Restore' button
4.  Enter 'graphql-api-dev-MapsTable-119ZVK7LD9IVG' in to 'Name of restored table' field.
5.  In 'Secondary indexes' select 'Restore the entire table' then click on 'Restore' button
6.  Once 'graphql-api-dev-MapsTable-119ZVK7LD9IVG' has been fully restored go to 'Exports and Streams' tab
7.  in 'DynamoDB stream details' select 'New and old images' click on 'Enable stream' button
8.  Because mapstack using turbo, the chance that turbo just throws back the success deployment without deploy anything. To trick turbo to redeploy 'graphql-api', just go open 'resource.yml' of any table you just restore and add a commment
9.  Back in to mapstack project, go to 'mapstack' and run 'yarn deploy', run this command at the root

### Post backup

After backup MapsTable by doing the steps mentioned above, you have to re-indexing open search by using yarn script or using open search api.

# Query an item with primary key from dynamodb using lambda function

1.  add this to resources.yml under Resources

```yaml
MapsTable:
  Type: AWS::DynamoDB::Table
  Properties:
    BillingMode: PAY_PER_REQUEST
    KeySchema:
      AttributeName: id
      KeyType: HASH
    AttributeDefinitions:
      - AttributeName: id
        AttributeType: S
    Tags:
      - Key: Environment
        Value: ${self:custom.stage}
      - Key: Name
        Value: maps-table
```

2. Add this to function.yml

```yaml
getMap:
  handler: src/map/functions/get-map/index.handler
  environment:
    MAPS_TABLE: !Ref MapsTable
  iamRoleStatements:
    - Effect: Allow
      Action: dynamodb:GetItem
      Resource: !GetAtt MapsTable.Arn
```

3. get-map/index.handler

```javascript
const { client } = require('../../../../lib/dynamodb')
const { GetCommand } = require('@aws-sdk/lib-dynamodb')
const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.REGION })

const { MAPS_TABLE } = process.env

module.exports.handler = async (event) => {
  const { input } = event.arguments

  const getMapParams = {
    TableName: MAPS_TABLE,
    Key: {
      id: input.id
    }
  }
  const data = await client.send(new GetCommand(getMapParams))
  return data
}
```

# Query an item with global secondary index from dynamodb using lambda function

1. Add this to resources.ymtl under Resources

```yaml
WorkspacesTable:
  Type: AWS::DynamoDB::Table
  Properties:
    BillingMode: PAY_PER_REQUEST
    KeySchema:
      - AttributeName: id
        KeyType: HASH
    AttributeDefinitions:
      - AttributeName: id
        AttributeType: S
      - AttributeName: ownerId
        AttributeType: S
    GlobalSecondaryIndexes:
      - IndexName: byOwner
        KeySchema:
          - AttributeName: ownerId
            KeyType: HASH
          - AttributeName: id
            KeyType: RANGE
        Projection:
          ProjectionType: ALL
    Tags:
      - Key: Environment
        Value: ${self:custom.stage}
      - Key: Name
        Value: workspaces-table
```

2.  Add this to function.yml

```yaml
getWorkspaces:
  handler: src/user/functions/get-workspaces/index.handler
  environment:
    WORKSPACES_TABLE: !Ref WorkspacesTable
  iamRoleStatements:
    - Effect: Allow
      Action: dynamodb:Query
      Resource: !Sub '${WorkspacesTable.Arn}/index/byOwner'
```

3.  get-workspace/index.handler

```javascript
const { GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb')
const _ = require('lodash')
const { client } = require('../../../../lib/dynamodb')
const { WORKSPACES_TABLE } = process.env

module.exports.handler = async (event) => {
  console.log('event from here:', event)
  const userId = event.source.id
  const params = {
    KeyConditionExpression: '#ownerId = :userId',
    ExpressionAttributeNames: { '#ownerId': 'ownerId' },
    ExpressionAttributeValues: {
      ':userId': userId
    },
    IndexName: 'byOwner',
    TableName: WORKSPACES_TABLE
  }

  const data = await client.send(new QueryCommand(params))

  return data.Items.length ? data.Items[0] : null
}
```

[TEST]
