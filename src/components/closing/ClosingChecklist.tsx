import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Phone, 
  Tv, 
  Users, 
  ExternalLink, 
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClosingItem {
  id: string;
  name: string;
  description: string;
  link?: string;
  completed: boolean;
}

interface Category {
  id: string;
  title: string;
  icon: React.ElementType;
  items: ClosingItem[];
}

const initialCategories: Category[] = [
  {
    id: 'utilities',
    title: 'Utilities',
    icon: Zap,
    items: [
      {
        id: 'sp-group',
        name: 'SP Group (Electricity & Gas)',
        description: 'Close or transfer the utilities account',
        link: 'https://www.spgroup.com.sg',
        completed: false,
      },
      {
        id: 'pub',
        name: 'PUB (Water)',
        description: 'Close or transfer the water account',
        link: 'https://www.pub.gov.sg',
        completed: false,
      },
    ],
  },
  {
    id: 'telco',
    title: 'Telecommunications',
    icon: Phone,
    items: [
      {
        id: 'singtel',
        name: 'Singtel',
        description: 'Cancel mobile, broadband, and TV services',
        link: 'https://www.singtel.com',
        completed: false,
      },
      {
        id: 'starhub',
        name: 'StarHub',
        description: 'Cancel mobile, broadband, and TV services',
        link: 'https://www.starhub.com',
        completed: false,
      },
      {
        id: 'm1',
        name: 'M1',
        description: 'Cancel mobile and broadband services',
        link: 'https://www.m1.com.sg',
        completed: false,
      },
    ],
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions',
    icon: Tv,
    items: [
      {
        id: 'netflix',
        name: 'Netflix',
        description: 'Cancel subscription through account settings',
        link: 'https://www.netflix.com/cancelplan',
        completed: false,
      },
      {
        id: 'spotify',
        name: 'Spotify',
        description: 'Cancel subscription through account page',
        link: 'https://www.spotify.com/account',
        completed: false,
      },
      {
        id: 'disney',
        name: 'Disney+',
        description: 'Cancel subscription through account settings',
        link: 'https://www.disneyplus.com',
        completed: false,
      },
    ],
  },
  {
    id: 'social',
    title: 'Social Media & Digital',
    icon: Users,
    items: [
      {
        id: 'facebook',
        name: 'Facebook / Meta',
        description: 'Memorialize or remove account using legacy contact',
        link: 'https://www.facebook.com/help/contact/305593649477238',
        completed: false,
      },
      {
        id: 'instagram',
        name: 'Instagram',
        description: 'Request memorialization or account removal',
        link: 'https://help.instagram.com/264154560391256',
        completed: false,
      },
      {
        id: 'google',
        name: 'Google Account',
        description: 'Use Inactive Account Manager or request removal',
        link: 'https://support.google.com/accounts/troubleshooter/6357590',
        completed: false,
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        description: 'Request account closure through support',
        link: 'https://www.linkedin.com/help/linkedin/answer/2842',
        completed: false,
      },
    ],
  },
];

export function ClosingChecklist() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const toggleItem = (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            }
          : cat
      )
    );
  };

  const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedItems = categories.reduce(
    (acc, cat) => acc + cat.items.filter((i) => i.completed).length,
    0
  );
  const progress = (completedItems / totalItems) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Closing Matters</h2>
        <p className="text-muted-foreground mt-1">
          Cancel accounts and manage the deceased's digital presence
        </p>
      </div>

      {/* Warning Banner */}
      <Card className="bg-warning/10 border-warning/30">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Before you proceed</p>
              <p className="text-muted-foreground mt-1">
                Some services require proof of death or administrator appointment before cancellation.
                Have your documents ready when contacting these services.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Closure Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedItems} of {totalItems} items
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Categories */}
      <Accordion type="multiple" defaultValue={['utilities', 'telco']} className="space-y-3">
        {categories.map((category) => {
          const categoryCompleted = category.items.filter((i) => i.completed).length;
          const Icon = category.icon;

          return (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="border rounded-lg bg-card overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                    <Icon className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <span className="font-medium">{category.title}</span>
                  <Badge variant="secondary" className="ml-2">
                    {categoryCompleted}/{category.items.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2 pt-2">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                        item.completed && 'bg-secondary/5 border-secondary/30'
                      )}
                    >
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(category.id, item.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={cn(
                            'font-medium text-sm',
                            item.completed && 'line-through text-muted-foreground'
                          )}>
                            {item.name}
                          </h4>
                          {item.completed && (
                            <CheckCircle2 className="h-4 w-4 text-secondary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      {item.link && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={item.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Digital Legacy Tip</p>
              <p className="text-muted-foreground mt-1">
                Consider downloading photos and important data from social media accounts before
                requesting account closure. Some platforms allow data export.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
