export interface User {
  id: string
  email: string
  name: string
  role: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  name: string
  description: string
  price: number
  created_at: string
}

export interface ReferralLead {
  id: string
  user_id: string
  course_id: string
  referral_amount: number
  currency: string
  status: "pending" | "completed" | "cancelled"
  referral_code: string
  referred_email: string
  created_at: string
  updated_at: string
  course?: Course
  user?: User
}

export interface EmailNotification {
  id: string
  user_id: string
  template_name: string
  status: "pending" | "sent" | "failed"
  sent_at?: string
  context: any
  error_message?: string
  created_at: string
}
