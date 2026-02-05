import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { useClients } from '@/hooks/useClients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { ClientType, CreateClientInput } from '@/types/saas-erp';

export default function ClientsPage() {
  const navigate = useNavigate();
  const { clients, loading, createClient, updateClient, deleteClient, getClientsByType } = useClients();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateClientInput>({
    name: '',
    type: 'CLIENT',
    email: '',
    phone: '',
  });

  const handleCreate = async () => {
    if (!formData.name) return;
    
    setIsCreating(true);
    const result = await createClient(formData);
    setIsCreating(false);
    
    if (result) {
      setIsCreateOpen(false);
      setFormData({ name: '', type: 'CLIENT', email: '', phone: '' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      await deleteClient(id);
    }
  };

  const clientsList = getClientsByType('CLIENT');
  const vendorsList = getClientsByType('VENDOR');

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const renderTable = (items: typeof clients, type: ClientType) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
              No {type === 'CLIENT' ? 'clients' : 'vendors'} yet.
            </TableCell>
          </TableRow>
        ) : (
          items.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.email || '—'}</TableCell>
              <TableCell>{client.phone || '—'}</TableCell>
              <TableCell>
                <Badge variant={client.is_active ? 'default' : 'secondary'}>
                  {client.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => updateClient(client.id, { is_active: !client.is_active })}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => handleDelete(client.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/saas/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Clients & Vendors</h1>
            <p className="text-muted-foreground">Manage your business relationships</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Client or Vendor</DialogTitle>
                <DialogDescription>
                  Enter the contact details for your new business relationship.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Company or contact name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v: ClientType) => setFormData(prev => ({ ...prev, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLIENT">Client</SelectItem>
                      <SelectItem value="VENDOR">Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+1 234 567 890"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={isCreating || !formData.name}>
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="clients">
          <TabsList>
            <TabsTrigger value="clients">Clients ({clientsList.length})</TabsTrigger>
            <TabsTrigger value="vendors">Vendors ({vendorsList.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="clients" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Clients</CardTitle>
              </CardHeader>
              <CardContent>
                {renderTable(clientsList, 'CLIENT')}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="vendors" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                {renderTable(vendorsList, 'VENDOR')}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
