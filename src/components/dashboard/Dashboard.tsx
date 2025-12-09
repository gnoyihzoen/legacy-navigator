import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/context/AppContext';
import { ModuleCard } from './ModuleCard';
import { FileText, Scale, Building2, Heart } from 'lucide-react';

const pathIcons = {
  probate: FileText,
  loa: Scale,
  'public-trustee': Building2,
  syariah: Scale,
};

const pathLabels = {
  probate: 'Grant of Probate',
  loa: 'Letters of Administration',
  'public-trustee': 'Public Trustee',
  syariah: 'Syariah Court',
};

export function Dashboard() {
  const { modules, triageResult } = useApp();

  const completedModules = modules.filter((m) => m.status === 'completed').length;
  const totalProgress = (completedModules / modules.length) * 100;
  const PathIcon = triageResult.legalPath ? pathIcons[triageResult.legalPath] : FileText;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Heart className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            We're here to guide you
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            This process takes time. Work through each module at your own pace. You can always come back later.
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Your Estate Roadmap</CardTitle>
              <CardDescription className="mt-1">
                Track your progress through the administration process
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1.5 py-1.5">
              <PathIcon className="h-3.5 w-3.5" />
              {triageResult.legalPath && pathLabels[triageResult.legalPath]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={totalProgress} className="h-3 flex-1" />
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {completedModules} of {modules.length} modules
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Module Timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground px-1">Modules</h3>
        <div className="space-y-3">
          {modules.map((module, index) => (
            <ModuleCard key={module.id} module={module} index={index} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-accent/50 border-accent">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">Need Help?</h4>
              <p className="text-xs text-muted-foreground">
                Visit a Community Development Council or call 1800-222-0000
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
