import { CognitoUserPool } from "amazon-cognito-identity-js";
import awsExports from "./aws-exports";

const poolData = {
  UserPoolId: awsExports.aws_user_pools_id,   // Cognito User Pool ID
  ClientId: awsExports.aws_user_pools_web_client_id,  // App Client ID
};

export default new CognitoUserPool(poolData);
