# Google OAuth 2.0 Configuration Fix

## Current Issue
Getting 403 error when clicking "Continue with Google" button.

## Root Cause
Google Cloud Console OAuth 2.0 configuration is incomplete or incorrect.

## Solution Steps

### 1. Go to Google Cloud Console
1. Visit https://console.cloud.google.com/
2. Select your project or create a new one

### 2. Enable Google+ API
1. Go to "APIs & Services" > "Library"
2. Search for "Google+ API" and enable it
3. Also enable "Google OAuth2 API" if available

### 3. Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required fields:
   - App name: `PostMeAI`
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
5. Add test users (your email) if in testing mode
6. Save and continue

### 4. Configure OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Find your existing OAuth 2.0 Client ID: `325510328084-p45i75oqqq95156rpi8vaeq1eca2q9lb.apps.googleusercontent.com`
3. Click on it to edit
4. Under "Application type", ensure it's set to "Web application"
5. In "Authorized JavaScript origins", add:
   - `http://localhost:5000`
   - `https://www.postmeai.com`
6. In "Authorized redirect URIs", add these EXACT URLs:
   - `http://localhost:5000/auth/google/callback`
   - `https://www.postmeai.com/auth/google/callback`
7. Save changes

### 5. Important Notes
- Changes can take 5-10 minutes to propagate
- Make sure there are no extra spaces in the URLs
- The URLs must match exactly what's in your code
- If you're still in testing mode, you may need to publish the app

### 6. Alternative: Create New OAuth Client
If the above doesn't work, create a new OAuth 2.0 Client ID:
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Name it "PostMeAI Local Development"
5. Add the authorized origins and redirect URIs as above
6. Copy the new Client ID and Secret to your environment variables

## Test the Configuration
After making these changes, wait 5-10 minutes then try the Google OAuth login again.