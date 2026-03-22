import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SaasLayout } from '@/components/saas/SaasLayout';
import { useShipmentsV2 } from '@/hooks/useShipmentsV2';
import { useClients } from '@/hooks/useClients';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useCurrentUserRoles } from '@/hooks/useCurrentUserRoles';
import { RequireRole, RoleBadge, PermissionButtonWrapper } from '@/components/auth/RequireRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2, ChevronRight, ArrowLeft, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { SHIPMENT_STATUS_LABELS, ShipmentStatusV2, ShipmentV2 } from '@/types/saas-erp';

const statusColors: Record<ShipmentStatusV2, string> = {
  CREATED: 'bg-gray-100 text-gray-800',
  PICKED_UP: 'bg-blue-100 text-blue-800',
  IN_WAREHOUSE: 'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
};

export default function ShipmentsPage() {
  const navigate = useNavigate();
  const { shipments, loading, createShipment, updateShipmentStatus, getNextStatus } = useShipmentsV2();
  const { clients } = useClients();
  const { warehouses } = useWarehouses();
  const { canManageShipments, canUpdateShipmentStatus } = useCurrentUserRoles();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    warehouse_id: '',
    origin: '',
    destination: '',
    expected_delivery: '',
    notes: '',
  });

  const handleCreate = async () => {
    if (!formData.origin || !formData.destination) return;
    
    setIsCreating(true);
    const result = await createShipment({
      client_id: formData.client_id || undefined,
      warehouse_id: formData.warehouse_id || undefined,
      origin: formData.origin,
      destination: formData.destination,
      expected_delivery: formData.expected_delivery || undefined,
      notes: formData.notes || undefined,
    });
    setIsCreating(false);
    
    if (result) {
      setIsCreateOpen(false);
      setFormData({ client_id: '', warehouse_id: '', origin: '', destination: '', expected_delivery: '', notes: '' });
    }
  };

  const handleAdvanceStatus = async (shipment: ShipmentV2) => {
    const nextStatus = getNextStatus(shipment.status);
    if (nextStatus) {
      await updateShipmentStatus(shipment.id, nextStatus);
    }
  };

  if (loading) {
    return (
      <SaasLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SaasLayout>
    );
  }

  return (
    <SaasLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/saas/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Shipments</h1>
            <p className="text-muted-foreground">Manage your shipments and track their status</p>
          </div>
          {/* Only Admin/Operations can create shipments */}
          <RequireRole 
            roles={['admin', 'operations']} 
            fallback={
              <RoleBadge roles={['admin', 'operations']} className="ml-2" />
            }
            hideWhenForbidden={false}
          >
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Shipment
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Shipment</DialogTitle>
                <DialogDescription>
                  Enter the shipment details. Status will start as "Created".
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin *</Label>
                    <Input
                      id="origin"
                      placeholder="City, Country"
                      value={formData.origin}
                      onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination *</Label>
                    <Input
                      id="destination"
                      placeholder="City, Country"
                      value={formData.destination}
                      onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Select value={formData.client_id} onValueChange={(v) => setFormData(prev => ({ ...prev, client_id: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Warehouse</Label>
                    <Select value={formData.warehouse_id} onValueChange={(v) => setFormData(prev => ({ ...prev, warehouse_id: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map(wh => (
                          <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected_delivery">Expected Delivery</Label>
                  <Input
                    id="expected_delivery"
                    type="date"
                    value={formData.expected_delivery}
                    onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={isCreating || !formData.origin || !formData.destination}>
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </RequireRole>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Shipments ({shipments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {shipments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No shipments yet. Create your first shipment to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking #</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-mono">{shipment.tracking_number}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {shipment.origin} → {shipment.destination}
                        </span>
                      </TableCell>
                      <TableCell>{shipment.client?.name || '—'}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[shipment.status]}>
                          {SHIPMENT_STATUS_LABELS[shipment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {shipment.expected_delivery 
                          ? format(new Date(shipment.expected_delivery), 'MMM d, yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {shipment.status !== 'DELIVERED' && (
                          <PermissionButtonWrapper 
                            roles={['admin', 'operations', 'warehouse']}
                            tooltip="Admin, Operations, or Warehouse role required to update status"
                          >
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => canUpdateShipmentStatus && handleAdvanceStatus(shipment)}
                              disabled={!canUpdateShipmentStatus}
                            >
                              <ChevronRight className="mr-1 h-3 w-3" />
                              {SHIPMENT_STATUS_LABELS[getNextStatus(shipment.status) || 'DELIVERED']}
                            </Button>
                          </PermissionButtonWrapper>
                        )}
                        {shipment.status === 'DELIVERED' && (
                          <RequireRole 
                            roles={['admin', 'finance']}
                            fallback={
                              <Badge variant="secondary" className="text-xs">
                                <Lock className="w-3 h-3 mr-1" />
                                Finance
                              </Badge>
                            }
                            hideWhenForbidden={false}
                          >
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/saas/invoices?shipment=${shipment.id}`)}
                            >
                              Create Invoice
                            </Button>
                          </RequireRole>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SaasLayout>
  );
}
