import apigateway = require('@aws-cdk/aws-apigateway');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import lambda = require('@aws-cdk/aws-lambda');
import cdk = require('@aws-cdk/core');

export class ApiLambdaCrudDynamoDBStack extends cdk.Stack {
  private defaultPrimaryKey = 'id';

  buildLambdaParameters(tableName: string, handler: string) {
    return {
      handler,
      code: new lambda.AssetCode('src'),
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: tableName,
        PRIMARY_KEY: this.defaultPrimaryKey,
      },
    };
  }

  buildGetOneLambda(tableName: string) {
    return new lambda.Function(
      this,
      'getOneItemFunction',
      this.buildLambdaParameters(tableName, 'get-one.handler'),
    );
  }

  buildGetAllLambda(tableName: string) {
    return new lambda.Function(
      this,
      'getAllItemsFunction',
      this.buildLambdaParameters(tableName, 'get-all.handler'),
    );
  }

  buildCreateOneLambda(tableName: string) {
    return new lambda.Function(
      this,
      'createOneItemFunction',
      this.buildLambdaParameters(tableName, 'create.handler'),
    );
  }

  buildUpdateOneLambda(tableName: string) {
    return new lambda.Function(
      this,
      'updateOneItemFunction',
      this.buildLambdaParameters(tableName, 'update-one.handler'),
    );
  }

  buildDeleteOneLambda(tableName: string) {
    return new lambda.Function(
      this,
      'deleteOneItemFunction',
      this.buildLambdaParameters(tableName, 'delete-one.handler'),
    );
  }

  constructor(app: cdk.App, id: string) {
    super(app, id);

    const api = new apigateway.RestApi(this, 'API', {
      restApiName: 'shyftplan API',
    });

    const shiftsTable = new dynamodb.Table(this, 'shifts', {
      partitionKey: {
        name: this.defaultPrimaryKey,
        type: dynamodb.AttributeType.STRING,
      },
      tableName: 'shifts',
    });

    const getOneLambda = this.buildGetOneLambda(shiftsTable.tableName);
    const getAllLambda = this.buildGetAllLambda(shiftsTable.tableName);
    const createOneLambda = this.buildCreateOneLambda(shiftsTable.tableName);
    const updateOneLambda = this.buildUpdateOneLambda(shiftsTable.tableName);
    const deleteOneLambda = this.buildDeleteOneLambda(shiftsTable.tableName);

    shiftsTable.grantReadWriteData(getAllLambda);
    shiftsTable.grantReadWriteData(getOneLambda);
    shiftsTable.grantReadWriteData(createOneLambda);
    shiftsTable.grantReadWriteData(updateOneLambda);
    shiftsTable.grantReadWriteData(deleteOneLambda);

    const shiftsRoute = api.root.addResource('shifts');
    const getAllIntegration = new apigateway.LambdaIntegration(getAllLambda);
    shiftsRoute.addMethod('GET', getAllIntegration);

    const createOneIntegration = new apigateway.LambdaIntegration(
      createOneLambda,
    );
    shiftsRoute.addMethod('POST', createOneIntegration);
    this.addCorsOptions(shiftsRoute);

    const shiftsRouteById = shiftsRoute.addResource('{id}');
    const getOneIntegration = new apigateway.LambdaIntegration(getOneLambda);
    shiftsRouteById.addMethod('GET', getOneIntegration);

    const updateOneIntegration = new apigateway.LambdaIntegration(
      updateOneLambda,
    );
    shiftsRouteById.addMethod('PATCH', updateOneIntegration);

    const deleteOneIntegration = new apigateway.LambdaIntegration(
      deleteOneLambda,
    );
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
