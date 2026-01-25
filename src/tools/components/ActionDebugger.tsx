import { CheckCircle2, Clock, Play, RotateCcw, StepForward, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * ActionDebugger - Debug action execution with step-through visualization
 *
 * Features:
 * - Action execution trace viewer
 * - Step-through debugging
 * - Input/output inspection
 * - Execution timeline visualization
 * - Error tracking and display
 */
export function ActionDebugger() {
  const [actionConfig, setActionConfig] = useState('');
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionMode, setExecutionMode] = useState<'auto' | 'step'>('auto');

  const sampleActions = {
    simple: `{
  "id": "submit-form",
  "type": "executeAction",
  "handler": "create",
  "params": {
    "entity": "user",
    "data": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}`,
    workflow: `{
  "id": "approval-workflow",
  "type": "workflow",
  "steps": [
    {
      "id": "validate",
      "type": "executeAction",
      "handler": "validate",
      "params": {
        "rules": ["required", "email"]
      }
    },
    {
      "id": "save",
      "type": "executeAction",
      "handler": "create",
      "params": {
        "entity": "approval"
      }
    },
    {
      "id": "notify",
      "type": "executeAction",
      "handler": "notification",
      "params": {
        "type": "email",
        "template": "approval-request"
      }
    }
  ]
}`,
    navigation: `{
  "id": "navigate-dashboard",
  "type": "navigate",
  "params": {
    "path": "/dashboard",
    "state": {
      "from": "login"
    }
  }
}`,
  };

  const loadSample = (key: keyof typeof sampleActions) => {
    setActionConfig(sampleActions[key]);
    setExecutionSteps([]);
    setCurrentStep(0);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionSteps([]);
    setCurrentStep(0);

    try {
      const config = JSON.parse(actionConfig);
      const steps = await simulateActionExecution(config);
      setExecutionSteps(steps);

      if (executionMode === 'auto') {
        // Auto-advance through steps
        for (let i = 0; i < steps.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          setCurrentStep(i + 1);
        }
      }
    } catch (error) {
      setExecutionSteps([
        {
          id: 'error',
          name: 'Execution Error',
          status: 'error',
          timestamp: Date.now(),
          duration: 0,
          input: actionConfig,
          output: null,
          error: (error as Error).message,
        },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStepForward = () => {
    if (currentStep < executionSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setExecutionSteps([]);
  };

  const currentStepData = executionSteps[currentStep - 1];
  const totalDuration = executionSteps.reduce((sum, step) => sum + step.duration, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Action Debugger</h2>
        <p className="text-muted-foreground">
          Step-through debugging and execution trace visualization
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => loadSample('simple')}>
                Simple Action
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadSample('workflow')}>
                Workflow
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadSample('navigation')}>
                Navigation
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Mode:</Label>
              <Button
                variant={executionMode === 'auto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExecutionMode('auto')}
              >
                Auto
              </Button>
              <Button
                variant={executionMode === 'step' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExecutionMode('step')}
              >
                Step
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Action Configuration */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Action Configuration</CardTitle>
            <CardDescription>Enter action JSON to debug</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="action-config">Action JSON</Label>
              <textarea
                id="action-config"
                className="h-64 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Enter action configuration..."
                value={actionConfig}
                onChange={e => setActionConfig(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleExecute}
                disabled={isExecuting || !actionConfig}
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                Execute
              </Button>
              {executionMode === 'step' && executionSteps.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleStepForward}
                  disabled={currentStep >= executionSteps.length}
                >
                  <StepForward className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={executionSteps.length === 0}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {executionSteps.length > 0 && (
              <div className="rounded-md border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {currentStep} / {executionSteps.length}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${(currentStep / executionSteps.length) * 100}%`,
                    }}
                  />
                </div>
                {totalDuration > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">Total: {totalDuration}ms</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Execution Timeline & Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Execution Timeline</CardTitle>
              <CardDescription>Step-by-step execution trace</CardDescription>
            </CardHeader>
            <CardContent>
              {executionSteps.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                  Execute an action to see the timeline
                </div>
              ) : (
                <div className="space-y-3">
                  {executionSteps.map((step, index) => {
                    const isActive = index < currentStep;
                    const isCurrent = index === currentStep - 1;

                    return (
                      <div
                        key={step.id}
                        className={cn(
                          'relative flex items-start gap-4 rounded-md border p-3 transition-all',
                          isCurrent && 'border-primary bg-primary/5',
                          isActive && !isCurrent && 'bg-muted/50',
                          !isActive && 'opacity-40'
                        )}
                      >
                        <div className="flex-shrink-0">
                          {step.status === 'success' && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                          {step.status === 'error' && (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                          {step.status === 'pending' && (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{step.name}</p>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  step.status === 'success'
                                    ? 'default'
                                    : step.status === 'error'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                              >
                                {step.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {step.duration}ms
                              </span>
                            </div>
                          </div>
                          {step.error && (
                            <Alert variant="destructive" className="mt-2">
                              <AlertDescription className="text-xs">{step.error}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step Details */}
          {currentStepData && (
            <Card>
              <CardHeader>
                <CardTitle>Step Details</CardTitle>
                <CardDescription>Input, output, and execution details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Input */}
                <div>
                  <Label className="text-sm font-semibold">Input</Label>
                  <div className="mt-2 rounded-md border border-border bg-muted/30 p-3">
                    <pre className="overflow-x-auto text-xs">
                      <code>{JSON.stringify(currentStepData.input, null, 2)}</code>
                    </pre>
                  </div>
                </div>

                {/* Output */}
                <div>
                  <Label className="text-sm font-semibold">Output</Label>
                  <div className="mt-2 rounded-md border border-border bg-muted/30 p-3">
                    <pre className="overflow-x-auto text-xs">
                      <code>
                        {currentStepData.output
                          ? JSON.stringify(currentStepData.output, null, 2)
                          : 'No output'}
                      </code>
                    </pre>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 rounded-md border border-border bg-muted/30 p-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{currentStepData.duration}ms</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge
                      variant={
                        currentStepData.status === 'success'
                          ? 'default'
                          : currentStepData.status === 'error'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {currentStepData.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Types
interface ExecutionStep {
  id: string;
  name: string;
  status: 'pending' | 'success' | 'error';
  timestamp: number;
  duration: number;
  input: any;
  output: any;
  error?: string;
}

// Simulate action execution for demo purposes
async function simulateActionExecution(config: any): Promise<ExecutionStep[]> {
  const steps: ExecutionStep[] = [];

  if (config.type === 'workflow' && config.steps) {
    // Workflow with multiple steps
    for (const step of config.steps) {
      await new Promise(resolve => setTimeout(resolve, 200));
      steps.push({
        id: step.id,
        name: `${step.handler || step.type} - ${step.id}`,
        status: 'success',
        timestamp: Date.now(),
        duration: Math.floor(Math.random() * 100) + 50,
        input: step.params,
        output: { success: true, data: {} },
      });
    }
  } else {
    // Single action
    await new Promise(resolve => setTimeout(resolve, 200));
    steps.push({
      id: config.id,
      name: `${config.handler || config.type} - ${config.id}`,
      status: 'success',
      timestamp: Date.now(),
      duration: Math.floor(Math.random() * 100) + 50,
      input: config.params,
      output: { success: true, data: {} },
    });
  }

  return steps;
}
