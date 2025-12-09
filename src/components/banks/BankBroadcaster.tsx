import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { BankStatus } from '@/types';
import { 
  Building2, Download, Mail, CheckCircle2, Clock, AlertCircle, XCircle, Info, 
  Upload, FileText, Home, Car, Shield, DollarSign 
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusOptions = [
  { value: 'not-started', label: 'Not Started', icon: Clock, color: 'text-muted-foreground' },
  { value: 'letter-generated', label: 'Letter Generated', icon: Download, color: 'text-primary' },
  { value: 'sent', label: 'Sent to Bank', icon: Mail, color: 'text-warning' },
  { value: 'reply-found', label: 'Account Found', icon: CheckCircle2, color: 'text-secondary' },
  { value: 'reply-not-found', label: 'No Account', icon: XCircle, color: 'text-muted-foreground' },
];

interface AssetDocument {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
  uploaded: boolean;
  value: number;
}

const initialAssetDocuments: AssetDocument[] = [
  { 
    id: 'bank-statement', 
    name: 'Bank Statements', 
    description: 'Statements from any known bank accounts',
    icon: FileText,
    uploaded: false,
    value: 45000,
  },
  { 
    id: 'insurance-plan', 
    name: 'Insurance Plans', 
    description: 'Life insurance, health insurance policies',
    icon: Shield,
    uploaded: false,
    value: 150000,
  },
  { 
    id: 'property-lease', 
    name: 'Private Property Lease', 
    description: 'Property ownership or lease documents',
    icon: Home,
    uploaded: false,
    value: 850000,
  },
  { 
    id: 'vehicle-registration', 
    name: 'Vehicle Registration', 
    description: 'Car or motorcycle registration documents',
    icon: Car,
    uploaded: false,
    value: 35000,
  },
];

function BankRow({ bank, onToggle, onStatusChange }: { 
  bank: BankStatus; 
  onToggle: () => void; 
  onStatusChange: (status: BankStatus['status']) => void;
}) {
  const statusConfig = statusOptions.find((s) => s.value === bank.status)!;
  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-lg border transition-colors',
      bank.selected ? 'bg-card border-border' : 'bg-muted/30 border-transparent'
    )}>
      <Checkbox
        checked={bank.selected}
        onCheckedChange={onToggle}
        id={bank.id}
      />
      <label
        htmlFor={bank.id}
        className="flex-1 font-medium text-foreground cursor-pointer"
      >
        {bank.name}
      </label>
      
      <div className="flex items-center gap-2">
        <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
        <Select
          value={bank.status}
          onValueChange={(value) => onStatusChange(value as BankStatus['status'])}
        >
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function AssetDocumentRow({ doc, onUpload }: { 
  doc: AssetDocument; 
  onUpload: () => void;
}) {
  const Icon = doc.icon;

  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-lg border transition-colors',
      doc.uploaded ? 'bg-secondary/10 border-secondary/30' : 'bg-card border-border'
    )}>
      <div className={cn(
        'p-2 rounded-lg',
        doc.uploaded ? 'bg-secondary/20' : 'bg-muted'
      )}>
        <Icon className={cn('h-5 w-5', doc.uploaded ? 'text-secondary' : 'text-muted-foreground')} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{doc.name}</p>
        <p className="text-sm text-muted-foreground">{doc.description}</p>
      </div>
      {doc.uploaded ? (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-secondary/20 text-secondary">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Uploaded
          </Badge>
          <span className="text-sm font-medium text-foreground">
            ${doc.value.toLocaleString()}
          </span>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={onUpload}>
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      )}
    </div>
  );
}

