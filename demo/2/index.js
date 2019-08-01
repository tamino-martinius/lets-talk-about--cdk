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
        return new lambda.Function(this, 'getOneItemFunction', this.buildLambdaParameters(tableName, 'get-one.handler'));
    }
    buildGetAllLambda(tableName) {
        return new lambda.Function(this, 'getAllItemsFunction', this.buildLambdaParameters(tableName, 'get-all.handler'));
    }
    buildCreateOneLambda(tableName) {
        return new lambda.Function(this, 'createOneItemFunction', this.buildLambdaParameters(tableName, 'create.handler'));
    }
    buildUpdateOneLambda(tableName) {
        return new lambda.Function(this, 'updateOneItemFunction', this.buildLambdaParameters(tableName, 'update-one.handler'));
    }
    buildDeleteOneLambda(tableName) {
        return new lambda.Function(this, 'deleteOneItemFunction', this.buildLambdaParameters(tableName, 'delete-one.handler'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNEQUF1RDtBQUN2RCxrREFBbUQ7QUFDbkQsOENBQStDO0FBQy9DLHFDQUFzQztBQUV0QyxNQUFhLDBCQUEyQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBdUR2RCxZQUFZLEdBQVksRUFBRSxFQUFVO1FBQ2xDLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUF2RFQsc0JBQWlCLEdBQUcsSUFBSSxDQUFDO1FBeUQvQixNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtZQUM5QyxXQUFXLEVBQUUsZUFBZTtTQUM3QixDQUFDLENBQUM7UUFFSCxNQUFNLFdBQVcsR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUNyRCxZQUFZLEVBQUU7Z0JBQ1osSUFBSSxFQUFFLElBQUksQ0FBQyxpQkFBaUI7Z0JBQzVCLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU07YUFDcEM7WUFDRCxTQUFTLEVBQUUsUUFBUTtTQUNwQixDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkUsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6RSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFX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LEVBQUUsOEJBQThCLENBQUMsQ0FBQztBQUNwRSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXBpZ2F0ZXdheSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1hcGlnYXRld2F5Jyk7XG5pbXBvcnQgZHluYW1vZGIgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtZHluYW1vZGInKTtcbmltcG9ydCBsYW1iZGEgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtbGFtYmRhJyk7XG5pbXBvcnQgY2RrID0gcmVxdWlyZSgnQGF3cy1jZGsvY29yZScpO1xuXG5leHBvcnQgY2xhc3MgQXBpTGFtYmRhQ3J1ZER5bmFtb0RCU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBwcml2YXRlIGRlZmF1bHRQcmltYXJ5S2V5ID0gJ2lkJztcblxuICBidWlsZExhbWJkYVBhcmFtZXRlcnModGFibGVOYW1lOiBzdHJpbmcsIGhhbmRsZXI6IHN0cmluZykge1xuICAgIHJldHVybiB7XG4gICAgICBoYW5kbGVyLFxuICAgICAgY29kZTogbmV3IGxhbWJkYS5Bc3NldENvZGUoJ3NyYycpLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzEwX1gsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBUQUJMRV9OQU1FOiB0YWJsZU5hbWUsXG4gICAgICAgIFBSSU1BUllfS0VZOiB0aGlzLmRlZmF1bHRQcmltYXJ5S2V5LFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgYnVpbGRHZXRPbmVMYW1iZGEodGFibGVOYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IGxhbWJkYS5GdW5jdGlvbihcbiAgICAgIHRoaXMsXG4gICAgICAnZ2V0T25lSXRlbUZ1bmN0aW9uJyxcbiAgICAgIHRoaXMuYnVpbGRMYW1iZGFQYXJhbWV0ZXJzKHRhYmxlTmFtZSwgJ2dldC1vbmUuaGFuZGxlcicpLFxuICAgICk7XG4gIH1cblxuICBidWlsZEdldEFsbExhbWJkYSh0YWJsZU5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgbGFtYmRhLkZ1bmN0aW9uKFxuICAgICAgdGhpcyxcbiAgICAgICdnZXRBbGxJdGVtc0Z1bmN0aW9uJyxcbiAgICAgIHRoaXMuYnVpbGRMYW1iZGFQYXJhbWV0ZXJzKHRhYmxlTmFtZSwgJ2dldC1hbGwuaGFuZGxlcicpLFxuICAgICk7XG4gIH1cblxuICBidWlsZENyZWF0ZU9uZUxhbWJkYSh0YWJsZU5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgbGFtYmRhLkZ1bmN0aW9uKFxuICAgICAgdGhpcyxcbiAgICAgICdjcmVhdGVPbmVJdGVtRnVuY3Rpb24nLFxuICAgICAgdGhpcy5idWlsZExhbWJkYVBhcmFtZXRlcnModGFibGVOYW1lLCAnY3JlYXRlLmhhbmRsZXInKSxcbiAgICApO1xuICB9XG5cbiAgYnVpbGRVcGRhdGVPbmVMYW1iZGEodGFibGVOYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IGxhbWJkYS5GdW5jdGlvbihcbiAgICAgIHRoaXMsXG4gICAgICAndXBkYXRlT25lSXRlbUZ1bmN0aW9uJyxcbiAgICAgIHRoaXMuYnVpbGRMYW1iZGFQYXJhbWV0ZXJzKHRhYmxlTmFtZSwgJ3VwZGF0ZS1vbmUuaGFuZGxlcicpLFxuICAgICk7XG4gIH1cblxuICBidWlsZERlbGV0ZU9uZUxhbWJkYSh0YWJsZU5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgbGFtYmRhLkZ1bmN0aW9uKFxuICAgICAgdGhpcyxcbiAgICAgICdkZWxldGVPbmVJdGVtRnVuY3Rpb24nLFxuICAgICAgdGhpcy5idWlsZExhbWJkYVBhcmFtZXRlcnModGFibGVOYW1lLCAnZGVsZXRlLW9uZS5oYW5kbGVyJyksXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGFwcDogY2RrLkFwcCwgaWQ6IHN0cmluZykge1xuICAgIHN1cGVyKGFwcCwgaWQpO1xuXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnQVBJJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdzaHlmdHBsYW4gQVBJJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHNoaWZ0c1RhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdzaGlmdHMnLCB7XG4gICAgICBwYXJ0aXRpb25LZXk6IHtcbiAgICAgICAgbmFtZTogdGhpcy5kZWZhdWx0UHJpbWFyeUtleSxcbiAgICAgICAgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcsXG4gICAgICB9LFxuICAgICAgdGFibGVOYW1lOiAnc2hpZnRzJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGdldE9uZUxhbWJkYSA9IHRoaXMuYnVpbGRHZXRPbmVMYW1iZGEoc2hpZnRzVGFibGUudGFibGVOYW1lKTtcbiAgICBjb25zdCBnZXRBbGxMYW1iZGEgPSB0aGlzLmJ1aWxkR2V0QWxsTGFtYmRhKHNoaWZ0c1RhYmxlLnRhYmxlTmFtZSk7XG4gICAgY29uc3QgY3JlYXRlT25lTGFtYmRhID0gdGhpcy5idWlsZENyZWF0ZU9uZUxhbWJkYShzaGlmdHNUYWJsZS50YWJsZU5hbWUpO1xuICAgIGNvbnN0IHVwZGF0ZU9uZUxhbWJkYSA9IHRoaXMuYnVpbGRVcGRhdGVPbmVMYW1iZGEoc2hpZnRzVGFibGUudGFibGVOYW1lKTtcbiAgICBjb25zdCBkZWxldGVPbmVMYW1iZGEgPSB0aGlzLmJ1aWxkRGVsZXRlT25lTGFtYmRhKHNoaWZ0c1RhYmxlLnRhYmxlTmFtZSk7XG5cbiAgICBzaGlmdHNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoZ2V0QWxsTGFtYmRhKTtcbiAgICBzaGlmdHNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoZ2V0T25lTGFtYmRhKTtcbiAgICBzaGlmdHNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoY3JlYXRlT25lTGFtYmRhKTtcbiAgICBzaGlmdHNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEodXBkYXRlT25lTGFtYmRhKTtcbiAgICBzaGlmdHNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoZGVsZXRlT25lTGFtYmRhKTtcblxuICAgIGNvbnN0IHNoaWZ0c1JvdXRlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3NoaWZ0cycpO1xuICAgIGNvbnN0IGdldEFsbEludGVncmF0aW9uID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0QWxsTGFtYmRhKTtcbiAgICBzaGlmdHNSb3V0ZS5hZGRNZXRob2QoJ0dFVCcsIGdldEFsbEludGVncmF0aW9uKTtcblxuICAgIGNvbnN0IGNyZWF0ZU9uZUludGVncmF0aW9uID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oXG4gICAgICBjcmVhdGVPbmVMYW1iZGEsXG4gICAgKTtcbiAgICBzaGlmdHNSb3V0ZS5hZGRNZXRob2QoJ1BPU1QnLCBjcmVhdGVPbmVJbnRlZ3JhdGlvbik7XG4gICAgdGhpcy5hZGRDb3JzT3B0aW9ucyhzaGlmdHNSb3V0ZSk7XG5cbiAgICBjb25zdCBzaGlmdHNSb3V0ZUJ5SWQgPSBzaGlmdHNSb3V0ZS5hZGRSZXNvdXJjZSgne2lkfScpO1xuICAgIGNvbnN0IGdldE9uZUludGVncmF0aW9uID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0T25lTGFtYmRhKTtcbiAgICBzaGlmdHNSb3V0ZUJ5SWQuYWRkTWV0aG9kKCdHRVQnLCBnZXRPbmVJbnRlZ3JhdGlvbik7XG5cbiAgICBjb25zdCB1cGRhdGVPbmVJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKFxuICAgICAgdXBkYXRlT25lTGFtYmRhLFxuICAgICk7XG4gICAgc2hpZnRzUm91dGVCeUlkLmFkZE1ldGhvZCgnUEFUQ0gnLCB1cGRhdGVPbmVJbnRlZ3JhdGlvbik7XG5cbiAgICBjb25zdCBkZWxldGVPbmVJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKFxuICAgICAgZGVsZXRlT25lTGFtYmRhLFxuICAgICk7XG4gICAgc2hpZnRzUm91dGVCeUlkLmFkZE1ldGhvZCgnREVMRVRFJywgZGVsZXRlT25lSW50ZWdyYXRpb24pO1xuICAgIHRoaXMuYWRkQ29yc09wdGlvbnMoc2hpZnRzUm91dGVCeUlkKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkQ29yc09wdGlvbnMoYXBpUmVzb3VyY2U6IGFwaWdhdGV3YXkuSVJlc291cmNlKSB7XG4gICAgYXBpUmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgJ09QVElPTlMnLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTW9ja0ludGVncmF0aW9uKHtcbiAgICAgICAgaW50ZWdyYXRpb25SZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzpcbiAgICAgICAgICAgICAgICBcIidDb250ZW50LVR5cGUsWC1BbXotRGF0ZSxBdXRob3JpemF0aW9uLFgtQXBpLUtleSxYLUFtei1TZWN1cml0eS1Ub2tlbixYLUFtei1Vc2VyLUFnZW50J1wiLFxuICAgICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiBcIicqJ1wiLFxuICAgICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyc6XG4gICAgICAgICAgICAgICAgXCInZmFsc2UnXCIsXG4gICAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOlxuICAgICAgICAgICAgICAgIFwiJ09QVElPTlMsR0VULFBVVCxQT1NULERFTEVURSdcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgcGFzc3Rocm91Z2hCZWhhdmlvcjogYXBpZ2F0ZXdheS5QYXNzdGhyb3VnaEJlaGF2aW9yLk5FVkVSLFxuICAgICAgICByZXF1ZXN0VGVtcGxhdGVzOiB7XG4gICAgICAgICAgJ2FwcGxpY2F0aW9uL2pzb24nOiAne1wic3RhdHVzQ29kZVwiOiAyMDB9JyxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogdHJ1ZSxcbiAgICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6IHRydWUsXG4gICAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogdHJ1ZSxcbiAgICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgKTtcbiAgfVxufVxuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xubmV3IEFwaUxhbWJkYUNydWREeW5hbW9EQlN0YWNrKGFwcCwgJ0FwaUxhbWJkYUNydWREeW5hbW9EQkV4YW1wbGUnKTtcbmFwcC5zeW50aCgpO1xuIl19