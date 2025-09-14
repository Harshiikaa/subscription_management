"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Bell, Plus, Edit, Trash2, Send, Calendar, Clock, Tag, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ManualReminder {
  _id: string;
  title: string;
  description?: string;
  reminderDate: string;
  reminderTime: string;
  isActive: boolean;
  isSent: boolean;
  sentAt?: string;
  reminderType: "email" | "sms" | "both";
  customMessage?: string;
  priority: "low" | "medium" | "high";
  tags: string[];
  subscriptionId: {
    _id: string;
    productId?: { name: string };
    subscriptionPlanId?: { name: string };
    billingCycle: string;
    amount: number;
    currency: string;
    endDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Subscription {
  _id: string;
  productId?: { name: string };
  subscriptionPlanId?: { name: string };
  billingCycle: string;
  amount: number;
  currency: string;
  endDate: string;
}

export function ManualReminderManager() {
  const [reminders, setReminders] = useState<ManualReminder[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ManualReminder | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    subscriptionId: "",
    title: "",
    description: "",
    reminderDate: "",
    reminderTime: "",
    reminderType: "email" as "email" | "sms" | "both",
    customMessage: "",
    priority: "medium" as "low" | "medium" | "high",
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchReminders();
    fetchSubscriptions();
  }, []);

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/manual-reminders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReminders(data.data);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/subscriptions/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.data);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const handleCreateReminder = async () => {
    try {
      setCreating(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch("/api/manual-reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Reminder Created",
          description: "Your reminder has been created successfully",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        fetchReminders();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to create reminder",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast({
        title: "Error",
        description: "Failed to create reminder",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateReminder = async () => {
    if (!editing) return;

    try {
      setCreating(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`/api/manual-reminders/${editing._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Reminder Updated",
          description: "Your reminder has been updated successfully",
        });
        setIsEditDialogOpen(false);
        setEditing(null);
        resetForm();
        fetchReminders();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update reminder",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`/api/manual-reminders/${reminderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast({
          title: "Reminder Deleted",
          description: "Your reminder has been deleted successfully",
        });
        fetchReminders();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to delete reminder",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive",
      });
    }
  };

  const handleSendNow = async (reminderId: string) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`/api/manual-reminders/${reminderId}/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast({
          title: "Reminder Sent",
          description: "Your reminder has been sent successfully",
        });
        fetchReminders();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to send reminder",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      subscriptionId: "",
      title: "",
      description: "",
      reminderDate: "",
      reminderTime: "",
      reminderType: "email",
      customMessage: "",
      priority: "medium",
      tags: [],
    });
    setTagInput("");
  };

  const openEditDialog = (reminder: ManualReminder) => {
    setEditing(reminder);
    setFormData({
      subscriptionId: reminder.subscriptionId._id,
      title: reminder.title,
      description: reminder.description || "",
      reminderDate: reminder.reminderDate.split("T")[0],
      reminderTime: reminder.reminderTime,
      reminderType: reminder.reminderType,
      customMessage: reminder.customMessage || "",
      priority: reminder.priority,
      tags: reminder.tags,
    });
    setIsEditDialogOpen(true);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getSubscriptionName = (subscription: Subscription) => {
    return subscription.productId?.name || subscription.subscriptionPlanId?.name || "Unknown Subscription";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Manual Reminders</h2>
          <p className="text-muted-foreground">Create and manage custom reminders for your subscriptions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Reminder</DialogTitle>
              <DialogDescription>
                Set a custom reminder for your subscription
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subscription">Subscription</Label>
                <Select
                  value={formData.subscriptionId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subscriptionId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptions.map((sub) => (
                      <SelectItem key={sub._id} value={sub._id}>
                        {getSubscriptionName(sub)} - {sub.billingCycle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter reminder title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter reminder description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reminderDate">Date</Label>
                  <Input
                    id="reminderDate"
                    type="date"
                    value={formData.reminderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminderDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="reminderTime">Time</Label>
                  <Input
                    id="reminderTime"
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminderTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "low" | "medium" | "high") => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reminderType">Type</Label>
                  <Select
                    value={formData.reminderType}
                    onValueChange={(value: "email" | "sms" | "both") => setFormData(prev => ({ ...prev, reminderType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="customMessage">Custom Message (Optional)</Label>
                <Textarea
                  id="customMessage"
                  value={formData.customMessage}
                  onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
                  placeholder="Enter a custom message for the reminder"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (Optional)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Enter a tag"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReminder} disabled={creating}>
                  {creating ? "Creating..." : "Create Reminder"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {reminders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reminders Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first custom reminder for your subscriptions
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Reminder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reminders.map((reminder) => (
            <Card key={reminder._id} className={reminder.isSent ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      {reminder.title}
                    </CardTitle>
                    <CardDescription>
                      {getSubscriptionName(reminder.subscriptionId)} • {reminder.subscriptionId.billingCycle}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(reminder.priority)}>
                      {reminder.priority}
                    </Badge>
                    {reminder.isSent && (
                      <Badge variant="outline">
                        <Check className="h-3 w-3 mr-1" />
                        Sent
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reminder.description && (
                    <p className="text-sm text-muted-foreground">{reminder.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(reminder.reminderDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {reminder.reminderTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Bell className="h-4 w-4" />
                      {reminder.reminderType}
                    </div>
                  </div>

                  {reminder.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <div className="flex flex-wrap gap-1">
                        {reminder.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {reminder.customMessage && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-blue-900">Custom Message:</p>
                      <p className="text-sm text-blue-800">{reminder.customMessage}</p>
                    </div>
                  )}

                  {reminder.isSent && reminder.sentAt && (
                    <p className="text-xs text-muted-foreground">
                      Sent on {new Date(reminder.sentAt).toLocaleString()}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    {!reminder.isSent && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendNow(reminder._id)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send Now
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(reminder)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this reminder? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteReminder(reminder._id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Reminder</DialogTitle>
            <DialogDescription>
              Update your reminder details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Same form fields as create dialog */}
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter reminder title"
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter reminder description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-reminderDate">Date</Label>
                <Input
                  id="edit-reminderDate"
                  type="date"
                  value={formData.reminderDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, reminderDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-reminderTime">Time</Label>
                <Input
                  id="edit-reminderTime"
                  type="time"
                  value={formData.reminderTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, reminderTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateReminder} disabled={creating}>
                {creating ? "Updating..." : "Update Reminder"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