export function BankBroadcaster() {
  const { banks, toggleBankSelection, updateBankStatus } = useApp();
  const [generating, setGenerating] = useState(false);
  const [assetDocs, setAssetDocs] = useState<AssetDocument[]>(initialAssetDocuments);

  const selectedBanks = banks.filter((b) => b.selected);
  const banksWithAccounts = banks.filter((b) => b.status === 'reply-found');
  
  const uploadedDocs = assetDocs.filter((d) => d.uploaded);
  const totalEstateValue = uploadedDocs.reduce((sum, doc) => sum + doc.value, 0);

  const handleGenerateLetters = async () => {
    if (selectedBanks.length === 0) {
      toast.error('Please select at least one bank');
      return;
    }

    setGenerating(true);
    
    // Simulate letter generation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    selectedBanks.forEach((bank) => {
      if (bank.status === 'not-started') {
        updateBankStatus(bank.id, 'letter-generated');
      }
    });

    setGenerating(false);
    toast.success(`Generated letters for ${selectedBanks.length} banks`, {
      description: 'Download buttons are now available below',
    });
  };

  const handleDownloadLetter = (bank: BankStatus) => {
    toast.success(`Downloaded letter for ${bank.name}`, {
      description: 'Template saved to your downloads folder',
    });
  };

  const handleSelectAll = () => {
    banks.forEach((bank) => {
      if (!bank.selected) {
        toggleBankSelection(bank.id);
      }
    });
  };

  const handleUploadAssetDoc = (docId: string) => {
    setAssetDocs((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, uploaded: true } : doc
      )
    );
    const doc = assetDocs.find((d) => d.id === docId);
    toast.success(`${doc?.name} uploaded successfully`, {
      description: `Estimated value: $${doc?.value.toLocaleString()}`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Asset Discovery</h2>
        <p className="text-muted-foreground mt-1">
          Identify and document assets belonging to the deceased
        </p>
      </div>

      {/* Total Estate Value Summary */}
      {uploadedDocs.length > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Documented Estate Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${totalEstateValue.toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-primary border-primary">
                {uploadedDocs.length} document{uploadedDocs.length > 1 ? 's' : ''} uploaded
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Known Assets Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents You Already Have
              </CardTitle>
              <CardDescription className="mt-1">
                Upload any existing documents for assets you've already identified
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {uploadedDocs.length}/{assetDocs.length} Uploaded
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {assetDocs.map((doc) => (
            <AssetDocumentRow
              key={doc.id}
              doc={doc}
              onUpload={() => handleUploadAssetDoc(doc.id)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Card className="bg-accent/50 border-accent">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-accent-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-accent-foreground">Discover Unknown Accounts</p>
              <p className="text-muted-foreground mt-1">
                We'll generate inquiry letters for each bank you select. Send these letters to each bank's 
                estate management department. Once the bank replies, update the status here to track your progress.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Financial Institution Outreach
              </CardTitle>
              <CardDescription className="mt-1">
                Select banks to generate enquiry letters
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Select All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {banks.map((bank) => (
            <BankRow
              key={bank.id}
              bank={bank}
              onToggle={() => toggleBankSelection(bank.id)}
              onStatusChange={(status) => updateBankStatus(bank.id, status)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleGenerateLetters}
          disabled={selectedBanks.length === 0 || generating}
          className="flex-1"
          size="lg"
        >
          {generating ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Generate Enquiry Letters ({selectedBanks.length})
            </>
          )}
        </Button>
      </div>

      {/* Generated Letters */}
      {banks.some((b) => b.status !== 'not-started') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Download Letters</CardTitle>
            <CardDescription>
              Print or email these letters to each bank's estate department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {banks
                .filter((b) => b.status !== 'not-started')
                .map((bank) => (
                  <Button
                    key={bank.id}
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => handleDownloadLetter(bank)}
                  >
                    <Download className="mr-2 h-4 w-4 text-primary" />
                    <span className="flex-1 text-left">{bank.name}</span>
                    <Badge
                      variant={bank.status === 'reply-found' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {statusOptions.find((s) => s.value === bank.status)?.label}
                    </Badge>
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {banksWithAccounts.length > 0 && (
        <Card className="border-secondary bg-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
              <div>
                <p className="font-medium">
                  {banksWithAccounts.length} bank{banksWithAccounts.length > 1 ? 's' : ''} confirmed accounts found
                </p>
                <p className="text-sm text-muted-foreground">
                  {banksWithAccounts.map((b) => b.name).join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        Once the bank replies, the interaction moves offline between you and the bank.
        This tool only helps you track the discovery process.
      </p>
    </div>
  );
}
