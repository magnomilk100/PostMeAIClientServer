# Authentication Configuration Guide

## Overview
The PostMeAI application has a flexible authentication system that can be easily enabled or disabled using environment variables.

## Quick Setup

### 1. Enable Authentication (Default)
```bash
# In your .env file
AUTH_ENABLED=true
```

### 2. Disable Authentication
```bash
# In your .env file
AUTH_ENABLED=false
```

## How It Works

### When Authentication is ENABLED (AUTH_ENABLED=true)
- Users must log in with Google, Facebook, or LinkedIn
- User accounts are created and managed in the database
- Session management is active
- Protected routes require authentication
- Onboarding flow is triggered for new users

### When Authentication is DISABLED (AUTH_ENABLED=false)
- All users are treated as anonymous with full access
- No login/registration pages are shown
- No database user management
- No session management
- All features are immediately accessible
- Onboarding is skipped

## Anonymous User Profile (When Auth Disabled)
When authentication is disabled, all users get this profile:
- ID: "anonymous"
- Email: "anonymous@example.com"
- Name: "Anonymous User"
- Credits: 1000
- Subscription: Pro (unlimited)
- Onboarding: Completed (skipped)

## Environment Variables

### Required for ALL modes:
```bash
DATABASE_URL=your_database_url_here
```

### Only needed when AUTH_ENABLED=true:
```bash
SESSION_SECRET=your-session-secret-here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
```

## Server Console Messages
The server will log the authentication status on startup:
- 🔐 **Authentication is ENABLED** - Full auth system active
- 🔓 **Authentication is DISABLED** - Anonymous mode active

## Routes That Are Always Public
These routes are accessible even when authentication is enabled:
- `/` (Home page)
- `/documentation`
- `/watch-demo`
- `/privacy-policy`
- `/i18n-demo`

## Changing Authentication Mode
1. Update your `.env` file with `AUTH_ENABLED=true` or `AUTH_ENABLED=false`
2. Restart the application
3. Check the server console for confirmation message

## For Production Deployment
- Always use `AUTH_ENABLED=true` in production
- Ensure all OAuth credentials are properly configured
- Use strong session secrets
- Configure proper email settings for user verification