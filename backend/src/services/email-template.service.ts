export class EmailTemplateService {
  /**
   * Generate professional invitation email content that avoids spam filters
   */
  static generateInvitationEmail({
    inviterName,
    groupName,
    acceptUrl,
    message
  }: {
    inviterName: string;
    groupName: string;
    acceptUrl: string;
    message?: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Expense Group Invitation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 20px 0;">
              <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 30px 40px;">
                    <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #333333; font-weight: normal;">
                      Expense Group Invitation
                    </h1>
                    
                    <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">
                      Hello,
                    </p>
                    
                    <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">
                      ${inviterName} has invited you to join the expense sharing group "${groupName}" on Xpenses.
                    </p>
                    
                    <p style="margin: 0 0 25px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                      Xpenses helps you track and split expenses with friends and family. You can easily manage shared costs and see who owes what.
                    </p>
                    
                    ${message ? `
                      <div style="background-color: #f8f9fa; padding: 15px; border-left: 3px solid #007bff; margin: 0 0 25px 0;">
                        <p style="margin: 0; color: #333333; font-style: italic; font-size: 14px; line-height: 1.4;">
                          "${message}"
                        </p>
                      </div>
                    ` : ''}
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${acceptUrl}" 
                         style="background-color: #007bff; 
                                color: #ffffff; 
                                padding: 12px 24px; 
                                text-decoration: none; 
                                border-radius: 4px; 
                                font-weight: normal; 
                                display: inline-block;
                                font-size: 14px;
                                border: none;">
                        Accept Invitation
                      </a>
                    </div>
                    
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 13px; line-height: 1.4;">
                      This invitation will expire in 7 days. If you don't have an Xpenses account, you'll be prompted to create one when you accept.
                    </p>
                    
                    <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.4;">
                      If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f9fa; padding: 15px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0; color: #666666; font-size: 11px;">
                      Sent by Xpenses - Personal Finance Manager
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
