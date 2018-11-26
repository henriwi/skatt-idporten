const fetch = require('node-fetch');

const getPolicyDocument = (effect, resource) => {
  const policyDocument = {
    Version: '2012-10-17', // default version
    Statement: [{
      Action: 'execute-api:Invoke', // default action
      Effect: effect,
      Resource: resource,
    }]
  };

  return policyDocument;
}

const getToken = (params) => {
  if (!params.type || params.type !== 'TOKEN') {
    throw new Error('Expected "event.type" parameter to have value "TOKEN"');
  }

  const tokenString = params.authorizationToken;
  if (!tokenString) {
    throw new Error('Expected "event.authorizationToken" parameter to be set');
  }

  const match = tokenString.match(/^Bearer (.*)$/);
  if (!match || match.length < 2) {
    throw new Error(`Invalid Authorization token - ${tokenString} does not match "Bearer .*"`);
  }
  return match[1];
}
const toFormData = (params) =>{
  return Object.keys(params).map((key) => {
  return key + '=' + params[key];
}).join('&');
} 

const authenticate = async (params) => {
  const token = getToken(params);
  const tokenResponse = await fetch('https://oidc-ver2.difi.no/idporten-oidc-provider/tokeninfo',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      body: toFormData({token: token})
    });
    
    const tokenInfo = await tokenResponse.json();

    if (tokenInfo.active) {
      console.log("Valid token!");
      return {
        principalId: tokenInfo.pid,
        policyDocument: getPolicyDocument('Allow', params.methodArn),
        context: { scope: tokenInfo.scope }
      }
    } else {
      console.log("Invalid token!");
      return {
        principalId: 'anonymous',
        policyDocument: getPolicyDocument('Deny', ''),
        context: {}
      }
    }
}

exports.handler = async (event, context) => {
  try {
    const result = await authenticate(event);
    return result;
  } catch (error) {
    console.log('Error. Returning Unauthorized', error);
      return {
        principalId: 'anonymous',
        policyDocument: getPolicyDocument('Deny', ''),
        context: {}
      }
  }

}