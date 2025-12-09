import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TriageResult, Module, BankStatus, Document, LegalPath } from '@/types';

interface AppState {
  triageComplete: boolean;
  triageResult: TriageResult;
  modules: Module[];
  banks: BankStatus[];
  documents: Document[];
}

interface AppContextType extends AppState {
  setTriageResult: (result: TriageResult) => void;
  updateModuleStatus: (moduleId: number, status: Module['status'], progress?: number) => void;
  updateBankStatus: (bankId: string, status: BankStatus['status']) => void;
  toggleBankSelection: (bankId: string) => void;
  updateDocument: (docId: string, uploaded: boolean) => void;
  resetApp: () => void;
}

const initialBanks: BankStatus[] = [
  { id: 'dbs', name: 'DBS Bank', selected: true, status: 'not-started' },
  { id: 'posb', name: 'POSB', selected: true, status: 'not-started' },
  { id: 'ocbc', name: 'OCBC Bank', selected: true, status: 'not-started' },
  { id: 'uob', name: 'UOB', selected: true, status: 'not-started' },
  { id: 'sc', name: 'Standard Chartered', selected: true, status: 'not-started' },
  { id: 'maybank', name: 'Maybank', selected: true, status: 'not-started' },
  { id: 'hsbc', name: 'HSBC', selected: false, status: 'not-started' },
  { id: 'citibank', name: 'Citibank', selected: false, status: 'not-started' },
];

const initialDocuments: Document[] = [
  {
    id: 'death-cert',
    name: 'Digital Death Certificate',
    description: 'Obtain from MyLegacy portal or Registry of Births and Deaths',
    required: true,
    uploaded: false,
  },
  {
    id: 'deceased-nric',
    name: 'Deceased NRIC',
    description: 'Front and back copy of the deceased\'s identity card',
    required: true,
    uploaded: false,
  },
  {
    id: 'marriage-cert',
    name: 'Marriage Certificate',
    description: 'Required if you are the spouse of the deceased',
    required: true,
    uploaded: false,
    conditional: { field: 'relationship', value: 'spouse' },
  },
  {
    id: 'applicant-nric',
    name: 'Your NRIC',
    description: 'Front and back copy of your identity card',
    required: true,
    uploaded: false,
  },
];

const createInitialModules = (legalPath: LegalPath): Module[] => [
  {
    id: 1,
    title: 'Core Documents',
    description: 'Gather essential legal documents',
    status: 'pending',
    progress: 0,
    total: 4,
    route: '/documents',
  },
  {
    id: 2,
    title: 'Asset Discovery',
    description: 'Identify bank accounts and assets',
    status: 'locked',
    progress: 0,
    total: 6,
    route: '/assets',
  },
  {
    id: 3,
    title: 'Legal Application',
    description: legalPath === 'probate' ? 'Grant of Probate' : legalPath === 'loa' ? 'Letters of Administration' : 'Public Trustee Application',
    status: 'locked',
    progress: 0,
    total: 3,
    route: '/legal',
  },
  {
    id: 4,
    title: 'Execution',
    description: 'Distribute assets according to law',
    status: 'locked',
    progress: 0,
    total: 4,
    route: '/execution',
  },
  {
    id: 5,
    title: 'Tax & CPF',
    description: 'Handle tax clearance and CPF nomination',
    status: 'locked',
    progress: 0,
    total: 2,
    route: '/tax',
  },
  {
    id: 6,
    title: 'Closing Matters',
    description: 'Cancel accounts and subscriptions',
    status: 'pending',
    progress: 0,
    total: 8,
    route: '/closing',
  },
];

const initialTriageResult: TriageResult = {
  isMuslim: null,
  hasWill: null,
  estateValue: null,
  relationship: null,
  legalPath: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    triageComplete: false,
    triageResult: initialTriageResult,
    modules: createInitialModules(null),
    banks: initialBanks,
    documents: initialDocuments,
  });

  const setTriageResult = (result: TriageResult) => {
    setState((prev) => ({
      ...prev,
      triageComplete: true,
      triageResult: result,
      modules: createInitialModules(result.legalPath),
    }));
  };

  const updateModuleStatus = (moduleId: number, status: Module['status'], progress?: number) => {
    setState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? { ...m, status, progress: progress ?? m.progress }
          : m
      ),
    }));
  };

  const updateBankStatus = (bankId: string, status: BankStatus['status']) => {
    setState((prev) => ({
      ...prev,
      banks: prev.banks.map((b) =>
        b.id === bankId ? { ...b, status } : b
      ),
    }));
  };

  const toggleBankSelection = (bankId: string) => {
    setState((prev) => ({
      ...prev,
      banks: prev.banks.map((b) =>
        b.id === bankId ? { ...b, selected: !b.selected } : b
      ),
    }));
  };

  const updateDocument = (docId: string, uploaded: boolean) => {
    setState((prev) => {
      const newDocs = prev.documents.map((d) =>
        d.id === docId ? { ...d, uploaded } : d
      );
      const uploadedCount = newDocs.filter((d) => d.uploaded).length;
      const newModules = prev.modules.map((m) =>
        m.id === 1
          ? { ...m, progress: uploadedCount, status: uploadedCount === m.total ? 'completed' : 'in-progress' as Module['status'] }
          : m.id === 2 && uploadedCount === newDocs.length
            ? { ...m, status: 'pending' as Module['status'] }
            : m
      );
      return { ...prev, documents: newDocs, modules: newModules };
    });
  };

  const resetApp = () => {
    setState({
      triageComplete: false,
      triageResult: initialTriageResult,
      modules: createInitialModules(null),
      banks: initialBanks,
      documents: initialDocuments,
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        setTriageResult,
        updateModuleStatus,
        updateBankStatus,
        toggleBankSelection,
        updateDocument,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
