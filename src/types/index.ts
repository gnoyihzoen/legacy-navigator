export type LegalPath = 'probate' | 'loa' | 'public-trustee' | 'syariah' | null;

export type Relationship = 'spouse' | 'child' | 'parent' | 'sibling' | 'other' | null;

export interface TriageResult {
  isMuslim: boolean | null;
  hasWill: boolean | null;
  estateValue: 'below50k' | 'above50k' | null;
  relationship: Relationship;
  legalPath: LegalPath;
}

export interface Module {
  id: number;
  title: string;
  description: string;
  status: 'locked' | 'pending' | 'in-progress' | 'completed';
  progress: number;
  total: number;
  route: string;
}

export interface BankStatus {
  id: string;
  name: string;
  selected: boolean;
  status: 'not-started' | 'letter-generated' | 'sent' | 'reply-found' | 'reply-not-found';
}

export interface Document {
  id: string;
  name: string;
  description: string;
  required: boolean;
  uploaded: boolean;
  conditional?: {
    field: keyof TriageResult;
    value: string | boolean;
  };
}

export interface CourtStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  downloadUrl?: string;
}

export interface ClosingItem {
  id: string;
  category: string;
  name: string;
  description: string;
  link?: string;
  completed: boolean;
}
