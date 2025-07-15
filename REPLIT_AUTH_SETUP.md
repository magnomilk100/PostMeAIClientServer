# Setting Up Authentication in Replit

## To DISABLE Authentication (Anonymous Mode)

1. **Open the Secrets tab** in the left sidebar of Replit
2. **Add a new secret:**
   - Key: `AUTH_ENABLED`
   - Value: `false`
3. **Restart your Repl** (click the "Run" button again)
4. **Check the console** - you should see: `🔓 Authentication is DISABLED - All users will be anonymous`

## To ENABLE Authentication (Default)

1. **Open the Secrets tab** in the left sidebar of Replit
2. **Either:**
   - Delete the `AUTH_ENABLED` secret entirely, OR
   - Change the `AUTH_ENABLED` value to `true`
3. **Restart your Repl**
4. **Check the console** - you should see: `🔐 Authentication is ENABLED`

## What Happens in Anonymous Mode

When `AUTH_ENABLED=false`:
- No login/registration pages are shown
- All users get full access immediately
- User profile shows: "Anonymous User" with 1000 credits
- Pro subscription features are unlocked
- Onboarding wizard is skipped
- All features work without authentication

## Current Status

Your current server log shows: `🔐 Authentication is ENABLED`

To switch to anonymous mode, add `AUTH_ENABLED=false` to your Replit Secrets.