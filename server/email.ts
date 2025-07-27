import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import dotenv from "dotenv";

dotenv.config();

// Email configuration - Common SMTP settings:
// Gmail: smtp.gmail.com:587 (TLS) or smtp.gmail.com:465 (SSL)
// Outlook: smtp-mail.outlook.com:587 (TLS)
// Yahoo: smtp.mail.yahoo.com:587 (TLS) or smtp.mail.yahoo.com:465 (SSL)
// Custom/cPanel: mail.yourdomain.com:587 (TLS) or mail.yourdomain.com:465 (SSL)

const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT || '587') === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || process.env.POSTMEAI_EMAIL,
    pass: process.env.EMAIL_PASS || 'your-password'
  },
  connectionTimeout: 15000, // 15 seconds
  greetingTimeout: 10000, // 10 seconds  
  socketTimeout: 15000, // 15 seconds
  logger: true, // Enable logging for debugging
  debug: true // Enable debug info
};

console.log('SMTP Configuration:', {
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.secure,
  user: smtpConfig.auth.user,
  hasPassword: !!smtpConfig.auth.pass
});

const transporter = nodemailer.createTransport(smtpConfig);

// Test the SMTP connection on startup
transporter.verify()
  .then(() => {
    console.log('✅ SMTP connection verified successfully');
  })
  .catch((error) => {
    console.error('❌ SMTP connection failed:', error);
  });

export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export function generatePasswordResetToken(): string {
  // Generate a 6-digit random number
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  try {

    // Get the base URL for email verification
    const getBaseUrl = () => {
      if (process.env.NODE_ENV === 'production') {
        return 'https://www.postmeai.com';
      }
      if (process.env.REPLIT_DEV_DOMAIN) {
        return `https://${process.env.REPLIT_DEV_DOMAIN}`;
      }
      return 'http://localhost:5000';
    };
    
    const verificationUrl = `${getBaseUrl()}/auth/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'PostMeAI <' + process.env.POSTMEAI_EMAIL + '>',
      to: email,
      subject: 'Verify Your PostMeAI Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to PostMeAI!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Turn Ideas into Viral Content</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Please verify your email address</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Thank you for signing up for PostMeAI! To complete your registration and start creating amazing social media content, please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        display: inline-block;
                        font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              If the button doesn't work, you can also copy and paste this link into your browser:
              <br><br>
              <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              This verification link will expire in 24 hours. If you didn't create an account with PostMeAI, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'PostMeAI <' + process.env.POSTMEAI_EMAIL + '>',
      to: email,
      subject: 'Welcome to PostMeAI - Your Account is Verified!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome ${firstName ? firstName : ''}!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your PostMeAI account is now active</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">🎉 You're all set!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Your email has been verified and you now have full access to PostMeAI. Start creating amazing social media content with the power of AI!
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
              <ul style="color: #666; padding-left: 20px;">
                <li>Create AI-powered social media posts</li>
                <li>Schedule content across multiple platforms</li>
                <li>Build and manage your image library</li>
                <li>Set up automated posting templates</li>
                <li>Connect your social media accounts</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.POSTMEAI_FE_URL}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        display: inline-block;
                        font-size: 16px;">
                Start Creating Content
              </a>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Need help? Check out our documentation or contact support at ${process.env.POSTMEAI_EMAIL}
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}
export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  try {
    console.log('Attempting to send password reset email to:', email);
    console.log('Using token:', token);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'PostMeAI <contact@postmeai.com>',
      to: email,
      subject: 'Reset Your PostMeAI Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">PostMeAI Password Reset</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              We received a request to reset your PostMeAI password. Use the verification code below to reset your password.
            </p>
            
            <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
              <h3 style="color: #1e293b; margin-bottom: 15px; font-size: 18px;">Your verification code:</h3>
              <div style="font-size: 36px; font-weight: bold; color: #6366f1; letter-spacing: 8px; margin: 20px 0; font-family: 'Courier New', monospace; background: white; padding: 20px; border-radius: 6px; border: 2px solid #6366f1;">
                ${token}
              </div>
              <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                ⏰ This code will expire in 1 hour for security reasons.
              </p>
            </div>
            
            <div style="background: #f0f9ff; border: 2px solid #0284c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #0c4a6e; margin-top: 0; font-size: 16px;">How to reset your password:</h3>
              <ol style="color: #0c4a6e; padding-left: 20px; margin: 10px 0;">
                <li>Go to the PostMeAI password reset page</li>
                <li>Enter the verification code above</li>
                <li>Create your new secure password</li>
                <li>Start using your account with the new password</li>
              </ol>
            </div>
            
            <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                <strong>🔒 Security Note:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure and no changes will be made.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${(() => {
                if (process.env.NODE_ENV === 'production') {
                  return 'https://postmeai.com';
                }
                if (process.env.REPLIT_DEV_DOMAIN) {
                  return `https://${process.env.REPLIT_DEV_DOMAIN}`;
                }
                return 'http://localhost:5000';
              })()}/reset-password" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        display: inline-block;
                        font-size: 16px;">
                Reset Password Now
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px;">
                Best regards,<br>
                The PostMeAI Team
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 10px;">
                Need help? Contact us at support@postmeai.com
              </p>
            </div>
          </div>
        </div>
      `
    };
    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    return false;
  }
}