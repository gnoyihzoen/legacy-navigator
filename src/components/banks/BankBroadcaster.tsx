import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { BankStatus } from '@/types';
import { 
  Building2, Download, CheckCircle2, Clock, XCircle, Info, 
  Upload, FileText, Home, Car, Shield, DollarSign, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import axios from 'axios'; // IMPORT AXIOS
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock data: DBS returns $12,500, others return $5,000
const BANK_ASSETS_MOCK: Record<string, number> = {
  'dbs': 12500,
};

const iconMap: Record<string, typeof FileText> = {
  'bank-statement': FileText,
  'insurance-plan': Shield,
  'property-lease': Home,
  'vehicle-registration': Car,
};

function AssetDocumentRow({ doc, onUpload }: { 
  doc: { id: string; name: string; description: string; uploaded: boolean; value: number }; 
  onUpload: () => void;
}) {
  const Icon = iconMap[doc.id] || FileText;

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

const WORKATO_WEBHOOK_URL = "https://webhooks.workato.com/webhooks/rest/0ed6e747-1a90-4d0a-8f7d-861bcad7a6ee/blast_request";

export function BankBroadcaster() {
  const { banks, toggleBankSelection, updateBankStatus, assetDocuments, bankAssets, updateAssetDocument, updateBankAsset, getTotalEstateValue } = useApp();
  const [generating, setGenerating] = useState(false);
  const [scanningBankId, setScanningBankId] = useState<string | null>(null);

  const selectedBanks = banks.filter((b) => b.selected);
  
  // Track which banks user marked as "assets-found" (pending upload)
  const [pendingUpload, setPendingUpload] = useState<Record<string, boolean>>({});
  
  const uploadedDocs = assetDocuments.filter((d) => d.uploaded);
  const docEstateValue = uploadedDocs.reduce((sum, doc) => sum + doc.value, 0);
  const bankEstateValue = Object.values(bankAssets).reduce((sum, val) => sum + val, 0);
  const totalEstateValue = getTotalEstateValue();

  const handleGenerateLetters = async () => {
    if (selectedBanks.length === 0) {
      toast.error('Please select at least one bank');
      return;
    }

    setGenerating(true);
    
    // 1. Prepare Payload for Workato
    // 1. Prepare Payload for Workato
    const payload = {
        applicant_name: "Tan Xiao Ming",
        deceased_name: "Tan Ah Kow",
        deceased_nric: "S1234567A",
        selected_banks: selectedBanks.map(b => b.name),
        
        // The fixed URLs for the showcase
        document_urls: [
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", 
            "https://pdfobject.com/pdf/sample.pdf",                                    
            "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf"          
        ],

        // The specific names for those documents (in the same order)
        document_names: [
            "Death Certificate",
            "Birth Certificate",
            "NRIC"
        ]
    };

    try {
        // 2. Send to Workato
        // We use a try-catch because Workato might return CORS errors in localhost
        // but the webhook usually still fires successfully.
        await axios.post(WORKATO_WEBHOOK_URL, payload);
        
        toast.success(`Enquiry blast sent to ${selectedBanks.length} institutions via Workato.`);

    } catch (error) {
        console.error("Workato Error:", error);
        // Fallback for demo if API fails
        toast.success(`Letters generated (Demo Mode - API bypassed)`);
    }
    
    // 3. Update UI State (Keep existing logic)
    selectedBanks.forEach((bank) => {
      if (bank.status === 'not-started') {
        updateBankStatus(bank.id, 'letter-generated');
      }
    });

    setGenerating(false);
  };

  const handleDownloadLetter = (bank: BankStatus) => {
    // Also update status to letter-generated if not already
    if (bank.status === 'not-started') {
      updateBankStatus(bank.id, 'letter-generated');
    }
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

  const handleResponseStatusChange = (bank: BankStatus, value: string) => {
    if (value === 'no-assets') {
      updateBankStatus(bank.id, 'reply-not-found');
      setPendingUpload((prev) => ({ ...prev, [bank.id]: false }));
      toast.info(`Marked ${bank.name} as no assets found`);
    } else if (value === 'assets-found') {
      setPendingUpload((prev) => ({ ...prev, [bank.id]: true }));
      toast.info(`Please upload the bank reply for ${bank.name}`);
    }
  };

  const handleUploadReply = async (bank: BankStatus) => {
    setScanningBankId(bank.id);
    
    // Simulate OCR/AI scanning for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Check mock data - DBS has assets ($12,500), others default to $5,000
    const assetValue = BANK_ASSETS_MOCK[bank.id] || 5000;
    
    updateBankStatus(bank.id, 'reply-found');
    updateBankAsset(bank.id, bank.name, assetValue);
    setPendingUpload((prev) => ({ ...prev, [bank.id]: false }));
    toast.success(`Document scanned for ${bank.name}!`, {
      description: `Detected balance: $${assetValue.toLocaleString()}`,
    });
    
    setScanningBankId(null);
  };

  const handleUploadAssetDoc = (docId: string) => {
    updateAssetDocument(docId, true);
    const doc = assetDocuments.find((d) => d.id === docId);
    toast.success(`${doc?.name} uploaded successfully`, {
      description: `Estimated value: $${doc?.value.toLocaleString()}`,
    });
  };

  const getResponseStatusCell = (bank: BankStatus) => {
    // If finalized (uploaded or no assets), show badge
    if (bank.status === 'reply-found') {
      return (
        <Badge className="bg-secondary text-secondary-foreground">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Assets: ${(bankAssets[bank.id] || 0).toLocaleString()}
        </Badge>
      );
    }
    
    if (bank.status === 'reply-not-found') {
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          <XCircle className="h-3 w-3 mr-1" />
          No Assets
        </Badge>
      );
    }
    
    // If letter generated, show dropdown
    if (bank.status === 'letter-generated' || bank.status === 'sent') {
      return (
        <Select onValueChange={(value) => handleResponseStatusChange(bank, value)}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="assets-found">Assets Found</SelectItem>
            <SelectItem value="no-assets">No Assets</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    // Not started
    return <span className="text-sm text-muted-foreground">—</span>;
  };

  const getActionCell = (bank: BankStatus) => {
    if (scanningBankId === bank.id) {
      return (
        <div className="flex items-center justify-center gap-2 text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Scanning...</span>
        </div>
      );
    }
    
    if (pendingUpload[bank.id]) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUploadReply(bank)}
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload Reply
        </Button>
      );
    }
    
    if (bank.status === 'reply-found' || bank.status === 'reply-not-found') {
      return <CheckCircle2 className="h-4 w-4 text-muted-foreground mx-auto" />;
    }
    
    return <span className="text-sm text-muted-foreground">—</span>;
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
      {(uploadedDocs.length > 0 || bankEstateValue > 0) && (
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
              <div className="flex flex-col gap-1 items-end text-sm text-muted-foreground">
                {docEstateValue > 0 && (
                  <span>Documents: ${docEstateValue.toLocaleString()}</span>
                )}
                {bankEstateValue > 0 && (
                  <span>Bank Accounts: ${bankEstateValue.toLocaleString()}</span>
                )}
              </div>
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
              {uploadedDocs.length}/{assetDocuments.length} Uploaded
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {assetDocuments.map((doc) => (
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
              <p className="font-medium text-accent-foreground">Privacy-First Offline Loop</p>
              <p className="text-muted-foreground mt-1">
                Banks will reply via email or mail offline. Once you receive a reply, upload it here 
                and our system will scan the document to extract asset information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Broadcaster Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Financial Institution Outreach
              </CardTitle>
              <CardDescription className="mt-1">
                Generate enquiry letters and manage bank responses
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button
                onClick={handleGenerateLetters}
                disabled={selectedBanks.length === 0 || generating}
                size="sm"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate Letters and Send ({selectedBanks.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead className="text-center">Outreach</TableHead>
                  <TableHead className="text-center">Response Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banks.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell>
                      <Checkbox
                        checked={bank.selected}
                        onCheckedChange={() => toggleBankSelection(bank.id)}
                        id={bank.id}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{bank.name}</TableCell>
                    <TableCell className="text-center">
                      {bank.status === 'not-started' ? (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadLetter(bank)}
                          className="text-primary"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {getResponseStatusCell(bank)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getActionCell(bank)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        Once the bank replies, the interaction moves offline between you and the bank.
        This tool helps you track discovery and aggregate estate value.
      </p>
    </div>
  );
}
