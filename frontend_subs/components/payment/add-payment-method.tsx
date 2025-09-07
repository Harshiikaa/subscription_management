"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardHeader } from "@/components/ui/card"
import { CreditCard, Smartphone, Wallet, Plus } from "lucide-react"

interface AddPaymentMethodProps {
  onAdd: (paymentMethod: any) => void
}

export function AddPaymentMethod({ onAdd }: AddPaymentMethodProps) {
  const [open, setOpen] = useState(false)
  const [paymentType, setPaymentType] = useState("card")
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    esewaId: "",
    khaltiId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let paymentMethod

    switch (paymentType) {
      case "card":
        paymentMethod = {
          id: Date.now().toString(),
          type: "card",
          name: formData.cardholderName,
          details: `**** **** **** ${formData.cardNumber.slice(-4)}`,
          expiryDate: formData.expiryDate,
          isDefault: false,
        }
        break
      case "esewa":
        paymentMethod = {
          id: Date.now().toString(),
          type: "esewa",
          name: "eSewa Wallet",
          details: formData.esewaId,
          isDefault: false,
        }
        break
      case "khalti":
        paymentMethod = {
          id: Date.now().toString(),
          type: "khalti",
          name: "Khalti Wallet",
          details: formData.khaltiId,
          isDefault: false,
        }
        break
    }

    onAdd(paymentMethod)
    setOpen(false)
    setFormData({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      esewaId: "",
      khaltiId: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>Add a new payment method to your account</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-base font-medium">Payment Method Type</Label>
            <RadioGroup value={paymentType} onValueChange={setPaymentType} className="mt-2">
              <Card className={`cursor-pointer ${paymentType === "card" ? "border-primary" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      Credit/Debit Card
                    </Label>
                  </div>
                </CardHeader>
              </Card>

              <Card className={`cursor-pointer ${paymentType === "esewa" ? "border-primary" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="esewa" id="esewa" />
                    <Label htmlFor="esewa" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="h-4 w-4" />
                      eSewa
                    </Label>
                  </div>
                </CardHeader>
              </Card>

              <Card className={`cursor-pointer ${paymentType === "khalti" ? "border-primary" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="khalti" id="khalti" />
                    <Label htmlFor="khalti" className="flex items-center gap-2 cursor-pointer">
                      <Wallet className="h-4 w-4" />
                      Khalti
                    </Label>
                  </div>
                </CardHeader>
              </Card>
            </RadioGroup>
          </div>

          {paymentType === "card" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={formData.cardholderName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cardholderName: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cardNumber: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cvv: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentType === "esewa" && (
            <div>
              <Label htmlFor="esewaId">eSewa ID</Label>
              <Input
                id="esewaId"
                placeholder="9841234567 or user@esewa.com"
                value={formData.esewaId}
                onChange={(e) => setFormData((prev) => ({ ...prev, esewaId: e.target.value }))}
                required
              />
            </div>
          )}

          {paymentType === "khalti" && (
            <div>
              <Label htmlFor="khaltiId">Khalti ID</Label>
              <Input
                id="khaltiId"
                placeholder="9841234567 or user@khalti.com"
                value={formData.khaltiId}
                onChange={(e) => setFormData((prev) => ({ ...prev, khaltiId: e.target.value }))}
                required
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Add Payment Method
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
