import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';

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
    user: process.env.EMAIL_USER || 'contact@postmeai.com',
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

export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  try {
    const verificationUrl = `${process.env.NODE_ENV === 'production' ? 'https://postmeai.com' : 'http://localhost:5000'}/auth/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'PostMeAI <contact@postmeai.com>',
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
      from: process.env.EMAIL_USER || 'PostMeAI <contact@postmeai.com>',
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
              <a href="${process.env.NODE_ENV === 'production' ? 'https://postmeai.com' : 'http://localhost:5000'}" 
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
              Need help? Check out our documentation or contact support at support@postmeai.com
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