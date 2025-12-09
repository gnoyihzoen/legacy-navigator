import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/context/AppContext';
import { TriageResult, LegalPath, Relationship } from '@/types';
import { ArrowRight, ArrowLeft, CheckCircle2, FileText, Scale, Building2, Users } from 'lucide-react';

const questions = [
  {
    id: 'religion',
    title: 'Religious Status',
    question: 'Was the deceased Muslim?',
    icon: Users,
    options: [
      { value: 'yes', label: 'Yes, the deceased was Muslim' },
      { value: 'no', label: 'No, the deceased was not Muslim' },
    ],
  },
  {
    id: 'will',
    title: 'Will Status',
    question: 'Is there a valid Will?',
    icon: FileText,
    options: [
      { value: 'yes', label: 'Yes, there is a valid Will' },
      { value: 'no', label: 'No Will exists' },
      { value: 'unsure', label: 'I am not sure' },
    ],
  },
  {
    id: 'value',
    title: 'Estate Value',
    question: 'What is the estimated value of the estate?',
    icon: Building2,
    description: 'Include property, bank accounts, CPF, and investments',
    options: [
      { value: 'below50k', label: 'Below $50,000' },
      { value: 'above50k', label: '$50,000 or more' },
      { value: 'unsure', label: 'I am not sure' },
    ],
  },
  {
    id: 'relationship',
    title: 'Your Relationship',
    question: 'What is your relationship to the deceased?',
    icon: Scale,
    options: [
      { value: 'spouse', label: 'Spouse' },
      { value: 'child', label: 'Child' },
      { value: 'parent', label: 'Parent' },
      { value: 'sibling', label: 'Sibling' },
      { value: 'other', label: 'Other relative or friend' },
    ],
  },
];

function determineLegalPath(answers: Record<string, string>): LegalPath {
  if (answers.religion === 'yes') {
    return 'syariah';
  }
  if (answers.will === 'yes') {
    return 'probate';
  }
  if (answers.value === 'below50k' && answers.will !== 'yes') {
    return 'public-trustee';
  }
  return 'loa';
}

const pathDescriptions: Record<LegalPath, { title: string; description: string; color: string }> = {
  probate: {
    title: 'Grant of Probate',
    description: 'You will apply to the Family Justice Courts to be appointed as Executor under the Will.',
    color: 'bg-primary',
  },
  loa: {
    title: 'Letters of Administration',
    description: 'You will apply to the Family Justice Courts to be appointed as Administrator of the estate.',
    color: 'bg-primary',
  },
  'public-trustee': {
    title: 'Public Trustee Route',
    description: 'For estates below $50,000 without a Will, the Public Trustee can help administer the estate.',
    color: 'bg-secondary',
  },
  syariah: {
    title: 'Syariah Court Process',
    description: 'Muslim estates are administered under the Administration of Muslim Law Act through the Syariah Court.',
    color: 'bg-primary',
  },
};

export function TriageWizard() {
  const navigate = useNavigate();
  const { setTriageResult } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    const legalPath = determineLegalPath(answers);
    const result: TriageResult = {
      isMuslim: answers.religion === 'yes',
      hasWill: answers.will === 'yes',
      estateValue: answers.value as 'below50k' | 'above50k' | null,
      relationship: answers.relationship as Relationship,
      legalPath,
    };
    setTriageResult(result);
    navigate('/dashboard');
  };

  if (showResult) {
    const legalPath = determineLegalPath(answers);
    const pathInfo = pathDescriptions[legalPath!];

    return (
      <div className="animate-fade-in">
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Your Roadmap is Ready</CardTitle>
            <CardDescription className="text-base mt-2">
              Based on your answers, we've determined the legal path for estate administration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`${pathInfo.color} text-primary-foreground rounded-lg p-6`}>
              <h3 className="text-lg font-semibold mb-2">{pathInfo.title}</h3>
              <p className="text-sm opacity-90">{pathInfo.description}</p>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium text-sm mb-3">Your Answers Summary</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Religious Status:</span>
                  <span className="font-medium">{answers.religion === 'yes' ? 'Muslim' : 'Non-Muslim'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Will Status:</span>
                  <span className="font-medium">{answers.will === 'yes' ? 'Has Will' : answers.will === 'no' ? 'No Will' : 'Unsure'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Estate Value:</span>
                  <span className="font-medium">{answers.value === 'below50k' ? 'Below $50k' : answers.value === 'above50k' ? '$50k+' : 'Unsure'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Relationship:</span>
                  <span className="font-medium capitalize">{answers.relationship}</span>
                </li>
              </ul>
            </div>

            <Button onClick={handleComplete} className="w-full h-12 text-base" size="lg">
              View My Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = currentQuestion.icon;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentStep + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Icon className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{currentQuestion.title}</span>
          </div>
          <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
          {currentQuestion.description && (
            <CardDescription>{currentQuestion.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <RadioGroupItem value={option.value} id={option.value} className="border-2" />
                <Label
                  htmlFor={option.value}
                  className="flex-1 cursor-pointer text-base py-3 px-4 rounded-lg border border-transparent hover:bg-muted transition-colors"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex gap-3 pt-4">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="flex-1"
            >
              {currentStep === questions.length - 1 ? 'See My Path' : 'Continue'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
