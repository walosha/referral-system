"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Course } from "@/lib/types"

export function ReferralForm({ onReferralCreated }: { onReferralCreated: () => void }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const referredEmail = formData.get("referredEmail") as string
    const referralAmount = Number.parseFloat(formData.get("referralAmount") as string)

    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse,
          referralAmount,
          referredEmail,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Referral Created!",
          description: "Your referral has been created and notification email sent.",
        })
        event.currentTarget.reset()
        setSelectedCourse("")
        onReferralCreated()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create referral",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Referral</CardTitle>
        <CardDescription>Refer someone to a course and earn commission</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} - ₦{course.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referredEmail">Referred Person's Email</Label>
            <Input id="referredEmail" name="referredEmail" type="email" placeholder="Enter email address" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralAmount">Referral Commission (₦)</Label>
            <Input
              id="referralAmount"
              name="referralAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter commission amount"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Referral..." : "Create Referral"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
