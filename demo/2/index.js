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
        const api = new apigateway.RestApi(this, 'shiftsApi', {
            restApiName: 'Shifts Service',
        });
        const shiftsRoute = api.root.addResource('shifts');
        const getAllIntegration = new apigateway.LambdaIntegration(getAllLambda);
        shiftsRoute.addMethod('GET', getAllIntegration);
        const createOneIntegration = new apigateway.LambdaIntegration(createOneLambda);
        shiftsRoute.addMethod('POST', createOneIntegration);
        this.addCorsOptions(shiftsRoute);
        const shiftsRouteById = shiftsRoute.addResource('{id}');
        const getOneIntegration = new apigateway.LambdaIntegration(getOneLambda);
        shiftsRouteById.addMethod('GET', getOneIntegration);
        const updateOneIntegration = new apigateway.LambdaIntegration(updateOneLambda);
        shiftsRouteById.addMethod('PATCH', updateOneIntegration);
        const deleteOneIntegration = new apigateway.LambdaIntegration(deleteOneLambda);
        shiftsRouteById.addMethod('DELETE', deleteOneIntegration);
        this.addCorsOptions(shiftsRouteById);
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
    buildGetOneLambda(tableName) {
        return new lambda.Function(this, `getOneItemFunction`, this.buildLambdaParameters(tableName, 'get-one.handler'));
    }
    buildGetAllLambda(tableName) {
        return new lambda.Function(this, `getAllItemsFunction`, this.buildLambdaParameters(tableName, 'get-all.handler'));
    }
    buildCreateOneLambda(tableName) {
        return new lambda.Function(this, `createOneItemFunction`, this.buildLambdaParameters(tableName, 'create.handler'));
    }
    buildUpdateOneLambda(tableName) {
        return new lambda.Function(this, `updateOneItemFunction`, this.buildLambdaParameters(tableName, 'update-one.handler'));
    }
    buildDeleteOneLambda(tableName) {
        return new lambda.Function(this, `deleteOneItemFunction`, this.buildLambdaParameters(tableName, 'delete-one.handler'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNEQUF1RDtBQUN2RCxrREFBbUQ7QUFDbkQsOENBQStDO0FBQy9DLHFDQUFzQztBQUV0QyxNQUFhLDBCQUEyQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBdUR2RCxZQUFZLEdBQVksRUFBRSxFQUFVO1FBQ2xDLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUF2RFQsc0JBQWlCLEdBQUcsSUFBSSxDQUFDO1FBeUQvQixNQUFNLFdBQVcsR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUNyRCxZQUFZLEVBQUU7Z0JBQ1osSUFBSSxFQUFFLElBQUksQ0FBQyxpQkFBaUI7Z0JBQzVCLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU07YUFDcEM7WUFDRCxTQUFTLEVBQUUsUUFBUTtTQUNwQixDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkUsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6RSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFekUsV0FBVyxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzdDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMs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QUcsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO0FBQ3BFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBhcGlnYXRld2F5ID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWFwaWdhdGV3YXknKTtcbmltcG9ydCBkeW5hbW9kYiA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1keW5hbW9kYicpO1xuaW1wb3J0IGxhbWJkYSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1sYW1iZGEnKTtcbmltcG9ydCBjZGsgPSByZXF1aXJlKCdAYXdzLWNkay9jb3JlJyk7XG5cbmV4cG9ydCBjbGFzcyBBcGlMYW1iZGFDcnVkRHluYW1vREJTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIHByaXZhdGUgZGVmYXVsdFByaW1hcnlLZXkgPSAnaWQnO1xuXG4gIGJ1aWxkTGFtYmRhUGFyYW1ldGVycyh0YWJsZU5hbWU6IHN0cmluZywgaGFuZGxlcjogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhhbmRsZXIsXG4gICAgICBjb2RlOiBuZXcgbGFtYmRhLkFzc2V0Q29kZSgnc3JjJyksXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTBfWCxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFRBQkxFX05BTUU6IHRhYmxlTmFtZSxcbiAgICAgICAgUFJJTUFSWV9LRVk6IHRoaXMuZGVmYXVsdFByaW1hcnlLZXksXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBidWlsZEdldE9uZUxhbWJkYSh0YWJsZU5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgbGFtYmRhLkZ1bmN0aW9uKFxuICAgICAgdGhpcyxcbiAgICAgIGBnZXRPbmVJdGVtRnVuY3Rpb25gLFxuICAgICAgdGhpcy5idWlsZExhbWJkYVBhcmFtZXRlcnModGFibGVOYW1lLCAnZ2V0LW9uZS5oYW5kbGVyJyksXG4gICAgKTtcbiAgfVxuXG4gIGJ1aWxkR2V0QWxsTGFtYmRhKHRhYmxlTmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBsYW1iZGEuRnVuY3Rpb24oXG4gICAgICB0aGlzLFxuICAgICAgYGdldEFsbEl0ZW1zRnVuY3Rpb25gLFxuICAgICAgdGhpcy5idWlsZExhbWJkYVBhcmFtZXRlcnModGFibGVOYW1lLCAnZ2V0LWFsbC5oYW5kbGVyJyksXG4gICAgKTtcbiAgfVxuXG4gIGJ1aWxkQ3JlYXRlT25lTGFtYmRhKHRhYmxlTmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBsYW1iZGEuRnVuY3Rpb24oXG4gICAgICB0aGlzLFxuICAgICAgYGNyZWF0ZU9uZUl0ZW1GdW5jdGlvbmAsXG4gICAgICB0aGlzLmJ1aWxkTGFtYmRhUGFyYW1ldGVycyh0YWJsZU5hbWUsICdjcmVhdGUuaGFuZGxlcicpLFxuICAgICk7XG4gIH1cblxuICBidWlsZFVwZGF0ZU9uZUxhbWJkYSh0YWJsZU5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgbGFtYmRhLkZ1bmN0aW9uKFxuICAgICAgdGhpcyxcbiAgICAgIGB1cGRhdGVPbmVJdGVtRnVuY3Rpb25gLFxuICAgICAgdGhpcy5idWlsZExhbWJkYVBhcmFtZXRlcnModGFibGVOYW1lLCAndXBkYXRlLW9uZS5oYW5kbGVyJyksXG4gICAgKTtcbiAgfVxuXG4gIGJ1aWxkRGVsZXRlT25lTGFtYmRhKHRhYmxlTmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBsYW1iZGEuRnVuY3Rpb24oXG4gICAgICB0aGlzLFxuICAgICAgYGRlbGV0ZU9uZUl0ZW1GdW5jdGlvbmAsXG4gICAgICB0aGlzLmJ1aWxkTGFtYmRhUGFyYW1ldGVycyh0YWJsZU5hbWUsICdkZWxldGUtb25lLmhhbmRsZXInKSxcbiAgICApO1xuICB9XG5cbiAgY29uc3RydWN0b3IoYXBwOiBjZGsuQXBwLCBpZDogc3RyaW5nKSB7XG4gICAgc3VwZXIoYXBwLCBpZCk7XG5cbiAgICBjb25zdCBzaGlmdHNUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnc2hpZnRzJywge1xuICAgICAgcGFydGl0aW9uS2V5OiB7XG4gICAgICAgIG5hbWU6IHRoaXMuZGVmYXVsdFByaW1hcnlLZXksXG4gICAgICAgIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HLFxuICAgICAgfSxcbiAgICAgIHRhYmxlTmFtZTogJ3NoaWZ0cycsXG4gICAgfSk7XG5cbiAgICBjb25zdCBnZXRPbmVMYW1iZGEgPSB0aGlzLmJ1aWxkR2V0T25lTGFtYmRhKHNoaWZ0c1RhYmxlLnRhYmxlTmFtZSk7XG4gICAgY29uc3QgZ2V0QWxsTGFtYmRhID0gdGhpcy5idWlsZEdldEFsbExhbWJkYShzaGlmdHNUYWJsZS50YWJsZU5hbWUpO1xuICAgIGNvbnN0IGNyZWF0ZU9uZUxhbWJkYSA9IHRoaXMuYnVpbGRDcmVhdGVPbmVMYW1iZGEoc2hpZnRzVGFibGUudGFibGVOYW1lKTtcbiAgICBjb25zdCB1cGRhdGVPbmVMYW1iZGEgPSB0aGlzLmJ1aWxkVXBkYXRlT25lTGFtYmRhKHNoaWZ0c1RhYmxlLnRhYmxlTmFtZSk7XG4gICAgY29uc3QgZGVsZXRlT25lTGFtYmRhID0gdGhpcy5idWlsZERlbGV0ZU9uZUxhbWJkYShzaGlmdHNUYWJsZS50YWJsZU5hbWUpO1xuXG4gICAgc2hpZnRzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGdldEFsbExhbWJkYSk7XG4gICAgc2hpZnRzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGdldE9uZUxhbWJkYSk7XG4gICAgc2hpZnRzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGNyZWF0ZU9uZUxhbWJkYSk7XG4gICAgc2hpZnRzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHVwZGF0ZU9uZUxhbWJkYSk7XG4gICAgc2hpZnRzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGRlbGV0ZU9uZUxhbWJkYSk7XG5cbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdzaGlmdHNBcGknLCB7XG4gICAgICByZXN0QXBpTmFtZTogJ1NoaWZ0cyBTZXJ2aWNlJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHNoaWZ0c1JvdXRlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3NoaWZ0cycpO1xuICAgIGNvbnN0IGdldEFsbEludGVncmF0aW9uID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0QWxsTGFtYmRhKTtcbiAgICBzaGlmdHNSb3V0ZS5hZGRNZXRob2QoJ0dFVCcsIGdldEFsbEludGVncmF0aW9uKTtcblxuICAgIGNvbnN0IGNyZWF0ZU9uZUludGVncmF0aW9uID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oXG4gICAgICBjcmVhdGVPbmVMYW1iZGEsXG4gICAgKTtcbiAgICBzaGlmdHNSb3V0ZS5hZGRNZXRob2QoJ1BPU1QnLCBjcmVhdGVPbmVJbnRlZ3JhdGlvbik7XG4gICAgdGhpcy5hZGRDb3JzT3B0aW9ucyhzaGlmdHNSb3V0ZSk7XG5cbiAgICBjb25zdCBzaGlmdHNSb3V0ZUJ5SWQgPSBzaGlmdHNSb3V0ZS5hZGRSZXNvdXJjZSgne2lkfScpO1xuICAgIGNvbnN0IGdldE9uZUludGVncmF0aW9uID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0T25lTGFtYmRhKTtcbiAgICBzaGlmdHNSb3V0ZUJ5SWQuYWRkTWV0aG9kKCdHRVQnLCBnZXRPbmVJbnRlZ3JhdGlvbik7XG5cbiAgICBjb25zdCB1cGRhdGVPbmVJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKFxuICAgICAgdXBkYXRlT25lTGFtYmRhLFxuICAgICk7XG4gICAgc2hpZnRzUm91dGVCeUlkLmFkZE1ldGhvZCgnUEFUQ0gnLCB1cGRhdGVPbmVJbnRlZ3JhdGlvbik7XG5cbiAgICBjb25zdCBkZWxldGVPbmVJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKFxuICAgICAgZGVsZXRlT25lTGFtYmRhLFxuICAgICk7XG4gICAgc2hpZnRzUm91dGVCeUlkLmFkZE1ldGhvZCgnREVMRVRFJywgZGVsZXRlT25lSW50ZWdyYXRpb24pO1xuICAgIHRoaXMuYWRkQ29yc09wdGlvbnMoc2hpZnRzUm91dGVCeUlkKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkQ29yc09wdGlvbnMoYXBpUmVzb3VyY2U6IGFwaWdhdGV3YXkuSVJlc291cmNlKSB7XG4gICAgYXBpUmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgJ09QVElPTlMnLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTW9ja0ludGVncmF0aW9uKHtcbiAgICAgICAgaW50ZWdyYXRpb25SZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzpcbiAgICAgICAgICAgICAgICBcIidDb250ZW50LVR5cGUsWC1BbXotRGF0ZSxBdXRob3JpemF0aW9uLFgtQXBpLUtleSxYLUFtei1TZWN1cml0eS1Ub2tlbixYLUFtei1Vc2VyLUFnZW50J1wiLFxuICAgICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiBcIicqJ1wiLFxuICAgICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyc6XG4gICAgICAgICAgICAgICAgXCInZmFsc2UnXCIsXG4gICAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOlxuICAgICAgICAgICAgICAgIFwiJ09QVElPTlMsR0VULFBVVCxQT1NULERFTEVURSdcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgcGFzc3Rocm91Z2hCZWhhdmlvcjogYXBpZ2F0ZXdheS5QYXNzdGhyb3VnaEJlaGF2aW9yLk5FVkVSLFxuICAgICAgICByZXF1ZXN0VGVtcGxhdGVzOiB7XG4gICAgICAgICAgJ2FwcGxpY2F0aW9uL2pzb24nOiAne1wic3RhdHVzQ29kZVwiOiAyMDB9JyxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogdHJ1ZSxcbiAgICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6IHRydWUsXG4gICAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogdHJ1ZSxcbiAgICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgKTtcbiAgfVxufVxuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xubmV3IEFwaUxhbWJkYUNydWREeW5hbW9EQlN0YWNrKGFwcCwgJ0FwaUxhbWJkYUNydWREeW5hbW9EQkV4YW1wbGUnKTtcbmFwcC5zeW50aCgpO1xuIl19