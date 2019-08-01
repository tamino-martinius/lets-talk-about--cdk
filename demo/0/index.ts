import dynamodb = require('@aws-cdk/aws-dynamodb');
import lambda = require('@aws-cdk/aws-lambda');
import cdk = require('@aws-cdk/core');

export class ApiLambdaCrudDynamoDBStack extends cdk.Stack {
  private defaultPrimaryKey = 'id';

  constructor(app: cdk.App, id: string) {
    super(app, id);

    const shiftsTable = new dynamodb.Table(this, 'shifts', {
      partitionKey: {
        name: this.defaultPrimaryKey,
        type: dynamodb.AttributeType.STRING,
      },
      tableName: 'shifts',
    });

    const getOneLambda = new lambda.Function(this, 'getOneItemFunction', {
      code: new lambda.AssetCode('src'),
      handler: 'get-one.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: shiftsTable.tableName,
        PRIMARY_KEY: this.defaultPrimaryKey,
      },
    });

    shiftsTable.grantReadWriteData(getOneLambda);
  }
}

const app = new cdk.App();
new ApiLambdaCrudDynamoDBStack(app, 'ApiLambdaCrudDynamoDBExample');
app.synth();
