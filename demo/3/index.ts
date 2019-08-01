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

  buildGetOneLambda(tableName: string, modelName: string) {
    return new lambda.Function(
      this,
      `getOneItemFunction${modelName}`,
      this.buildLambdaParameters(tableName, 'get-one.handler'),
    );
  }

  buildGetAllLambda(tableName: string, modelName: string) {
    return new lambda.Function(
      this,
      `getAllItemsFunction${modelName}`,
      this.buildLambdaParameters(tableName, 'get-all.handler'),
    );
  }

  buildCreateOneLambda(tableName: string, modelName: string) {
    return new lambda.Function(
      this,
      `createOneItemFunction${modelName}`,
      this.buildLambdaParameters(tableName, 'create.handler'),
    );
  }

  buildUpdateOneLambda(tableName: string, modelName: string) {
    return new lambda.Function(
      this,
      `updateOneItemFunction${modelName}`,
      this.buildLambdaParameters(tableName, 'update-one.handler'),
    );
  }

  buildDeleteOneLambda(tableName: string, modelName: string) {
    return new lambda.Function(
      this,
      `deleteOneItemFunction${modelName}`,
      this.buildLambdaParameters(tableName, 'delete-one.handler'),
    );
  }

  constructor(app: cdk.App, id: string) {
    super(app, id);

    const api = new apigateway.RestApi(this, 'API', {
      restApiName: 'shyftplan API',
    });

    const modelNames = ['shifts', 'staff_shifts', 'employments'];

    for (const modelName of modelNames) {
      const table = new dynamodb.Table(this, modelName, {
        partitionKey: {
          name: this.defaultPrimaryKey,
          type: dynamodb.AttributeType.STRING,
        },
        tableName: modelName,
      });

      const { tableName } = table;

      const getOneLambda = this.buildGetOneLambda(tableName, modelName);
      const getAllLambda = this.buildGetAllLambda(tableName, modelName);
      const createOneLambda = this.buildCreateOneLambda(tableName, modelName);
      const updateOneLambda = this.buildUpdateOneLambda(tableName, modelName);
      const deleteOneLambda = this.buildDeleteOneLambda(tableName, modelName);

      table.grantReadWriteData(getAllLambda);
      table.grantReadWriteData(getOneLambda);
      table.grantReadWriteData(createOneLambda);
      table.grantReadWriteData(updateOneLambda);
      table.grantReadWriteData(deleteOneLambda);

      const route = api.root.addResource(modelName);
      const getAllIntegration = new apigateway.LambdaIntegration(getAllLambda);
      route.addMethod('GET', getAllIntegration);

      const createOneIntegration = new apigateway.LambdaIntegration(
        createOneLambda,
      );
      route.addMethod('POST', createOneIntegration);
      this.addCorsOptions(route);

      const routeById = route.addResource('{id}');
      const getOneIntegration = new apigateway.LambdaIntegration(getOneLambda);
      routeById.addMethod('GET', getOneIntegration);

      const updateOneIntegration = new apigateway.LambdaIntegration(
        updateOneLambda,
      );
      routeById.addMethod('PATCH', updateOneIntegration);

      const deleteOneIntegration = new apigateway.LambdaIntegration(
        deleteOneLambda,
      );
      routeById.addMethod('DELETE', deleteOneIntegration);
      this.addCorsOptions(routeById);
    }
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
