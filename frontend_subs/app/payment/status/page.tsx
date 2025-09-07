"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MainNav } from "@/components/navigation/main-nav"
import { PaymentStatus } from "@/components/payment/payment-status"

export default function PaymentStatusPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentData, setPaymentData] = useState({
    status: "processing" as const,
    amount: 0,
    transactionId: "",
    paymentMethod: "",
  })

  useEffect(() => {
    // Get payment data from URL params
    const status = (searchParams.get("status") as "success" | "failed" | "pending" | "processing") || "processing"
    const amount = Number.parseFloat(searchParams.get("amount") || "0")
    const transactionId = searchParams.get("transaction_id") || "TXN_" + Date.now()
    const paymentMethod = searchParams.get("payment_method") || "Unknown"

    setPaymentData({
      status,
      amount,
      transactionId,
      paymentMethod,
    })

    // Simulate processing time for demo
    if (status === "processing") {
      setTimeout(() => {
        setPaymentData((prev) => ({
          ...prev,
          status: Math.random() > 0.2 ? "success" : "failed",
        }))
      }, 3000)
    }
  }, [searchParams])

  const handleRetry = () => {
    router.push("/checkout")
  }

  const handleViewDetails = () => {
    router.push("/dashboard/transactions")
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container mx-auto px-4 py-16">
        <PaymentStatus
          status={paymentData.status}
          amount={paymentData.amount}
          transactionId={paymentData.transactionId}
          paymentMethod={paymentData.paymentMethod}
          onRetry={handleRetry}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  )
}
