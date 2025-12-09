import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/context/AppContext';
import { Document } from '@/types';
import { Upload, CheckCircle2, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function DocumentRow({ doc, onUpload }: { doc: Document; onUpload: (id: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(doc.id);
    }
  };

  return (
    <div className={cn(
      'flex items-start gap-4 p-4 rounded-lg border transition-colors',
      doc.uploaded ? 'bg-secondary/5 border-secondary/30' : 'bg-card border-border'
    )}>
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
        doc.uploaded ? 'bg-secondary/10' : 'bg-muted'
      )}>
        {doc.uploaded ? (
          <CheckCircle2 className="h-5 w-5 text-secondary" />
        ) : (
          <FileText className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium text-foreground">{doc.name}</h4>
            <p className="text-sm text-muted-foreground mt-0.5">{doc.description}</p>
          </div>
        </div>

        <div className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          <Button
            variant={doc.uploaded ? 'outline' : 'default'}
            size="sm"
            onClick={handleClick}
            className="gap-2"
          >
            {doc.uploaded ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Uploaded
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DocumentUpload() {
  const { documents, updateDocument, triageResult } = useApp();

  const visibleDocs = documents.filter((doc) => {
    if (!doc.conditional) return true;
    return triageResult[doc.conditional.field] === doc.conditional.value;
  });

  const uploadedCount = visibleDocs.filter((d) => d.uploaded).length;
  const progress = (uploadedCount / visibleDocs.length) * 100;

  const handleUpload = (docId: string) => {
    updateDocument(docId, true);
    toast.success('Document uploaded successfully');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Core Documents</h2>
        <p className="text-muted-foreground mt-1">
          Upload essential documents required for estate administration
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {uploadedCount} of {visibleDocs.length} documents
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* MyLegacy Link */}
      <Card className="bg-accent/50 border-accent">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">Get Death Certificate</h4>
              <p className="text-xs text-muted-foreground">
                Download from MyLegacy portal
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href="https://mylegacy.life.gov.sg" target="_blank" rel="noopener noreferrer">
                Visit
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Required Documents</CardTitle>
          <CardDescription>
            Upload clear copies of each document (PDF, JPG, or PNG)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {visibleDocs.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} onUpload={handleUpload} />
          ))}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
        <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground">Your documents are secure</p>
          <p className="text-muted-foreground mt-0.5">
            All uploads are encrypted and stored securely. Documents are only used for your estate administration process.
          </p>
        </div>
      </div>
    </div>
  );
}
