import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Module } from '@/types';
import { Lock, CheckCircle2, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  module: Module;
  index: number;
}

const statusConfig = {
  locked: {
    icon: Lock,
    label: 'Locked',
    color: 'bg-muted text-muted-foreground',
    badgeVariant: 'secondary' as const,
  },
  pending: {
    icon: Clock,
    label: 'Ready to Start',
    color: 'bg-warning/10 text-warning',
    badgeVariant: 'outline' as const,
  },
  'in-progress': {
    icon: AlertCircle,
    label: 'In Progress',
    color: 'bg-primary/10 text-primary',
    badgeVariant: 'default' as const,
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'bg-secondary/10 text-secondary',
    badgeVariant: 'secondary' as const,
  },
};

export function ModuleCard({ module, index }: ModuleCardProps) {
  const navigate = useNavigate();
  const config = statusConfig[module.status];
  const Icon = config.icon;
  const isClickable = module.status !== 'locked';
  const progressPercent = (module.progress / module.total) * 100;

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        isClickable && 'cursor-pointer hover:shadow-md hover:border-primary/30',
        module.status === 'locked' && 'opacity-60'
      )}
      onClick={() => isClickable && navigate(module.route)}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-border">
        {module.status === 'completed' && (
          <div className="absolute inset-0 bg-secondary" />
        )}
        {module.status === 'in-progress' && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-300"
            style={{ height: `${progressPercent}%` }}
          />
        )}
        {module.status === 'pending' && (
          <div className="absolute inset-0 bg-warning" />
        )}
      </div>

      <CardContent className="p-4 pl-5">
        <div className="flex items-start gap-4">
          <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', config.color)}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground">
                  Module {module.id}: {module.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">{module.description}</p>
              </div>
              {isClickable && (
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>

            <div className="mt-3 flex items-center gap-3">
              {module.status !== 'locked' && (
                <>
                  <Progress value={progressPercent} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {module.progress}/{module.total}
                  </span>
                </>
              )}
              <Badge variant={config.badgeVariant} className="text-xs">
                {config.label}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
