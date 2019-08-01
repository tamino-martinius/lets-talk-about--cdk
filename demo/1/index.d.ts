import apigateway = require('@aws-cdk/aws-apigateway');
import cdk = require('@aws-cdk/core');
export declare class ApiLambdaCrudDynamoDBStack extends cdk.Stack {
    constructor(app: cdk.App, id: string);
}
export declare function addCorsOptions(apiResource: apigateway.IResource): void;
