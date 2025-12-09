import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { 
  Scale, FileText, Download, CheckCircle2, Clock, 
  Loader2, Upload, MapPin, Printer, AlertCircle,
  Building2, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CourtDocument {
  id: string;
  name: string;
  description: string;
  status: 'drafting' | 'ready' | 'downloaded';
}

export function LegalGenerator() {
  const { triageResult, modules, discoveredAssets, getTotalEstateValue, updateModuleStatus } = useApp();
  const isProbate = triageResult.legalPath === 'probate';
  const isModule2Complete = modules.find(m => m.id === 2)?.status === 'completed';
  const totalEstateValue = getTotalEstateValue();
  
  const [generating, setGenerating] = useState(false);
  const [bundleReady, setBundleReady] = useState(false);
  const [documents, setDocuments] = useState<CourtDocument[]>(
    isProbate
      ? [
          { id: 'probate-app', name: 'Probate Application Form', description: 'Main application for Grant of Probate', status: 'drafting' },
          { id: 'will-copy', name: 'Certified Will Copy', description: 'Verified copy of the original Will', status: 'drafting' },
          { id: 'schedule-assets', name: 'Schedule of Assets', description: 'Complete list of estate assets and values', status: 'drafting' },
          { id: 'death-cert', name: 'Death Certificate', description: 'Official death certificate copy', status: 'drafting' },
        ]
      : [
          { id: 'orig-summons', name: 'Originating Summons', description: 'Application to be appointed Administrator', status: 'drafting' },
          { id: 'renunciation', name: 'Renunciation Forms', description: 'Consent from other eligible family members', status: 'drafting' },
          { id: 'schedule-assets', name: 'Schedule of Assets', description: 'Complete list of estate assets and values', status: 'drafting' },
          { id: 'affidavit', name: 'Supporting Affidavit', description: 'Sworn statement of facts', status: 'drafting' },
        ]
  );

  const handleGenerateBundle = async () => {
    setGenerating(true);
    
    // Simulate compilation
    await new Promise((resolve) => setTimeout(resolve, 2500));
    
    setDocuments(prev => prev.map(doc => ({ ...doc, status: 'ready' as const })));
    setBundleReady(true);
    setGenerating(false);
    
    // Update Module 3 progress
    updateModuleStatus(3, 'in-progress', 2);
    
    toast.success('Court Bundle Generated!', {
      description: 'All documents are ready for download and submission.',
    });
  };

  const handleDownloadBundle = () => {
    setDocuments(prev => prev.map(doc => ({ ...doc, status: 'downloaded' as const })));
    
    // Update Module 3 progress to complete
    updateModuleStatus(3, 'completed', 3);
    
    toast.success('Court Bundle Downloaded', {
      description: 'Print 2 copies and bring to the Service Bureau.',
    });
  };

  const getStatusBadge = (status: CourtDocument['status']) => {
    switch (status) {
      case 'drafting':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Drafting
          </Badge>
        );
      case 'ready':
        return (
          <Badge className="bg-primary text-primary-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Ready to Sign
          </Badge>
        );
      case 'downloaded':
        return (
          <Badge className="bg-secondary text-secondary-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Downloaded
          </Badge>
        );
    }
  };

  // Check if Module 2 is complete (for demo, we'll show a locked state if not)
  if (!isModule2Complete) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Legal Application</h2>
          <p className="text-muted-foreground mt-1">
            {isProbate ? 'Grant of Probate' : 'Letters of Administration'} — Court Document Generator
          </p>
        </div>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-amber-500/20">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Module 2 Required</h3>
                <p className="text-muted-foreground mt-1">
                  Please complete Asset Discovery (Module 2) first. The Schedule of Assets 
                  will be auto-populated with the discovered bank accounts and asset values.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <a href="/assets">
                    <Building2 className="h-4 w-4 mr-2" />
                    Go to Asset Discovery
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Legal Application</h2>
        <p className="text-muted-foreground mt-1">
          {isProbate ? 'Grant of Probate' : 'Letters of Administration'} — Court Document Generator
        </p>
      </div>

      {/* Path Badge */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Scale className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <Badge variant="outline" className="mb-1">
                {isProbate ? 'Grant of Probate Path' : 'Letters of Administration Path'}
              </Badge>
              <p className="text-sm text-muted-foreground">
                TurboTax for Court Forms — Review pre-filled documents before submission
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Application Bundle */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Application Bundle
              </CardTitle>
              <CardDescription>
                Required documents for your {isProbate ? 'Probate' : 'LOA'} application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-colors',
                    doc.status === 'downloaded' && 'bg-secondary/5 border-secondary/30',
                    doc.status === 'ready' && 'bg-primary/5 border-primary/30'
                  )}
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>
              ))}

              {/* Generate Button */}
              <div className="pt-4">
                {!bundleReady ? (
                  <Button
                    onClick={handleGenerateBundle}
                    disabled={generating}
                    className="w-full"
                    size="lg"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Compiling Assets...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-5 w-5" />
                        Generate Court Bundle (PDF)
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleDownloadBundle}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    size="lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Court Bundle
                  </Button>
                )}
              </div>

              {bundleReady && (
                <Badge className="w-full justify-center py-2 bg-secondary/20 text-secondary border-0">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Ready for Submission
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Schedule of Assets Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Schedule of Assets Preview
              </CardTitle>
              <CardDescription>
                Auto-populated from Module 2 discoveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-muted/30">
                {/* Legal Document Header */}
                <div className="p-3 border-b bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    In the Family Justice Courts of the Republic of Singapore
                  </p>
                  <p className="font-semibold text-sm mt-1">Schedule of Assets</p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">S/N</TableHead>
                      <TableHead className="text-xs">Institution</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs text-right">Value (SGD)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discoveredAssets.length > 0 ? (
                      discoveredAssets.map((asset, index) => (
                        <TableRow key={asset.id}>
                          <TableCell className="text-xs">{index + 1}</TableCell>
                          <TableCell className="text-xs font-medium">{asset.institution}</TableCell>
                          <TableCell className="text-xs">{asset.accountType}</TableCell>
                          <TableCell className="text-xs text-right">
                            ${asset.value.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-xs text-center text-muted-foreground py-4">
                          No assets discovered yet
                        </TableCell>
                      </TableRow>
                    )}
                    {discoveredAssets.length > 0 && (
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell colSpan={3} className="text-xs">
                          TOTAL ESTATE VALUE
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          ${totalEstateValue.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                This data is pulled from your Asset Discovery (Module 2)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Submission Guide */}
        <div className="space-y-6">
          <Card className="bg-accent/30 border-accent">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Where to Go Next?
              </CardTitle>
              <CardDescription>
                The "Last Mile" — Complete these steps to file your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium text-foreground">Print the Generated Bundle</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Print <strong>2 copies</strong> of the complete court bundle on A4 paper.
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Printer className="h-4 w-4" />
                    <span>One copy for the Court, one for your records</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium text-foreground">Visit CrimsonLogic Service Bureau</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submit your documents for e-filing at the service bureau.
                  </p>
                  <Card className="mt-3 bg-background/50">
                    <CardContent className="p-3">
                      <p className="text-sm font-medium">CrimsonLogic Service Bureau</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        133 New Bridge Road<br />
                        #19-01/02 Chinatown Point<br />
                        Singapore 059413
                      </p>
                      <Button variant="outline" size="sm" className="mt-2 gap-2" asChild>
                        <a 
                          href="https://maps.google.com/?q=CrimsonLogic+Chinatown+Point"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MapPin className="h-3 w-3" />
                          View on Map
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground">Upload Filing Receipt</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    After filing, upload your receipt to track progress.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 gap-2" disabled={!bundleReady}>
                    <Upload className="h-4 w-4" />
                    Upload Filing Receipt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estimated Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estimated Filing Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Court Filing Fee</span>
                  <span className="font-medium">$25.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Bureau Fee</span>
                  <span className="font-medium">$15.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Document Certification</span>
                  <span className="font-medium">$10.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Estimated Total</span>
                  <span className="text-primary">$50.00</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                * Actual fees may vary. Check the court website for current rates.
              </p>
            </CardContent>
          </Card>

          {/* Help Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <a
                  href="https://www.judiciary.gov.sg/civil/probate-matters"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Scale className="h-4 w-4" />
                  <span className="flex-1 text-left">Family Justice Courts Guide</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <a
                  href="https://www.crimsonlogic.com.sg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Building2 className="h-4 w-4" />
                  <span className="flex-1 text-left">CrimsonLogic Service Bureau</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
