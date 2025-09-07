"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Smartphone, Wallet, MoreHorizontal, Trash2, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PaymentMethod {
  id: string
  type: "card" | "esewa" | "khalti"
  name: string
  details: string
  isDefault: boolean
  expiryDate?: string
}

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod
  onSetDefault: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function PaymentMethodCard({ paymentMethod, onSetDefault, onEdit, onDelete }: PaymentMethodCardProps) {
  const getIcon = () => {
    switch (paymentMethod.type) {
      case "card":
        return <CreditCard className="h-5 w-5" />
      case "esewa":
        return <Smartphone className="h-5 w-5" />
      case "khalti":
        return <Wallet className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getTypeLabel = () => {
    switch (paymentMethod.type) {
      case "card":
        return "Credit Card"
      case "esewa":
        return "eSewa"
      case "khalti":
        return "Khalti"
      default:
        return "Payment Method"
    }
  }

  return (
    <Card className={`${paymentMethod.isDefault ? "border-primary" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-base">{paymentMethod.name}</CardTitle>
            {paymentMethod.isDefault && <Badge>Default</Badge>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!paymentMethod.isDefault && (
                <DropdownMenuItem onClick={() => onSetDefault(paymentMethod.id)}>Set as Default</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(paymentMethod.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(paymentMethod.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{getTypeLabel()}</p>
          <p className="font-medium">{paymentMethod.details}</p>
          {paymentMethod.expiryDate && (
            <p className="text-sm text-muted-foreground">Expires: {paymentMethod.expiryDate}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
