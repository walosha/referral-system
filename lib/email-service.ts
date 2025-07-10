interface EmailContext {
  userName: string;
  courseName: string;
  referralAmount: number;
  referralCode: string;
  referredEmail?: string;
}

export class EmailService {
  private postmarkApiKey: string;

  constructor() {
    this.postmarkApiKey = process.env.POSTMARK_API_KEY || "";
  }

  async sendReferralFollowup(userData: any, leadData: any): Promise<boolean> {
    try {
      const emailContext: EmailContext = {
        userName: userData.name,
        courseName: leadData.course?.name || "Course",
        referralAmount: leadData.referral_amount,
        referralCode: leadData.referral_code,
        referredEmail: leadData.referred_email,
      };

      const emailPayload = {
        From: "enquiry@rekkeh.com",
        To: userData.email,
        Subject: `Referral Update - ${emailContext.courseName}`,
        HtmlBody: this.generateReferralEmailTemplate(emailContext),
        TextBody: this.generateReferralTextTemplate(emailContext),
      };

      const response = await this.postToPostmarkService("/email", emailPayload);

      // Log the email notification
      await this.logEmailNotification(
        userData.id,
        "referral_followup",
        "sent",
        emailContext
      );

      return response.success;
    } catch (error) {
      console.error("Email sending failed:", error);
      await this.logEmailNotification(
        userData.id,
        "referral_followup",
        "failed",
        {},
        error.message
      );
      return false;
    }
  }

  private async postToPostmarkService(path: string, payload: any) {
    const response = await fetch(`https://api.postmarkapp.com${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": this.postmarkApiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return { success: response.ok, data };
  }

  private generateReferralEmailTemplate(context: EmailContext): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Tuterial Referral Update</h2>
        <p>Hi ${context.userName},</p>
        <p>Great news! Your referral for <strong>${
          context.courseName
        }</strong> is being processed.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Referral Details:</h3>
          <p><strong>Course:</strong> ${context.courseName}</p>
          <p><strong>Referral Code:</strong> ${context.referralCode}</p>
          <p><strong>Referral Amount:</strong> $${context.referralAmount}</p>
          ${
            context.referredEmail
              ? `<p><strong>Referred Email:</strong> ${context.referredEmail}</p>`
              : ""
          }
        </div>
        <p>Thank you for being part of the Tuterial community!</p>
        <p>Best regards,<br>The Tuterial Team</p>
      </div>
    `;
  }

  private generateReferralTextTemplate(context: EmailContext): string {
    return `
      Tuterial Referral Update
      
      Hi ${context.userName},
      
      Great news! Your referral for ${context.courseName} is being processed.
      
      Referral Details:
      - Course: ${context.courseName}
      - Referral Code: ${context.referralCode}
      - Referral Amount: $${context.referralAmount}
      ${
        context.referredEmail
          ? `- Referred Email: ${context.referredEmail}`
          : ""
      }
      
      Thank you for being part of the Tuterial community!
      
      Best regards,
      The Tuterial Team
    `;
  }

  private async logEmailNotification(
    userId: string,
    templateName: string,
    status: string,
    context: any,
    errorMessage?: string
  ) {
    const { supabase } = await import("./supabase");

    await supabase.from("email_notifications").insert({
      user_id: userId,
      template_name: templateName,
      status,
      context,
      error_message: errorMessage,
      sent_at: status === "sent" ? new Date().toISOString() : null,
    });
  }
}
