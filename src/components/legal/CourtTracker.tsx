import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { Scale, Download, CheckCircle2, Circle, ExternalLink, Info } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  downloadLabel?: string;
}

const loaSteps: Step[] = [
  {
    id: '1',
    title: 'Get Consent from Family Members',
    description: 'All eligible family members must consent to your appointment as Administrator',
    completed: false,
    downloadLabel: 'Download Consent Form',
  },
  {
    id: '2',
    title: 'File Originating Summons',
    description: 'Submit the application to the Family Justice Courts',
    completed: false,
    downloadLabel: 'Download OS Template',
  },
  {
    id: '3',
    title: 'File Schedule of Assets',
    description: 'List all known assets and their estimated values',
    completed: false,
    downloadLabel: 'Download Asset Schedule',
  },
  {
    id: '4',
    title: 'Attend Court Hearing',
    description: 'Attend the scheduled hearing date (if required)',
    completed: false,
  },
  {
    id: '5',
    title: 'Receive Grant',
    description: 'Obtain the Letters of Administration from the Court',
    completed: false,
  },
];

const probateSteps: Step[] = [
  {
    id: '1',
    title: 'Verify Will Authenticity',
    description: 'Ensure the Will is valid and properly witnessed',
    completed: false,
  },
  {
    id: '2',
    title: 'File Probate Application',
    description: 'Submit the application with the original Will to the Court',
    completed: false,
    downloadLabel: 'Download Application Form',
  },
  {
    id: '3',
    title: 'Publish Citation',
    description: 'Advertise the application as required by law',
    completed: false,
  },
  {
    id: '4',
    title: 'Attend Court Hearing',
    description: 'Attend the scheduled hearing date (if required)',
    completed: false,
  },
  {
    id: '5',
    title: 'Receive Grant of Probate',
    description: 'Obtain the Grant of Probate from the Court',
    completed: false,
  },
];

export function CourtTracker() {
  const { triageResult } = useApp();
  const isProbate = triageResult.legalPath === 'probate';
  const [steps, setSteps] = useState<Step[]>(isProbate ? probateSteps : loaSteps);

  const completedCount = steps.filter((s) => s.completed).length;
  const currentStep = steps.find((s) => !s.completed) || steps[steps.length - 1];

  const handleToggle = (stepId: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const handleDownload = (step: Step) => {
    toast.success(`Downloaded: ${step.downloadLabel}`, {
      description: 'Template saved to your downloads folder',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Legal Application</h2>
        <p className="text-muted-foreground mt-1">
          {isProbate ? 'Grant of Probate' : 'Letters of Administration'} — Court Application Tracker
        </p>
      </div>

      {/* Path Badge */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Scale className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <Badge variant="outline" className="mb-1">
                {isProbate ? 'Grant of Probate Path' : 'Letters of Administration Path'}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {isProbate
                  ? 'You will be appointed as Executor under the Will'
                  : 'You will be appointed as Administrator of the estate'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">{completedCount}</p>
          <p className="text-xs text-muted-foreground">of {steps.length} steps</p>
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">Current Step</p>
          <p className="text-sm text-muted-foreground">{currentStep.title}</p>
        </div>
      </div>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Steps</CardTitle>
          <CardDescription>
            Complete each step in order to obtain your grant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border" />

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    'relative flex gap-4 p-4 rounded-lg border transition-colors',
                    step.completed && 'bg-secondary/5 border-secondary/30',
                    !step.completed && index === completedCount && 'border-primary/30 bg-primary/5'
                  )}
                >
                  {/* Step Number / Check */}
                  <div
                    className={cn(
                      'relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors',
                      step.completed
                        ? 'bg-secondary border-secondary text-secondary-foreground'
                        : index === completedCount
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-border text-muted-foreground'
                    )}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-foreground">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {step.description}
                        </p>
                      </div>
                      <Checkbox
                        checked={step.completed}
                        onCheckedChange={() => handleToggle(step.id)}
                      />
                    </div>

                    {step.downloadLabel && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 gap-2"
                        onClick={() => handleDownload(step)}
                      >
                        <Download className="h-4 w-4" />
                        {step.downloadLabel}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Helpful Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <a
              href="https://www.judiciary.gov.sg/civil/probate-matters"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Scale className="h-4 w-4" />
              <span className="flex-1 text-left">Family Justice Courts Guide</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <a
              href="https://www.mlaw.gov.sg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Info className="h-4 w-4" />
              <span className="flex-1 text-left">Ministry of Law Resources</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
