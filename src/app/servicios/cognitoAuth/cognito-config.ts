export const COGNITO_CONFIG = {
  userPoolId: 'us-east-1_K4vjwm6rJ',
  userPoolClientId: '4jk547pspq0vhk8q3lum84fdgo',
  region: 'us-east-1',
  oauth: {
    domain: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_K4vjwm6rJ',
    scopes: ['phone', 'openid', 'email'],
    redirectSignIn: 'http://localhost:4200',
    redirectSignOut: 'http://localhost:4200',
    responseType: 'code' as const
  }
} as const;