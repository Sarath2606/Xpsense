import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { EmailTemplateService } from './email-template.service';

export class EmailService {
  /**
   * Send invitation email using SendGrid or SMTP fallback
   */
  static async sendInvitationEmail({
    to,
    groupName,
    inviterName,
    token,
    message,
    groupId
  }: {
    to: string;
    groupName: string;
    inviterName: string;
    token: string;
    message?: string;
    groupId: string;
  }) {
    try {
      const useSendGrid = (process.env.USE_SENDGRID || '').toLowerCase() === 'true';
      
      if (useSendGrid && process.env.SENDGRID_API_KEY) {
        return await this.sendWithSendGrid({ to, groupName, inviterName, token, message, groupId });
      } else {
        return await this.sendWithSMTP({ to, groupName, inviterName, token, message, groupId });
      }
    } catch (error) {
      const errAny = error as any;
      console.error('Failed to send invitation email:', {
        message: errAny?.message,
        code: errAny?.code,
        command: errAny?.command,
        response: errAny?.response,
        responseCode: errAny?.responseCode,
        stack: errAny?.stack,
      });
      throw error;
    }
  }

  /**
   * Send email using SendGrid
   */
  private static async sendWithSendGrid({
    to,
    groupName,
    inviterName,
    token,
    message,
    groupId
  }: {
    to: string;
    groupName: string;
    inviterName: string;
    token: string;
    message?: string;
    groupId: string;
  }) {
    try {
      // Set SendGrid API key
      sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const acceptUrl = `${frontendUrl}/#splitwise/invite/accept?token=${token}`;

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">You're Invited!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Join the expense sharing group</p>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">
              ${inviterName} has invited you to join "${groupName}"
            </h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              You've been invited to join an expense sharing group on Xpenses. 
              This will help you track and split expenses with your friends and family.
            </p>
            ${message ? `
              <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin-bottom: 25px;">
                <p style="margin: 0; color: #333; font-style: italic;">
                  "${message}"
                </p>
              </div>
            ` : ''}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${acceptUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              Click the button above to accept this invitation and join the group. 
              This invitation will expire in 7 days.<br>
              If you don't have an account, you'll be prompted to create one when you accept.
            </p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">
              This invitation was sent from Xpenses - Your Personal Finance Manager<br>
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      `;

      const msg = {
        to: to,
        from: {
          email: 'xxpensetracker@gmail.com',
          name: 'Xpenses Team'
        },
        subject: `Invitation to join "${groupName}" expense group`,
        html: emailContent,
      };

      // Retry logic for SendGrid
      let retryCount = 0;
      const maxRetries = 3;
      let lastError: any;

      while (retryCount < maxRetries) {
        try {
          await sgMail.send(msg);
          console.log(`SendGrid invitation email sent to ${to} for group ${groupName} (attempt ${retryCount + 1})`);
          return; // Success, exit the function
        } catch (sendError) {
          lastError = sendError;
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`SendGrid email send attempt ${retryCount} failed, retrying in ${retryCount * 2} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryCount * 2000)); // Exponential backoff
          }
        }
      }

      // If we get here, all retries failed
      throw lastError;
    } catch (error) {
      console.error('SendGrid email sending failed:', error);
      throw error;
    }
  }

  /**
   * Send email using SMTP (fallback)
   */
  private static async sendWithSMTP({
    to,
    groupName,
    inviterName,
    token,
    message,
    groupId
  }: {
    to: string;
    groupName: string;
    inviterName: string;
    token: string;
    message?: string;
    groupId: string;
  }) {
    try {
      const secure = (process.env.SMTP_SECURE || '').toLowerCase() === 'true';
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || (secure ? '465' : '587')),
        secure: secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT || '30000'),
        greetingTimeout: parseInt(process.env.SMTP_GREETING_TIMEOUT || '30000'),
        socketTimeout: parseInt(process.env.SMTP_SOCKET_TIMEOUT || '60000'),
        // For many PaaS providers, STARTTLS with relaxed certs can help
        tls: secure ? undefined : { 
          rejectUnauthorized: false,
          ciphers: 'SSLv3'
        }
      });

      // Best-effort verify with a short timeout; do not block excessively
      try {
        await transporter.verify();
        console.log('SMTP transporter verified successfully with host:', process.env.SMTP_HOST || 'smtp.gmail.com');
      } catch (verifyError) {
        console.error('SMTP transporter verification failed:', {
          code: (verifyError as any)?.code,
          command: (verifyError as any)?.command,
          response: (verifyError as any)?.response,
          message: (verifyError as Error)?.message,
        });
        // Proceed anyway; sendMail may still succeed if verification failed due to transient networking
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const acceptUrl = `${frontendUrl}/#splitwise/invite/accept?token=${token}`;

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">You're Invited!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Join the expense sharing group</p>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">
              ${inviterName} has invited you to join "${groupName}"
            </h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              You've been invited to join an expense sharing group on Xpenses. 
              This will help you track and split expenses with your friends and family.
            </p>
            ${message ? `
              <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin-bottom: 25px;">
                <p style="margin: 0; color: #333; font-style: italic;">
                  "${message}"
                </p>
              </div>
            ` : ''}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${acceptUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              Click the button above to accept this invitation and join the group. 
              This invitation will expire in 7 days.<br>
              If you don't have an account, you'll be prompted to create one when you accept.
            </p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">
              This invitation was sent from Xpenses - Your Personal Finance Manager<br>
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      `;

      // Retry logic for email sending
      let retryCount = 0;
      const maxRetries = 3;
      let lastError: any;

      while (retryCount < maxRetries) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@xpenses.com',
            to,
            subject: `You're invited to join "${groupName}" on Xpenses`,
            html: emailContent
          });

          console.log(`SMTP invitation email sent to ${to} for group ${groupName} (attempt ${retryCount + 1})`);
          return; // Success, exit the function
        } catch (sendError) {
          lastError = sendError;
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`SMTP email send attempt ${retryCount} failed, retrying in ${retryCount * 2} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryCount * 2000)); // Exponential backoff
          }
        }
      }

      // If we get here, all retries failed
      throw lastError;
    } catch (error) {
      console.error('SMTP email sending failed:', error);
      throw error;
    }
  }
}
