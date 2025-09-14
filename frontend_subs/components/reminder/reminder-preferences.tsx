"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, Smartphone, Save, TestTube } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReminderPreferences {
  subscriptionExpiryReminder: {
    enabled: boolean;
    daysBeforeExpiry: 10 | 15;
  };
  emailNotifications: {
    enabled: boolean;
    email: string;
  };
  smsNotifications: {
    enabled: boolean;
    phoneNumber: string;
  };
  lastReminderSent?: string;
}

export function ReminderPreferences() {
  const [preferences, setPreferences] = useState<ReminderPreferences>({
    subscriptionExpiryReminder: {
      enabled: true,
      daysBeforeExpiry: 10,
    },
    emailNotifications: {
      enabled: true,
      email: "",
    },
    smsNotifications: {
      enabled: false,
      phoneNumber: "",
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to manage reminder preferences",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/reminders/preferences", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data);
      } else {
        console.error("Failed to fetch preferences");
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch("/api/reminders/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast({
          title: "Preferences Saved",
          description: "Your reminder preferences have been updated successfully",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to save preferences",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    if (!preferences.emailNotifications.email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address first",
        variant: "destructive",
      });
      return;
    }

    try {
      setTestingEmail(true);
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch("/api/reminders/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: preferences.emailNotifications.email }),
      });

      if (response.ok) {
        toast({
          title: "Test Email Sent",
          description: "Check your inbox for the test email",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to send test email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const updatePreference = (path: string, value: any) => {
    setPreferences(prev => {
      const newPrefs = { ...prev };
      const keys = path.split('.');
      let current = newPrefs;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newPrefs;
    });
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Subscription Expiry Reminders
          </CardTitle>
          <CardDescription>
            Get notified before your subscriptions expire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminder-enabled">Enable Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications before your subscriptions expire
              </p>
            </div>
            <Switch
              id="reminder-enabled"
              checked={preferences.subscriptionExpiryReminder.enabled}
              onCheckedChange={(checked) => 
                updatePreference("subscriptionExpiryReminder.enabled", checked)
              }
            />
          </div>

          {preferences.subscriptionExpiryReminder.enabled && (
            <div className="space-y-2">
              <Label htmlFor="reminder-days">Remind me</Label>
              <Select
                value={preferences.subscriptionExpiryReminder.daysBeforeExpiry.toString()}
                onValueChange={(value) => 
                  updatePreference("subscriptionExpiryReminder.daysBeforeExpiry", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 days before expiry</SelectItem>
                  <SelectItem value="15">15 days before expiry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Receive reminder emails at your registered email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-enabled">Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send reminders to your email address
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={preferences.emailNotifications.enabled}
              onCheckedChange={(checked) => 
                updatePreference("emailNotifications.enabled", checked)
              }
            />
          </div>

          {preferences.emailNotifications.enabled && (
            <div className="space-y-2">
              <Label htmlFor="email-address">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email-address"
                  type="email"
                  value={preferences.emailNotifications.email}
                  onChange={(e) => 
                    updatePreference("emailNotifications.email", e.target.value)
                  }
                  placeholder="Enter your email address"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sendTestEmail}
                  disabled={testingEmail || !preferences.emailNotifications.email}
                >
                  {testingEmail ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Receive reminder SMS messages (coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send reminders via SMS
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Coming Soon</Badge>
              <Switch
                id="sms-enabled"
                checked={false}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {preferences.lastReminderSent && (
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">
              <strong>Last reminder sent:</strong>{" "}
              {new Date(preferences.lastReminderSent).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
