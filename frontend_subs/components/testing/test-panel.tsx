"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTestScenariosByCategory, runTestScenario, type TestScenario } from "@/lib/test-scenarios"
import { DemoDataGenerator } from "@/lib/demo-data-generator"
import { Play, Database, Users, CreditCard, Shield, Workflow } from "lucide-react"

export function TestPanel() {
  const [selectedScenario, setSelectedScenario] = useState<string>("")
  const [testResults, setTestResults] = useState<string[]>([])

  const handleRunScenario = (scenarioId: string) => {
    try {
      const scenario = runTestScenario(scenarioId)
      setTestResults((prev) => [...prev, `✅ ${scenario.name}: ${scenario.expectedResult}`])
    } catch (error) {
      setTestResults((prev) => [...prev, `❌ Error running scenario: ${error}`])
    }
  }

  const handleGenerateData = () => {
    const data = DemoDataGenerator.generateCompleteDataset(10, 15, 30)
    setTestResults((prev) => [
      ...prev,
      `📊 Generated ${data.users.length} users, ${data.subscriptions.length} subscriptions, ${data.transactions.length} transactions`,
    ])
  }

  const getCategoryIcon = (category: TestScenario["category"]) => {
    switch (category) {
      case "authentication":
        return <Shield className="h-4 w-4" />
      case "subscription":
        return <CreditCard className="h-4 w-4" />
      case "payment":
        return <CreditCard className="h-4 w-4" />
      case "admin":
        return <Users className="h-4 w-4" />
      case "user-flow":
        return <Workflow className="h-4 w-4" />
      default:
        return <Play className="h-4 w-4" />
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Testing & Demo Panel
        </CardTitle>
        <CardDescription>Test platform functionality and generate demo data for development</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scenarios" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
            <TabsTrigger value="data-gen">Data Generation</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-4">
            <div className="grid gap-4">
              {["authentication", "subscription", "payment", "admin", "user-flow"].map((category) => {
                const scenarios = getTestScenariosByCategory(category as TestScenario["category"])
                return (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getCategoryIcon(category as TestScenario["category"])}
                        {category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")} Tests
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        {scenarios.map((scenario) => (
                          <div key={scenario.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{scenario.name}</p>
                              <p className="text-sm text-muted-foreground">{scenario.description}</p>
                            </div>
                            <Button size="sm" onClick={() => handleRunScenario(scenario.id)}>
                              <Play className="mr-2 h-3 w-3" />
                              Run
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="data-gen" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Generate Demo Data</CardTitle>
                  <CardDescription>Create realistic test data for development and testing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button onClick={handleGenerateData}>
                      <Users className="mr-2 h-4 w-4" />
                      Generate Complete Dataset
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const users = DemoDataGenerator.generateBulkUsers(5)
                        setTestResults((prev) => [...prev, `👥 Generated ${users.length} test users`])
                      }}
                    >
                      Generate Users
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const data = DemoDataGenerator.generateCompleteDataset(3, 5, 10)
                        setTestResults((prev) => [
                          ...prev,
                          `💳 Generated ${data.transactions.length} test transactions`,
                        ])
                      }}
                    >
                      Generate Transactions
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>Demo data includes:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Realistic user profiles with various verification states</li>
                      <li>Active, cancelled, and pending subscriptions</li>
                      <li>Completed, failed, and refunded transactions</li>
                      <li>Different payment methods and billing cycles</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Test Results</CardTitle>
                <CardDescription>View results from test scenarios and data generation</CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div key={index} className="p-2 bg-muted rounded text-sm font-mono">
                        {result}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No test results yet. Run some test scenarios to see results here.
                  </p>
                )}
                {testResults.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 bg-transparent"
                    onClick={() => setTestResults([])}
                  >
                    Clear Results
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
