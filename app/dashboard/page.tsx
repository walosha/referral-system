import { ReferralDashboard } from "@/components/referral-dashboard"

export default function Dashboard() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Referral Dashboard</h1>
        <p className="text-muted-foreground">Manage your referrals and track your earnings</p>
      </div>
      <ReferralDashboard />
    </div>
  )
}
