# LinkedIn OAuth 2.0 Setup Guide

## Overview
This guide helps you configure LinkedIn OAuth 2.0 integration for PostMeAI, allowing users to sign in with their LinkedIn professional accounts.

## Prerequisites
1. LinkedIn Developer Account
2. LinkedIn App with OAuth 2.0 credentials
3. Valid LinkedIn Company Page (recommended for business features)

## Step 1: LinkedIn App Creation

### 1.1 Access LinkedIn Developer Portal
1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Sign in with your LinkedIn account
3. Click "Create App" or select an existing app

### 1.2 App Configuration
1. Fill in the required fields:
   - **App Name**: PostMeAI Integration
   - **LinkedIn Company Page**: Select your company page
   - **Privacy Policy URL**: Add your privacy policy URL
   - **App Logo**: Upload your application logo
2. Select "Create App"

### 1.3 Configure OAuth 2.0 Settings
1. Go to the "Auth" tab in your app dashboard
2. In the "OAuth 2.0 settings" section:
   - **Authorized Redirect URLs**: Add the following URLs:
     - Development: `http://localhost:5000/auth/linkedin/callback`
     - Production: `https://your-domain.com/auth/linkedin/callback`
3. Click "Update"

## Step 2: API Products and Permissions

### 2.1 Request API Access
1. Go to the "Products" tab
2. Request access to the following products:
   - **Sign In with LinkedIn**: For user authentication
   - **Marketing Developer Platform**: For content publishing (if needed)
   - **LinkedIn Pages**: For page management (if needed)

### 2.2 OAuth 2.0 Scopes
The following scopes are requested by PostMeAI:
- `r_liteprofile`: Access to basic profile information
- `r_emailaddress`: Access to user's email address

## Step 3: Get Your Credentials

### 3.1 Client ID and Client Secret
1. Go to the "Auth" tab in your LinkedIn app
2. Copy the following credentials:
   - **Client ID**: Your LinkedIn App Client ID
   - **Client Secret**: Your LinkedIn App Client Secret

### 3.2 Configure in PostMeAI
Add these credentials to your Replit Secrets:
- `LINKEDIN_CLIENT_ID`: Your LinkedIn Client ID
- `LINKEDIN_CLIENT_SECRET`: Your LinkedIn Client Secret

## Step 4: App Review Process

### 4.1 Development vs Production
- **Development**: Limited to your LinkedIn account and test users
- **Production**: Requires LinkedIn review and approval

### 4.2 Submit for Review
1. Complete all required app information
2. Provide detailed use case description
3. Submit compliance questionnaire
4. Wait for LinkedIn's approval (typically 1-2 weeks)

## Step 5: Testing OAuth Flow

### 5.1 Development Testing
1. Navigate to your PostMeAI login page
2. Click "Continue with LinkedIn"
3. Complete OAuth flow with your LinkedIn account
4. Verify user profile information is correctly retrieved

### 5.2 Production Testing
1. Deploy your app to production
2. Update redirect URLs to use production domain
3. Test with real LinkedIn users
4. Monitor authentication success rates

## OAuth 2.0 Flow Details

### Authorization Request
```
https://www.linkedin.com/oauth/v2/authorization?
response_type=code&
client_id=YOUR_CLIENT_ID&
redirect_uri=YOUR_REDIRECT_URI&
state=RANDOM_STRING&
scope=r_liteprofile%20r_emailaddress
```

### Token Exchange
```
POST https://www.linkedin.com/oauth/v2/accessToken
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTHORIZATION_CODE&
redirect_uri=YOUR_REDIRECT_URI&
client_id=YOUR_CLIENT_ID&
client_secret=YOUR_CLIENT_SECRET
```

### Profile Information
```
GET https://api.linkedin.com/v2/people/~?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))
Authorization: Bearer ACCESS_TOKEN
```

## Troubleshooting

### Common Issues

**"Invalid redirect_uri" Error**
- Solution: Ensure redirect URIs in LinkedIn app exactly match your callback URLs

**"insufficient_scope" Error**
- Solution: Verify your app has requested and been granted the necessary scopes

**"invalid_client" Error**
- Solution: Check that Client ID and Client Secret are correctly configured

**"App not approved" Error**
- Solution: Submit your app for LinkedIn review or test with authorized test users

### Debug Steps
1. Check LinkedIn Developer Console for app status
2. Verify OAuth 2.0 redirect URLs are correctly configured
3. Test with LinkedIn's OAuth 2.0 debugger tools
4. Check server logs for detailed error messages
5. Ensure app is approved for production use

## Security Considerations

1. **Client Secret Security**: Never expose LinkedIn Client Secret in client-side code
2. **State Parameter**: Always use state parameter to prevent CSRF attacks
3. **Token Storage**: Store access tokens securely and refresh as needed
4. **HTTPS Required**: Production apps must use HTTPS for OAuth callbacks
5. **Token Validation**: Validate tokens against LinkedIn's API before use

## Data Access

### User Information Available
- LinkedIn ID
- First and Last Name
- Email Address
- Profile Picture URL
- Professional Title
- Company Information

### Privacy Compliance
- Only request necessary permissions
- Clearly communicate data usage to users
- Implement proper data retention policies
- Comply with LinkedIn's Platform Guidelines

## Rate Limits

LinkedIn API has rate limits:
- **Auth API**: 500 requests per user per day
- **Profile API**: 500 requests per user per day
- **Throttling**: 100 requests per user per hour

## Best Practices

1. **User Experience**: Provide clear sign-in flow with LinkedIn branding
2. **Error Handling**: Implement comprehensive error handling for OAuth failures
3. **Token Management**: Refresh tokens before expiration
4. **Compliance**: Follow LinkedIn's Brand Guidelines
5. **Testing**: Test OAuth flow thoroughly before production deployment

## Support Resources

- [LinkedIn Developer Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [OAuth 2.0 Best Practices](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
- [LinkedIn API Reference](https://docs.microsoft.com/en-us/linkedin/shared/api-guide/)
- [PostMeAI Support](mailto:support@postmeai.com)

## Integration Status

✅ **Configured**: OAuth 2.0 flow implementation  
✅ **Configured**: User authentication and profile retrieval  
✅ **Configured**: Secure token management  
✅ **Configured**: Error handling and logging  
⚠️ **Pending**: LinkedIn App Review (for production)  
⚠️ **Pending**: Advanced API permissions (if needed)  