import { Layout } from '@/components/layout/Layout';
import { TriageWizard } from '@/components/triage/TriageWizard';

export default function TriagePage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Let's Determine Your Path
          </h1>
          <p className="text-muted-foreground">
            Answer a few questions to get a personalized roadmap
          </p>
        </div>
        <TriageWizard />
      </div>
    </Layout>
  );
}
