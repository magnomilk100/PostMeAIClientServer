# Facebook OAuth2 Setup Guide

## Overview
This guide helps you configure Facebook OAuth2 integration for PostMeAI, allowing users to automatically connect their Facebook accounts without manually entering API keys.

## Prerequisites
1. Facebook Developer Account
2. Facebook App ID and App Secret (configured in Replit Secrets)
3. Valid Facebook Business Account (recommended)

## Step 1: Facebook App Configuration

### 1.1 Access Facebook Developer Console
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Log in with your Facebook account
3. Navigate to "My Apps" → Select your app (or create a new one)

### 1.2 Add Facebook Login Product
1. In your app dashboard, go to "Products" in the left sidebar
2. Click "Add Product" and select "Facebook Login"
3. Click "Set Up" for Facebook Login

### 1.3 Configure Valid OAuth Redirect URIs
1. Go to "Products" → "Facebook Login" → "Settings"
2. In the "Valid OAuth Redirect URIs" field, add:
   - **Development**: `http://localhost:5000/auth/facebook/api-key/callback`
   - **Production**: `https://your-domain.com/auth/facebook/api-key/callback`
3. Click "Save Changes"

### 1.4 Configure App Settings
1. Go to "Settings" → "Basic"
2. Set the following fields:
   - **App Name**: PostMeAI Integration
   - **App Domains**: Add your domain (e.g., `your-domain.com`)
   - **Privacy Policy URL**: Add your privacy policy URL
   - **Terms of Service URL**: Add your terms of service URL
3. Click "Save Changes"

## Step 2: App Review and Permissions

### 2.1 Request Required Permissions
1. Go to "App Review" → "Permissions and Features"
2. Request the following permissions:
   - `pages_manage_posts` - To publish posts to Facebook Pages
   - `pages_read_engagement` - To read engagement metrics
   - `instagram_basic` - For Instagram integration
   - `instagram_content_publish` - To publish Instagram content

### 2.2 App Review Process
1. Submit your app for review with required permissions
2. Provide detailed use case for each permission
3. Include screenshots and documentation of your app's functionality
4. Wait for Facebook's approval (usually 1-7 business days)

## Step 3: Enable App for Public Use

### 3.1 Make App Live
1. Go to "Settings" → "Basic"
2. Toggle "App Mode" from "Development" to "Live"
3. Ensure all required fields are filled out

### 3.2 Verify App Status
1. Check that your app shows "Live" status
2. Verify all redirect URIs are properly configured
3. Test the OAuth flow with a test user

## Step 4: Environment Configuration

### 4.1 Replit Secrets
Ensure these secrets are configured in your Replit project:
- `FACEBOOK_APP_ID`: Your Facebook App ID
- `FACEBOOK_APP_SECRET`: Your Facebook App Secret

### 4.2 Production URLs
Update the backend routes in `server/routes.ts` to use your production domain:
```javascript
const redirectUri = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/auth/facebook/api-key/callback'
  : 'http://localhost:5000/auth/facebook/api-key/callback';
```

## Step 5: Testing OAuth Flow

### 5.1 Development Testing
1. Enable Facebook platform in Social Media settings
2. Click "Connect with Facebook" button
3. Complete OAuth flow in popup window
4. Verify API key is automatically populated

### 5.2 Production Testing
1. Deploy app to production
2. Test OAuth flow with real Facebook users
3. Verify API key validation works correctly
4. Test publishing functionality

## Troubleshooting

### Common Issues

**"App not active" Error**
- Solution: Make sure your app is in "Live" mode and approved for public use

**"Invalid redirect_uri" Error**
- Solution: Verify redirect URIs are exactly matching in Facebook app settings

**"Permission denied" Error**
- Solution: Ensure required permissions are approved through App Review

**"Invalid client_id" Error**
- Solution: Check that FACEBOOK_APP_ID is correctly set in Replit Secrets

### Debug Steps
1. Check Facebook Developer Console for app status
2. Verify all redirect URIs are properly configured
3. Test with Facebook's OAuth debugger
4. Check server logs for detailed error messages

## Security Considerations

1. **App Secret Security**: Never expose your Facebook App Secret in client-side code
2. **Token Storage**: Access tokens are temporarily stored in session and cleared after use
3. **HTTPS Required**: Production apps must use HTTPS for OAuth callbacks
4. **Token Validation**: Always validate tokens against Facebook's API before use

## API Usage

### Scopes Requested
- `pages_manage_posts`: Post content to Facebook Pages
- `pages_read_engagement`: Read post engagement metrics
- `instagram_basic`: Access Instagram account information
- `instagram_content_publish`: Publish content to Instagram

### Token Exchange
The OAuth flow exchanges authorization codes for access tokens that can be used to:
1. Authenticate user identity
2. Access Facebook Pages managed by the user
3. Publish content to Facebook and Instagram
4. Read engagement metrics and analytics

## Support

For additional help:
1. Check Facebook Developer Documentation
2. Review PostMeAI Social Media configuration
3. Contact Facebook Developer Support for app-specific issues