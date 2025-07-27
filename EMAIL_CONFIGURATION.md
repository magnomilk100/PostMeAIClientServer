# Email Configuration for PostMeAI

This guide explains how to configure email functionality for PostMeAI, including SMTP setup and environment variables.

## Overview

PostMeAI uses Nodemailer for email functionality, supporting:
- User registration email verification
- Welcome emails for new users
- Password reset emails (if implemented)
- System notifications

## Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Email Configuration
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-app-password

# Optional: Override default settings
# SMTP_SECURE=true  # Set to true for port 465 (SSL)
```

## SMTP Provider Configurations

### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Important**: Use Gmail App Password, not your regular password:
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account Settings > Security > App passwords
3. Generate a new app password for "Mail"
4. Use this 16-character password as `EMAIL_PASS`

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### Custom Domain/cPanel Hosting
```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=contact@yourdomain.com
EMAIL_PASS=your-email-password
```

### SSL Configuration (Port 465)
For providers that require SSL:
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=465
SMTP_SECURE=true
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

## Email Provider Settings

### Common SMTP Ports
- **587**: TLS/STARTTLS (most common, recommended)
- **465**: SSL (legacy, but still supported)
- **25**: Unencrypted (not recommended for production)

### Security Settings
- **SMTP_SECURE=false**: Uses TLS/STARTTLS (port 587)
- **SMTP_SECURE=true**: Uses SSL (port 465)

## Testing Email Configuration

### 1. Test SMTP Connection
```bash
# Test registration with a real email address
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@yourdomain.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Check Server Logs
Monitor your application logs for:
- `SMTP Configuration: { host, port, secure, user, hasPassword }`
- `Verification email sent successfully to: email@domain.com`
- Any SMTP connection errors

### 3. Debug Mode
The application includes debug logging for SMTP operations:
```javascript
logger: true,    // Enable logging
debug: true      // Enable debug info
```

## Troubleshooting

### Common Issues

#### 1. "Greeting never received" / Connection Timeout
- **Solution**: Check SMTP host and port settings
- **Common cause**: Wrong SMTP server address or blocked port

#### 2. "Authentication failed"
- **Solution**: Verify EMAIL_USER and EMAIL_PASS
- **Gmail**: Use App Password, not regular password
- **Common cause**: Incorrect credentials or 2FA not enabled

#### 3. "Certificate error" / SSL Issues
- **Solution**: Verify SMTP_SECURE setting matches your port:
  - Port 587 → SMTP_SECURE=false
  - Port 465 → SMTP_SECURE=true

#### 4. "Connection refused"
- **Solution**: Check if your hosting provider blocks SMTP ports
- **Alternative**: Use port 587 instead of 465, or vice versa

### Email Provider Specific Issues

#### Gmail
- Enable "Less secure app access" (if not using App Password)
- Use App Password for better security
- Check Gmail's sending limits

#### Outlook/Hotmail
- Verify account is not flagged for suspicious activity
- Check Microsoft's SMTP settings haven't changed

#### Custom Domains
- Verify DNS records (MX, SPF, DKIM)
- Check with hosting provider for correct SMTP settings
- Test with webmail first to ensure email account works

## Production Deployment

### Environment Variables
Set these in your production environment:
```bash
# Production SMTP settings
SMTP_HOST=your-production-smtp.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-secure-password

# Production URL for email links
NODE_ENV=production
```

### Best Practices
1. **Use dedicated email service**: Consider services like SendGrid, Mailgun, or AWS SES
2. **Domain-based email**: Use your own domain (e.g., `noreply@yourdomain.com`)
3. **Monitor sending limits**: Most providers have daily/hourly limits
4. **Set up SPF/DKIM**: Improves deliverability and reduces spam flags
5. **Use environment-specific settings**: Different SMTP for dev/staging/production

### Recommended Production Services

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=postmaster@yourdomain.com
EMAIL_PASS=your-mailgun-password
```

#### AWS SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-ses-access-key
EMAIL_PASS=your-ses-secret-key
```

## Security Considerations

1. **Never commit passwords**: Always use environment variables
2. **Use strong passwords**: Especially for email accounts
3. **Enable 2FA**: When available on email providers
4. **Monitor usage**: Watch for unusual email sending patterns
5. **Rotate credentials**: Change passwords periodically
6. **Use App Passwords**: For Gmail and other providers that support them

## Support

If you encounter issues:
1. Check the application logs for specific error messages
2. Verify your email provider's SMTP documentation
3. Test with a simple email client first
4. Contact your hosting provider if using custom domains

## Email Templates

The application sends HTML emails with PostMeAI branding. Email templates are located in `server/email.ts` and include:
- Welcome emails for new users
- Email verification links
- Professional PostMeAI styling with gradients and branding