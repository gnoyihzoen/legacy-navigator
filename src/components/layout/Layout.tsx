import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="border-t border-border mt-auto py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            A civic technology initiative. Not a legal service.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            For legal advice, please consult a qualified lawyer or the{' '}
            <a href="https://www.mlaw.gov.sg" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              Ministry of Law
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
