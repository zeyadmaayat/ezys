import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useDpDrivers } from '@/hooks/useDpDrivers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Loader2, Truck, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DP_VEHICLE_LABELS, type DpVehicleType, type CreateDpDriverInput } from '@/types/domestic-pro';

export default function DpDrivers() {
  const { drivers, loading, createDriver, updateDriver, deleteDriver } = useDpDrivers();
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateDpDriverInput>({ name: '', vehicle_type: 'van' });

  const handleCreate = async () => {
    if (!form.name) { toast.error('Driver name is required'); return; }
    const result = await createDriver(form);
    if (result) {
      setCreateOpen(false);
      setForm({ name: '', vehicle_type: 'van' });
    }
  };

  const handleEdit = (driver: any) => {
    setEditId(driver.id);
    setForm({ name: driver.name, phone: driver.phone || '', vehicle_type: driver.vehicle_type, vehicle_plate: driver.vehicle_plate || '' });
  };

  const handleUpdate = async () => {
    if (!editId) return;
    await updateDriver(editId, form);
    setEditId(null);
    setForm({ name: '', vehicle_type: 'van' });
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await updateDriver(id, { is_active: !current } as any);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Drivers</h1>
            <p className="text-muted-foreground">{drivers.length} drivers registered</p>
          </div>
          <Dialog open={createOpen || !!editId} onOpenChange={(open) => { if (!open) { setCreateOpen(false); setEditId(null); setForm({ name: '', vehicle_type: 'van' }); } }}>
            <DialogTrigger asChild>
              <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Driver</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editId ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Vehicle Type</Label>
                  <Select value={form.vehicle_type} onValueChange={v => setForm({...form, vehicle_type: v as DpVehicleType})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(DP_VEHICLE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vehicle Plate</Label>
                  <Input value={form.vehicle_plate || ''} onChange={e => setForm({...form, vehicle_plate: e.target.value})} />
                </div>
                <Button onClick={editId ? handleUpdate : handleCreate} className="w-full">
                  {editId ? 'Update Driver' : 'Add Driver'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Plate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No drivers yet</TableCell></TableRow>
              ) : drivers.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-sm">{d.phone || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{DP_VEHICLE_LABELS[d.vehicle_type]}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{d.vehicle_plate || '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={d.is_active} onCheckedChange={() => handleToggleActive(d.id, d.is_active)} />
                      <span className={`text-xs font-medium ${d.is_active ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {d.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(d)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteDriver(d.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </MainLayout>
  );
}
