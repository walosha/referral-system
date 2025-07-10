import { supabase } from "./supabase";
import { EmailService } from "./email-service";
import type { ReferralLead } from "./types";

export class ReferralService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async createReferralLead(
    userId: string,
    courseId: string,
    referralAmount: number,
    referredEmail: string
  ): Promise<ReferralLead> {
    const referralCode = this.generateReferralCode();

    const { data, error } = await supabase
      .from("referral_leads")
      .insert({
        user_id: userId,
        course_id: courseId,
        referral_amount: referralAmount,
        referral_code: referralCode,
        referred_email: referredEmail,
        status: "pending",
      })
      .select(
        `
        *,
        course:courses(*),
        user:users(id, name, email)
      `
      )
      .single();

    if (error) throw error;

    // Process notification
    await this.processReferralNotification(data.id);

    return data;
  }

  async processReferralNotification(leadId: string): Promise<void> {
    const { data: lead, error } = await supabase
      .from("referral_leads")
      .select(
        `
        *,
        course:courses(*),
        user:users(*)
      `
      )
      .eq("id", leadId)
      .single();

    if (error || !lead) {
      throw new Error("Referral lead not found");
    }

    // Send email notification
    await this.emailService.sendReferralFollowup(lead.user, lead);
  }

  async getReferralsByUser(userId: string): Promise<ReferralLead[]> {
    const { data, error } = await supabase
      .from("referral_leads")
      .select(
        `
        *,
        course:courses(*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateReferralStatus(leadId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from("referral_leads")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId);

    if (error) throw error;

    // Send notification for status change
    await this.processReferralNotification(leadId);
  }

  private generateReferralCode(): string {
    return "REF-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}
