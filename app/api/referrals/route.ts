import { type NextRequest, NextResponse } from "next/server"
import { ReferralService } from "@/lib/referral-service"
import jwt from "jsonwebtoken"

const referralService = new ReferralService()

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const referrals = await referralService.getReferralsByUser(decoded.userId)

    return NextResponse.json({ referrals })
  } catch (error) {
    console.error("Get referrals error:", error)
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const { courseId, referralAmount, referredEmail } = await request.json()

    if (!courseId || !referralAmount || !referredEmail) {
      return NextResponse.json(
        { error: "Course ID, referral amount, and referred email are required" },
        { status: 400 },
      )
    }

    const referral = await referralService.createReferralLead(decoded.userId, courseId, referralAmount, referredEmail)

    return NextResponse.json({ referral })
  } catch (error) {
    console.error("Create referral error:", error)
    return NextResponse.json({ error: "Failed to create referral" }, { status: 500 })
  }
}
