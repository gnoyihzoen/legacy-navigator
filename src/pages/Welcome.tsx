import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useApp } from '@/context/AppContext';
import { ArrowRight, Heart, Shield, Clock, FileText } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();
  const { triageComplete } = useApp();

  const handleStart = () => {
    if (triageComplete) {
      navigate('/dashboard');
    } else {
      navigate('/triage');
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        {/* Hero */}
        <div className="text-center pt-8 pb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-6">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            SGEase
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            A step-by-step guide to help you navigate estate administration in Singapore
          </p>
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStart}
          size="lg"
          className="w-full h-14 text-lg"
        >
          {triageComplete ? 'Continue to Dashboard' : 'Get Started'}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        {/* Features */}
        <div className="grid gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Personalized Roadmap</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Answer a few questions to get a tailored plan for your specific situation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Track Progress</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Keep track of documents, bank enquiries, and court applications
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your data is encrypted and only used for your estate administration
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            This is a free public utility tool. It does not provide legal advice.
            For legal matters, please consult a qualified lawyer.
          </p>
        </div>
      </div>
    </Layout>
  );
}
