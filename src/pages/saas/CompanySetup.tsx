import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '@/hooks/useCompany';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Loader2 } from 'lucide-react';

export default function CompanySetup() {
  const navigate = useNavigate();
  const { createCompany, loading: companyLoading } = useCompany();
  const [companyName, setCompanyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsCreating(true);
    const company = await createCompany(companyName.trim());
    setIsCreating(false);

    if (company) {
      navigate('/saas/dashboard');
    }
  };

  if (companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Your Company</CardTitle>
          <CardDescription>
            Set up your logistics company to start managing shipments, clients, and invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Acme Logistics"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isCreating}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isCreating || !companyName.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Company'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
