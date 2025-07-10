"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ReferralForm } from "./referral-form"
import { useToast } from "@/hooks/use-toast"
import type { ReferralLead } from "@/lib/types"
import { DollarSign, Users, TrendingUp, Mail } from "lucide-react"

export function ReferralDashboard() {
  const [referrals, setReferrals] = useState<ReferralLead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchReferrals()
  }, [])

  const fetchReferrals = async () => {
    try {
      const response = await fetch("/api/referrals")
      const data = await response.json()
      setReferrals(data.referrals || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load referrals",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totalEarnings = referrals.filter((r) => r.status === "completed").reduce((sum, r) => sum + r.referral_amount, 0)

  const pendingEarnings = referrals.filter((r) => r.status === "pending").reduce((sum, r) => sum + r.referral_amount, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{pendingEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referrals.length > 0
                ? Math.round((referrals.filter((r) => r.status === "completed").length / referrals.length) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Form */}
        <ReferralForm onReferralCreated={fetchReferrals} />

        {/* Recent Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
            <CardDescription>Your latest referral activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referrals.slice(0, 5).map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{referral.course?.name}</p>
                    <p className="text-sm text-muted-foreground">{referral.referred_email}</p>
                    <p className="text-sm text-muted-foreground">Code: {referral.referral_code}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={getStatusColor(referral.status)}>{referral.status}</Badge>
                    <p className="font-medium">N{referral.referral_amount}</p>
                  </div>
                </div>
              ))}
              {referrals.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No referrals yet. Create your first referral!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
