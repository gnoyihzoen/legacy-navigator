import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, HelpCircle, Phone } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/triage';

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isHome && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AL</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground leading-tight">SGEase</h1>
              <p className="text-xs text-muted-foreground">Estate Navigator</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">1800-HELP</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
