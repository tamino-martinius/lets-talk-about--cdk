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
        const modelNames = [
            'shifts',
            'staff_shifts',
            'employments',
            'companys',
            'users',
        ];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNEQUF1RDtBQUN2RCxrREFBbUQ7QUFDbkQsOENBQStDO0FBQy9DLHFDQUFzQztBQUV0QyxNQUFhLDBCQUEyQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBdUR2RCxZQUFZLEdBQVksRUFBRSxFQUFVO1FBQ2xDLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUF2RFQsc0JBQWlCLEdBQUcsSUFBSSxDQUFDO1FBeUQvQixNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtZQUM5QyxXQUFXLEVBQUUsZUFBZTtTQUM3QixDQUFDLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBRztZQUNqQixRQUFRO1lBQ1IsY0FBYztZQUNkLGFBQWE7WUFDYixVQUFVO1lBQ1YsT0FBTztTQUNSLENBQUM7UUFFRixLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRTtZQUNsQyxNQUFNLEtBQUssR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtnQkFDaEQsWUFBWSxFQUFFO29CQUNaLElBQUksRUFBRSxJQUFJLENBQUMsaUJBQWlCO29CQUM1QixJQUFJLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNO2lCQUNwQztnQkFDRCxTQUFTLEVBQUUsU0FBUzthQUNyQixDQUFDLENBQUM7WUFFSCxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsS0FBSyxDQUFDO1lBRTVCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDbEUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNsRSxNQUFNLGVBQWUsR0FBRyxJ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Q0UsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLGtCQUFrQixFQUFFO3dCQUNsQixxREFBcUQsRUFBRSxJQUFJO3dCQUMzRCxxREFBcUQsRUFBRSxJQUFJO3dCQUMzRCx5REFBeUQsRUFBRSxJQUFJO3dCQUMvRCxvREFBb0QsRUFBRSxJQUFJO3FCQUMzRDtpQkFDRjthQUNGO1NBQ0YsQ0FDRixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBOUpELGdFQThKQztBQUVELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzFCLElBQUksMEJBQTBCLENBQUMsR0FBRyxFQUFFLDhCQUE4QixDQUFDLENBQUM7QUFDcEUsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFwaWdhdGV3YXkgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtYXBpZ2F0ZXdheScpO1xuaW1wb3J0IGR5bmFtb2RiID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWR5bmFtb2RiJyk7XG5pbXBvcnQgbGFtYmRhID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWxhbWJkYScpO1xuaW1wb3J0IGNkayA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2NvcmUnKTtcblxuZXhwb3J0IGNsYXNzIEFwaUxhbWJkYUNydWREeW5hbW9EQlN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHJpdmF0ZSBkZWZhdWx0UHJpbWFyeUtleSA9ICdpZCc7XG5cbiAgYnVpbGRMYW1iZGFQYXJhbWV0ZXJzKHRhYmxlTmFtZTogc3RyaW5nLCBoYW5kbGVyOiBzdHJpbmcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGFuZGxlcixcbiAgICAgIGNvZGU6IG5ldyBsYW1iZGEuQXNzZXRDb2RlKCdzcmMnKSxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xMF9YLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgVEFCTEVfTkFNRTogdGFibGVOYW1lLFxuICAgICAgICBQUklNQVJZX0tFWTogdGhpcy5kZWZhdWx0UHJpbWFyeUtleSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIGJ1aWxkR2V0T25lTGFtYmRhKHRhYmxlTmFtZTogc3RyaW5nLCBtb2RlbE5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgbGFtYmRhLkZ1bmN0aW9uKFxuICAgICAgdGhpcyxcbiAgICAgIGBnZXRPbmVJdGVtRnVuY3Rpb24ke21vZGVsTmFtZX1gLFxuICAgICAgdGhpcy5idWlsZExhbWJkYVBhcmFtZXRlcnModGFibGVOYW1lLCAnZ2V0LW9uZS5oYW5kbGVyJyksXG4gICAgKTtcbiAgfVxuXG4gIGJ1aWxkR2V0QWxsTGFtYmRhKHRhYmxlTmFtZTogc3RyaW5nLCBtb2RlbE5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgbGFtYmRhLkZ1bmN0aW9uKFxuICAgICAgdGhpcyxcbiAgICAgIGBnZXRBbGxJdGVtc0Z1bmN0aW9uJHttb2RlbE5hbWV9YCxcbiAgICAgIHRoaXMuYnVpbGRMYW1iZGFQYXJhbWV0ZXJzKHRhYmxlTmFtZSwgJ2dldC1hbGwuaGFuZGxlcicpLFxuICAgICk7XG4gIH1cblxuICBidWlsZENyZWF0ZU9uZUxhbWJkYSh0YWJsZU5hbWU6IHN0cmluZywgbW9kZWxOYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IGxhbWJkYS5GdW5jdGlvbihcbiAgICAgIHRoaXMsXG4gICAgICBgY3JlYXRlT25lSXRlbUZ1bmN0aW9uJHttb2RlbE5hbWV9YCxcbiAgICAgIHRoaXMuYnVpbGRMYW1iZGFQYXJhbWV0ZXJzKHRhYmxlTmFtZSwgJ2NyZWF0ZS5oYW5kbGVyJyksXG4gICAgKTtcbiAgfVxuXG4gIGJ1aWxkVXBkYXRlT25lTGFtYmRhKHRhYmxlTmFtZTogc3RyaW5nLCBtb2RlbE5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgbGFtYmRhLkZ1bmN0aW9uKFxuICAgICAgdGhpcyxcbiAgICAgIGB1cGRhdGVPbmVJdGVtRnVuY3Rpb24ke21vZGVsTmFtZX1gLFxuICAgICAgdGhpcy5idWlsZExhbWJkYVBhcmFtZXRlcnModGFibGVOYW1lLCAndXBkYXRlLW9uZS5oYW5kbGVyJyksXG4gICAgKTtcbiAgfVxuXG4gIGJ1aWxkRGVsZXRlT25lTGFtYmRhKHRhYmxlTmFtZTogc3RyaW5nLCBtb2RlbE5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgbGFtYmRhLkZ1bmN0aW9uKFxuICAgICAgdGhpcyxcbiAgICAgIGBkZWxldGVPbmVJdGVtRnVuY3Rpb24ke21vZGVsTmFtZX1gLFxuICAgICAgdGhpcy5idWlsZExhbWJkYVBhcmFtZXRlcnModGFibGVOYW1lLCAnZGVsZXRlLW9uZS5oYW5kbGVyJyksXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGFwcDogY2RrLkFwcCwgaWQ6IHN0cmluZykge1xuICAgIHN1cGVyKGFwcCwgaWQpO1xuXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnQVBJJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdzaHlmdHBsYW4gQVBJJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IG1vZGVsTmFtZXMgPSBbXG4gICAgICAnc2hpZnRzJyxcbiAgICAgICdzdGFmZl9zaGlmdHMnLFxuICAgICAgJ2VtcGxveW1lbnRzJyxcbiAgICAgICdjb21wYW55cycsXG4gICAgICAndXNlcnMnLFxuICAgIF07XG5cbiAgICBmb3IgKGNvbnN0IG1vZGVsTmFtZSBvZiBtb2RlbE5hbWVzKSB7XG4gICAgICBjb25zdCB0YWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCBtb2RlbE5hbWUsIHtcbiAgICAgICAgcGFydGl0aW9uS2V5OiB7XG4gICAgICAgICAgbmFtZTogdGhpcy5kZWZhdWx0UHJpbWFyeUtleSxcbiAgICAgICAgICB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyxcbiAgICAgICAgfSxcbiAgICAgICAgdGFibGVOYW1lOiBtb2RlbE5hbWUsXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgeyB0YWJsZU5hbWUgfSA9IHRhYmxlO1xuXG4gICAgICBjb25zdCBnZXRPbmVMYW1iZGEgPSB0aGlzLmJ1aWxkR2V0T25lTGFtYmRhKHRhYmxlTmFtZSwgbW9kZWxOYW1lKTtcbiAgICAgIGNvbnN0IGdldEFsbExhbWJkYSA9IHRoaXMuYnVpbGRHZXRBbGxMYW1iZGEodGFibGVOYW1lLCBtb2RlbE5hbWUpO1xuICAgICAgY29uc3QgY3JlYXRlT25lTGFtYmRhID0gdGhpcy5idWlsZENyZWF0ZU9uZUxhbWJkYSh0YWJsZU5hbWUsIG1vZGVsTmFtZSk7XG4gICAgICBjb25zdCB1cGRhdGVPbmVMYW1iZGEgPSB0aGlzLmJ1aWxkVXBkYXRlT25lTGFtYmRhKHRhYmxlTmFtZSwgbW9kZWxOYW1lKTtcbiAgICAgIGNvbnN0IGRlbGV0ZU9uZUxhbWJkYSA9IHRoaXMuYnVpbGREZWxldGVPbmVMYW1iZGEodGFibGVOYW1lLCBtb2RlbE5hbWUpO1xuXG4gICAgICB0YWJsZS5ncmFudFJlYWRXcml0ZURhdGEoZ2V0QWxsTGFtYmRhKTtcbiAgICAgIHRhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShnZXRPbmVMYW1iZGEpO1xuICAgICAgdGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGNyZWF0ZU9uZUxhbWJkYSk7XG4gICAgICB0YWJsZS5ncmFudFJlYWRXcml0ZURhdGEodXBkYXRlT25lTGFtYmRhKTtcbiAgICAgIHRhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShkZWxldGVPbmVMYW1iZGEpO1xuXG4gICAgICBjb25zdCByb3V0ZSA9IGFwaS5yb290LmFkZFJlc291cmNlKG1vZGVsTmFtZSk7XG4gICAgICBjb25zdCBnZXRBbGxJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGdldEFsbExhbWJkYSk7XG4gICAgICByb3V0ZS5hZGRNZXRob2QoJ0dFVCcsIGdldEFsbEludGVncmF0aW9uKTtcblxuICAgICAgY29uc3QgY3JlYXRlT25lSW50ZWdyYXRpb24gPSBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihcbiAgICAgICAgY3JlYXRlT25lTGFtYmRhLFxuICAgICAgKTtcbiAgICAgIHJvdXRlLmFkZE1ldGhvZCgnUE9TVCcsIGNyZWF0ZU9uZUludGVncmF0aW9uKTtcbiAgICAgIHRoaXMuYWRkQ29yc09wdGlvbnMocm91dGUpO1xuXG4gICAgICBjb25zdCByb3V0ZUJ5SWQgPSByb3V0ZS5hZGRSZXNvdXJjZSgne2lkfScpO1xuICAgICAgY29uc3QgZ2V0T25lSW50ZWdyYXRpb24gPSBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihnZXRPbmVMYW1iZGEpO1xuICAgICAgcm91dGVCeUlkLmFkZE1ldGhvZCgnR0VUJywgZ2V0T25lSW50ZWdyYXRpb24pO1xuXG4gICAgICBjb25zdCB1cGRhdGVPbmVJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKFxuICAgICAgICB1cGRhdGVPbmVMYW1iZGEsXG4gICAgICApO1xuICAgICAgcm91dGVCeUlkLmFkZE1ldGhvZCgnUEFUQ0gnLCB1cGRhdGVPbmVJbnRlZ3JhdGlvbik7XG5cbiAgICAgIGNvbnN0IGRlbGV0ZU9uZUludGVncmF0aW9uID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oXG4gICAgICAgIGRlbGV0ZU9uZUxhbWJkYSxcbiAgICAgICk7XG4gICAgICByb3V0ZUJ5SWQuYWRkTWV0aG9kKCdERUxFVEUnLCBkZWxldGVPbmVJbnRlZ3JhdGlvbik7XG4gICAgICB0aGlzLmFkZENvcnNPcHRpb25zKHJvdXRlQnlJZCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhZGRDb3JzT3B0aW9ucyhhcGlSZXNvdXJjZTogYXBpZ2F0ZXdheS5JUmVzb3VyY2UpIHtcbiAgICBhcGlSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICAnT1BUSU9OUycsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5Nb2NrSW50ZWdyYXRpb24oe1xuICAgICAgICBpbnRlZ3JhdGlvblJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOlxuICAgICAgICAgICAgICAgIFwiJ0NvbnRlbnQtVHlwZSxYLUFtei1EYXRlLEF1dGhvcml6YXRpb24sWC1BcGktS2V5LFgtQW16LVNlY3VyaXR5LVRva2VuLFgtQW16LVVzZXItQWdlbnQnXCIsXG4gICAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IFwiJyonXCIsXG4gICAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzpcbiAgICAgICAgICAgICAgICBcIidmYWxzZSdcIixcbiAgICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6XG4gICAgICAgICAgICAgICAgXCInT1BUSU9OUyxHRVQsUFVULFBPU1QsREVMRVRFJ1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBwYXNzdGhyb3VnaEJlaGF2aW9yOiBhcGlnYXRld2F5LlBhc3N0aHJvdWdoQmVoYXZpb3IuTkVWRVIsXG4gICAgICAgIHJlcXVlc3RUZW1wbGF0ZXM6IHtcbiAgICAgICAgICAnYXBwbGljYXRpb24vanNvbic6ICd7XCJzdGF0dXNDb2RlXCI6IDIwMH0nLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiB0cnVlLFxuICAgICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogdHJ1ZSxcbiAgICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnOiB0cnVlLFxuICAgICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICApO1xuICB9XG59XG5cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG5uZXcgQXBpTGFtYmRhQ3J1ZER5bmFtb0RCU3RhY2soYXBwLCAnQXBpTGFtYmRhQ3J1ZER5bmFtb0RCRXhhbXBsZScpO1xuYXBwLnN5bnRoKCk7XG4iXX0=