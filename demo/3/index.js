"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apigateway = require("@aws-cdk/aws-apigateway");
const dynamodb = require("@aws-cdk/aws-dynamodb");
const lambda = require("@aws-cdk/aws-lambda");
const cdk = require("@aws-cdk/core");
class ApiLambdaCrudDynamoDBStack extends cdk.Stack {
    constructor(app, id) {
        super(app, id);
        this.defaultPrimaryKey = 'id';
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
            const createOneIntegration = new apigateway.LambdaIntegration(createOneLambda);
            route.addMethod('POST', createOneIntegration);
            this.addCorsOptions(route);
            const routeById = route.addResource('{id}');
            const getOneIntegration = new apigateway.LambdaIntegration(getOneLambda);
            routeById.addMethod('GET', getOneIntegration);
            const updateOneIntegration = new apigateway.LambdaIntegration(updateOneLambda);
            routeById.addMethod('PATCH', updateOneIntegration);
            const deleteOneIntegration = new apigateway.LambdaIntegration(deleteOneLambda);
            routeById.addMethod('DELETE', deleteOneIntegration);
            this.addCorsOptions(routeById);
        }
    }
    buildLambdaParameters(tableName, handler) {
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
    buildGetOneLambda(tableName, modelName) {
        return new lambda.Function(this, `getOneItemFunction${modelName}`, this.buildLambdaParameters(tableName, 'get-one.handler'));
    }
    buildGetAllLambda(tableName, modelName) {
        return new lambda.Function(this, `getAllItemsFunction${modelName}`, this.buildLambdaParameters(tableName, 'get-all.handler'));
    }
    buildCreateOneLambda(tableName, modelName) {
        return new lambda.Function(this, `createOneItemFunction${modelName}`, this.buildLambdaParameters(tableName, 'create.handler'));
    }
    buildUpdateOneLambda(tableName, modelName) {
        return new lambda.Function(this, `updateOneItemFunction${modelName}`, this.buildLambdaParameters(tableName, 'update-one.handler'));
    }
    buildDeleteOneLambda(tableName, modelName) {
        return new lambda.Function(this, `deleteOneItemFunction${modelName}`, this.buildLambdaParameters(tableName, 'delete-one.handler'));
    }
    addCorsOptions(apiResource) {
        apiResource.addMethod('OPTIONS', new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                        'method.response.header.Access-Control-Allow-Origin': "'*'",
                        'method.response.header.Access-Control-Allow-Credentials': "'false'",
                        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                'application/json': '{"statusCode": 200}',
            },
        }), {
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
        });
    }
}
exports.ApiLambdaCrudDynamoDBStack = ApiLambdaCrudDynamoDBStack;
const app = new cdk.App();
new ApiLambdaCrudDynamoDBStack(app, 'ApiLambdaCrudDynamoDBExample');
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNEQUF1RDtBQUN2RCxrREFBbUQ7QUFDbkQsOENBQStDO0FBQy9DLHFDQUFzQztBQUV0QyxNQUFhLDBCQUEyQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBdUR2RCxZQUFZLEdBQVksRUFBRSxFQUFVO1FBQ2xDLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUF2RFQsc0JBQWlCLEdBQUcsSUFBSSxDQUFDO1FBeUQvQixNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtZQUM5QyxXQUFXLEVBQUUsZUFBZTtTQUM3QixDQUFDLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBRyxDQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFFN0QsS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUU7WUFDbEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7Z0JBQ2hELFlBQVksRUFBRTtvQkFDWixJQUFJLEVBQUUsSUFBSSxDQUFDLGlCQUFpQjtvQkFDNUIsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTTtpQkFDcEM7Z0JBQ0QsU0FBUyxFQUFFLFNBQVM7YUFDckIsQ0FBQyxDQUFDO1lBRUgsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLEtBQUssQ0FBQztZQUU1QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDbEUsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFD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QUNqQixrQkFBa0IsRUFBRTt3QkFDbEIscURBQXFELEVBQUUsSUFBSTt3QkFDM0QscURBQXFELEVBQUUsSUFBSTt3QkFDM0QseURBQXlELEVBQUUsSUFBSTt3QkFDL0Qsb0RBQW9ELEVBQUUsSUFBSTtxQkFDM0Q7aUJBQ0Y7YUFDRjtTQUNGLENBQ0YsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQXhKRCxnRUF3SkM7QUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMxQixJQUFJLDBCQUEwQixDQUFDLEdBQUcsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO0FBQ3BFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBhcGlnYXRld2F5ID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWFwaWdhdGV3YXknKTtcbmltcG9ydCBkeW5hbW9kYiA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1keW5hbW9kYicpO1xuaW1wb3J0IGxhbWJkYSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1sYW1iZGEnKTtcbmltcG9ydCBjZGsgPSByZXF1aXJlKCdAYXdzLWNkay9jb3JlJyk7XG5cbmV4cG9ydCBjbGFzcyBBcGlMYW1iZGFDcnVkRHluYW1vREJTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIHByaXZhdGUgZGVmYXVsdFByaW1hcnlLZXkgPSAnaWQnO1xuXG4gIGJ1aWxkTGFtYmRhUGFyYW1ldGVycyh0YWJsZU5hbWU6IHN0cmluZywgaGFuZGxlcjogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhhbmRsZXIsXG4gICAgICBjb2RlOiBuZXcgbGFtYmRhLkFzc2V0Q29kZSgnc3JjJyksXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTBfWCxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFRBQkxFX05BTUU6IHRhYmxlTmFtZSxcbiAgICAgICAgUFJJTUFSWV9LRVk6IHRoaXMuZGVmYXVsdFByaW1hcnlLZXksXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBidWlsZEdldE9uZUxhbWJkYSh0YWJsZU5hbWU6IHN0cmluZywgbW9kZWxOYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IGxhbWJkYS5GdW5jdGlvbihcbiAgICAgIHRoaXMsXG4gICAgICBgZ2V0T25lSXRlbUZ1bmN0aW9uJHttb2RlbE5hbWV9YCxcbiAgICAgIHRoaXMuYnVpbGRMYW1iZGFQYXJhbWV0ZXJzKHRhYmxlTmFtZSwgJ2dldC1vbmUuaGFuZGxlcicpLFxuICAgICk7XG4gIH1cblxuICBidWlsZEdldEFsbExhbWJkYSh0YWJsZU5hbWU6IHN0cmluZywgbW9kZWxOYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IGxhbWJkYS5GdW5jdGlvbihcbiAgICAgIHRoaXMsXG4gICAgICBgZ2V0QWxsSXRlbXNGdW5jdGlvbiR7bW9kZWxOYW1lfWAsXG4gICAgICB0aGlzLmJ1aWxkTGFtYmRhUGFyYW1ldGVycyh0YWJsZU5hbWUsICdnZXQtYWxsLmhhbmRsZXInKSxcbiAgICApO1xuICB9XG5cbiAgYnVpbGRDcmVhdGVPbmVMYW1iZGEodGFibGVOYW1lOiBzdHJpbmcsIG1vZGVsTmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBsYW1iZGEuRnVuY3Rpb24oXG4gICAgICB0aGlzLFxuICAgICAgYGNyZWF0ZU9uZUl0ZW1GdW5jdGlvbiR7bW9kZWxOYW1lfWAsXG4gICAgICB0aGlzLmJ1aWxkTGFtYmRhUGFyYW1ldGVycyh0YWJsZU5hbWUsICdjcmVhdGUuaGFuZGxlcicpLFxuICAgICk7XG4gIH1cblxuICBidWlsZFVwZGF0ZU9uZUxhbWJkYSh0YWJsZU5hbWU6IHN0cmluZywgbW9kZWxOYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IGxhbWJkYS5GdW5jdGlvbihcbiAgICAgIHRoaXMsXG4gICAgICBgdXBkYXRlT25lSXRlbUZ1bmN0aW9uJHttb2RlbE5hbWV9YCxcbiAgICAgIHRoaXMuYnVpbGRMYW1iZGFQYXJhbWV0ZXJzKHRhYmxlTmFtZSwgJ3VwZGF0ZS1vbmUuaGFuZGxlcicpLFxuICAgICk7XG4gIH1cblxuICBidWlsZERlbGV0ZU9uZUxhbWJkYSh0YWJsZU5hbWU6IHN0cmluZywgbW9kZWxOYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IGxhbWJkYS5GdW5jdGlvbihcbiAgICAgIHRoaXMsXG4gICAgICBgZGVsZXRlT25lSXRlbUZ1bmN0aW9uJHttb2RlbE5hbWV9YCxcbiAgICAgIHRoaXMuYnVpbGRMYW1iZGFQYXJhbWV0ZXJzKHRhYmxlTmFtZSwgJ2RlbGV0ZS1vbmUuaGFuZGxlcicpLFxuICAgICk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihhcHA6IGNkay5BcHAsIGlkOiBzdHJpbmcpIHtcbiAgICBzdXBlcihhcHAsIGlkKTtcblxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ0FQSScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAnc2h5ZnRwbGFuIEFQSScsXG4gICAgfSk7XG5cbiAgICBjb25zdCBtb2RlbE5hbWVzID0gWydzaGlmdHMnLCAnc3RhZmZfc2hpZnRzJywgJ2VtcGxveW1lbnRzJ107XG5cbiAgICBmb3IgKGNvbnN0IG1vZGVsTmFtZSBvZiBtb2RlbE5hbWVzKSB7XG4gICAgICBjb25zdCB0YWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCBtb2RlbE5hbWUsIHtcbiAgICAgICAgcGFydGl0aW9uS2V5OiB7XG4gICAgICAgICAgbmFtZTogdGhpcy5kZWZhdWx0UHJpbWFyeUtleSxcbiAgICAgICAgICB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyxcbiAgICAgICAgfSxcbiAgICAgICAgdGFibGVOYW1lOiBtb2RlbE5hbWUsXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgeyB0YWJsZU5hbWUgfSA9IHRhYmxlO1xuXG4gICAgICBjb25zdCBnZXRPbmVMYW1iZGEgPSB0aGlzLmJ1aWxkR2V0T25lTGFtYmRhKHRhYmxlTmFtZSwgbW9kZWxOYW1lKTtcbiAgICAgIGNvbnN0IGdldEFsbExhbWJkYSA9IHRoaXMuYnVpbGRHZXRBbGxMYW1iZGEodGFibGVOYW1lLCBtb2RlbE5hbWUpO1xuICAgICAgY29uc3QgY3JlYXRlT25lTGFtYmRhID0gdGhpcy5idWlsZENyZWF0ZU9uZUxhbWJkYSh0YWJsZU5hbWUsIG1vZGVsTmFtZSk7XG4gICAgICBjb25zdCB1cGRhdGVPbmVMYW1iZGEgPSB0aGlzLmJ1aWxkVXBkYXRlT25lTGFtYmRhKHRhYmxlTmFtZSwgbW9kZWxOYW1lKTtcbiAgICAgIGNvbnN0IGRlbGV0ZU9uZUxhbWJkYSA9IHRoaXMuYnVpbGREZWxldGVPbmVMYW1iZGEodGFibGVOYW1lLCBtb2RlbE5hbWUpO1xuXG4gICAgICB0YWJsZS5ncmFudFJlYWRXcml0ZURhdGEoZ2V0QWxsTGFtYmRhKTtcbiAgICAgIHRhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShnZXRPbmVMYW1iZGEpO1xuICAgICAgdGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGNyZWF0ZU9uZUxhbWJkYSk7XG4gICAgICB0YWJsZS5ncmFudFJlYWRXcml0ZURhdGEodXBkYXRlT25lTGFtYmRhKTtcbiAgICAgIHRhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShkZWxldGVPbmVMYW1iZGEpO1xuXG4gICAgICBjb25zdCByb3V0ZSA9IGFwaS5yb290LmFkZFJlc291cmNlKG1vZGVsTmFtZSk7XG4gICAgICBjb25zdCBnZXRBbGxJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGdldEFsbExhbWJkYSk7XG4gICAgICByb3V0ZS5hZGRNZXRob2QoJ0dFVCcsIGdldEFsbEludGVncmF0aW9uKTtcblxuICAgICAgY29uc3QgY3JlYXRlT25lSW50ZWdyYXRpb24gPSBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihcbiAgICAgICAgY3JlYXRlT25lTGFtYmRhLFxuICAgICAgKTtcbiAgICAgIHJvdXRlLmFkZE1ldGhvZCgnUE9TVCcsIGNyZWF0ZU9uZUludGVncmF0aW9uKTtcbiAgICAgIHRoaXMuYWRkQ29yc09wdGlvbnMocm91dGUpO1xuXG4gICAgICBjb25zdCByb3V0ZUJ5SWQgPSByb3V0ZS5hZGRSZXNvdXJjZSgne2lkfScpO1xuICAgICAgY29uc3QgZ2V0T25lSW50ZWdyYXRpb24gPSBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihnZXRPbmVMYW1iZGEpO1xuICAgICAgcm91dGVCeUlkLmFkZE1ldGhvZCgnR0VUJywgZ2V0T25lSW50ZWdyYXRpb24pO1xuXG4gICAgICBjb25zdCB1cGRhdGVPbmVJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKFxuICAgICAgICB1cGRhdGVPbmVMYW1iZGEsXG4gICAgICApO1xuICAgICAgcm91dGVCeUlkLmFkZE1ldGhvZCgnUEFUQ0gnLCB1cGRhdGVPbmVJbnRlZ3JhdGlvbik7XG5cbiAgICAgIGNvbnN0IGRlbGV0ZU9uZUludGVncmF0aW9uID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oXG4gICAgICAgIGRlbGV0ZU9uZUxhbWJkYSxcbiAgICAgICk7XG4gICAgICByb3V0ZUJ5SWQuYWRkTWV0aG9kKCdERUxFVEUnLCBkZWxldGVPbmVJbnRlZ3JhdGlvbik7XG4gICAgICB0aGlzLmFkZENvcnNPcHRpb25zKHJvdXRlQnlJZCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhZGRDb3JzT3B0aW9ucyhhcGlSZXNvdXJjZTogYXBpZ2F0ZXdheS5JUmVzb3VyY2UpIHtcbiAgICBhcGlSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICAnT1BUSU9OUycsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5Nb2NrSW50ZWdyYXRpb24oe1xuICAgICAgICBpbnRlZ3JhdGlvblJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOlxuICAgICAgICAgICAgICAgIFwiJ0NvbnRlbnQtVHlwZSxYLUFtei1EYXRlLEF1dGhvcml6YXRpb24sWC1BcGktS2V5LFgtQW16LVNlY3VyaXR5LVRva2VuLFgtQW16LVVzZXItQWdlbnQnXCIsXG4gICAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IFwiJyonXCIsXG4gICAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzpcbiAgICAgICAgICAgICAgICBcIidmYWxzZSdcIixcbiAgICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6XG4gICAgICAgICAgICAgICAgXCInT1BUSU9OUyxHRVQsUFVULFBPU1QsREVMRVRFJ1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBwYXNzdGhyb3VnaEJlaGF2aW9yOiBhcGlnYXRld2F5LlBhc3N0aHJvdWdoQmVoYXZpb3IuTkVWRVIsXG4gICAgICAgIHJlcXVlc3RUZW1wbGF0ZXM6IHtcbiAgICAgICAgICAnYXBwbGljYXRpb24vanNvbic6ICd7XCJzdGF0dXNDb2RlXCI6IDIwMH0nLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiB0cnVlLFxuICAgICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogdHJ1ZSxcbiAgICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnOiB0cnVlLFxuICAgICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICApO1xuICB9XG59XG5cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG5uZXcgQXBpTGFtYmRhQ3J1ZER5bmFtb0RCU3RhY2soYXBwLCAnQXBpTGFtYmRhQ3J1ZER5bmFtb0RCRXhhbXBsZScpO1xuYXBwLnN5bnRoKCk7XG4iXX0=