import apigateway = require('@aws-cdk/aws-apigateway');
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

    const getAllLambda = new lambda.Function(this, 'getAllItemsFunction', {
      code: new lambda.AssetCode('src'),
      handler: 'get-all.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: shiftsTable.tableName,
        PRIMARY_KEY: this.defaultPrimaryKey,
      },
    });

    const createOne = new lambda.Function(this, 'createItemFunction', {
      code: new lambda.AssetCode('src'),
      handler: 'create.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: shiftsTable.tableName,
        PRIMARY_KEY: this.defaultPrimaryKey,
      },
    });

    const updateOne = new lambda.Function(this, 'updateItemFunction', {
      code: new lambda.AssetCode('src'),
      handler: 'update-one.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: shiftsTable.tableName,
        PRIMARY_KEY: this.defaultPrimaryKey,
      },
    });

    const deleteOne = new lambda.Function(this, 'deleteItemFunction', {
      code: new lambda.AssetCode('src'),
      handler: 'delete-one.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: shiftsTable.tableName,
        PRIMARY_KEY: this.defaultPrimaryKey,
      },
    });

    shiftsTable.grantReadWriteData(getAllLambda);
    shiftsTable.grantReadWriteData(getOneLambda);
    shiftsTable.grantReadWriteData(createOne);
    shiftsTable.grantReadWriteData(updateOne);
    shiftsTable.grantReadWriteData(deleteOne);

    const api = new apigateway.RestApi(this, 'shiftsApi', {
      restApiName: 'Shifts Service',
    });

    const shiftsRoute = api.root.addResource('shifts');
    const getAllIntegration = new apigateway.LambdaIntegration(getAllLambda);
    shiftsRoute.addMethod('GET', getAllIntegration);

    const createOneIntegration = new apigateway.LambdaIntegration(createOne);
    shiftsRoute.addMethod('POST', createOneIntegration);
    this.addCorsOptions(shiftsRoute);

    const shiftsRouteById = shiftsRoute.addResource('{id}');
    const getOneIntegration = new apigateway.LambdaIntegration(getOneLambda);
    shiftsRouteById.addMethod('GET', getOneIntegration);

    const updateOneIntegration = new apigateway.LambdaIntegration(updateOne);
    shiftsRouteById.addMethod('PATCH', updateOneIntegration);

    const deleteOneIntegration = new apigateway.LambdaIntegration(deleteOne);
    shiftsRouteById.addMethod('DELETE', deleteOneIntegration);
    this.addCorsOptions(shiftsRouteById);
  }

  private addCorsOptions(apiResource: apigateway.IResource) {
    apiResource.addMethod(
      'OPTIONS',
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers':
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
              'method.response.header.Access-Control-Allow-Origin': "'*'",
              'method.response.header.Access-Control-Allow-Credentials':
                "'false'",
              'method.response.header.Access-Control-Allow-Methods':
                "'OPTIONS,GET,PUT,POST,DELETE'",
            },
          },
        ],
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': '{"statusCode": 200}',
        },
      }),
      {
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Credentials': true,
              'method.response.header.Access-Control-Allow-Origin': true,
            },
          },
        ],
      },
    );
  }
}

const app = new cdk.App();
new ApiLambdaCrudDynamoDBStack(app, 'ApiLambdaCrudDynamoDBExample');
app.synth();
