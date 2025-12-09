import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TriageResult, Module, BankStatus, Document, LegalPath } from '@/types';

export interface AssetDocument {
  id: string;
  name: string;
  description: string;
  uploaded: boolean;
  value: number;
}

export interface DiscoveredAsset {
  id: string;
  institution: string;
  accountType: string;
  value: number;
}

interface AppState {
  triageComplete: boolean;
  triageResult: TriageResult;
  modules: Module[];
  banks: BankStatus[];
  documents: Document[];
  assetDocuments: AssetDocument[];
  bankAssets: Record<string, number>;
  discoveredAssets: DiscoveredAsset[];
}

interface AppContextType extends AppState {
  setTriageResult: (result: TriageResult) => void;
  updateModuleStatus: (moduleId: number, status: Module['status'], progress?: number) => void;
  updateBankStatus: (bankId: string, status: BankStatus['status']) => void;
  toggleBankSelection: (bankId: string) => void;
  updateDocument: (docId: string, uploaded: boolean) => void;
  updateAssetDocument: (docId: string, uploaded: boolean) => void;
  updateBankAsset: (bankId: string, bankName: string, value: number) => void;
  getTotalEstateValue: () => number;
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

const initialAssetDocuments: AssetDocument[] = [
  { id: 'bank-statement', name: 'Bank Statements', description: 'Statements from any known bank accounts', uploaded: false, value: 45000 },
  { id: 'insurance-plan', name: 'Insurance Plans', description: 'Life insurance, health insurance policies', uploaded: false, value: 150000 },
  { id: 'property-lease', name: 'Private Property Lease', description: 'Property ownership or lease documents', uploaded: false, value: 850000 },
  { id: 'vehicle-registration', name: 'Vehicle Registration', description: 'Car or motorcycle registration documents', uploaded: false, value: 35000 },
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
];

const createInitialModules = (legalPath: LegalPath): Module[] => [
  {
    id: 1,
    title: 'Core Documents',
    description: 'Gather essential legal documents',
    status: 'pending',
    progress: 0,
    total: 2,
    route: '/documents',
  },
  {
    id: 2,
    title: 'Asset Discovery',
    description: 'Identify bank accounts and assets',
    status: 'locked',
    progress: 0,
    total: 5,
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
    title: 'Closing Matters',
    description: 'Cancel accounts and subscriptions',
    status: 'pending',
    progress: 0,
    total: 12,
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
    assetDocuments: initialAssetDocuments,
    bankAssets: {},
    discoveredAssets: [],
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

  const updateAssetDocument = (docId: string, uploaded: boolean) => {
    setState((prev) => {
      const newAssetDocs = prev.assetDocuments.map((d) =>
        d.id === docId ? { ...d, uploaded } : d
      );
      
      // Create discovered asset entry for uploaded docs
      const doc = prev.assetDocuments.find(d => d.id === docId);
      let newDiscoveredAssets = [...prev.discoveredAssets];
      
      if (uploaded && doc) {
        const assetTypeMap: Record<string, string> = {
          'bank-statement': 'Bank Account',
          'insurance-plan': 'Life Insurance Policy',
          'property-lease': 'Property',
          'vehicle-registration': 'Vehicle',
        };
        const institutionMap: Record<string, string> = {
          'bank-statement': 'Various Banks',
          'insurance-plan': 'Insurance Provider',
          'property-lease': 'HDB/Private',
          'vehicle-registration': 'LTA',
        };
        
        if (!newDiscoveredAssets.find(a => a.id === docId)) {
          newDiscoveredAssets.push({
            id: docId,
            institution: institutionMap[docId] || doc.name,
            accountType: assetTypeMap[docId] || doc.name,
            value: doc.value,
          });
        }
      } else {
        newDiscoveredAssets = newDiscoveredAssets.filter(a => a.id !== docId);
      }
      
      // Check if Module 2 should be marked complete
      const uploadedCount = newAssetDocs.filter(d => d.uploaded).length;
      const bankAssetsCount = Object.keys(prev.bankAssets).length;
      const hasAssets = uploadedCount > 0 || bankAssetsCount > 0;
      
      const newModules = prev.modules.map((m) => {
        if (m.id === 2) {
          return { 
            ...m, 
            progress: uploadedCount + bankAssetsCount, 
            status: hasAssets ? 'completed' as const : 'in-progress' as const 
          };
        }
        if (m.id === 3 && hasAssets) {
          return { ...m, status: 'pending' as const };
        }
        return m;
      });
      
      return { ...prev, assetDocuments: newAssetDocs, discoveredAssets: newDiscoveredAssets, modules: newModules };
    });
  };

  const updateBankAsset = (bankId: string, bankName: string, value: number) => {
    setState((prev) => {
      const newBankAssets = { ...prev.bankAssets, [bankId]: value };
      
      // Add to discovered assets
      let newDiscoveredAssets = prev.discoveredAssets.filter(a => a.id !== `bank-${bankId}`);
      newDiscoveredAssets.push({
        id: `bank-${bankId}`,
        institution: bankName,
        accountType: 'Bank Account',
        value: value,
      });
      
      // Check if Module 2 should be marked complete
      const uploadedCount = prev.assetDocuments.filter(d => d.uploaded).length;
      const bankAssetsCount = Object.keys(newBankAssets).length;
      const hasAssets = uploadedCount > 0 || bankAssetsCount > 0;
      
      const newModules = prev.modules.map((m) => {
        if (m.id === 2) {
          return { 
            ...m, 
            progress: uploadedCount + bankAssetsCount, 
            status: hasAssets ? 'completed' as const : 'in-progress' as const 
          };
        }
        if (m.id === 3 && hasAssets) {
          return { ...m, status: 'pending' as const };
        }
        return m;
      });
      
      return { ...prev, bankAssets: newBankAssets, discoveredAssets: newDiscoveredAssets, modules: newModules };
    });
  };

  const getTotalEstateValue = () => {
    const docValue = state.assetDocuments
      .filter(d => d.uploaded)
      .reduce((sum, d) => sum + d.value, 0);
    const bankValue = Object.values(state.bankAssets).reduce((sum, v) => sum + v, 0);
    return docValue + bankValue;
  };

  const resetApp = () => {
    setState({
      triageComplete: false,
      triageResult: initialTriageResult,
      modules: createInitialModules(null),
      banks: initialBanks,
      documents: initialDocuments,
      assetDocuments: initialAssetDocuments,
      bankAssets: {},
      discoveredAssets: [],
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
        updateAssetDocument,
        updateBankAsset,
        getTotalEstateValue,
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
