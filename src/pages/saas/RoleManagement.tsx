import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SaasLayout } from '@/components/saas/SaasLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Shield, UserCog, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { AppRole } from '@/types/erp';

const roleColors: Record<AppRole, string> = {
  admin: 'bg-red-100 text-red-800',
  operations: 'bg-blue-100 text-blue-800',
  warehouse: 'bg-purple-100 text-purple-800',
  finance: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
  user: 'bg-gray-100 text-gray-600',
};

const roleDescriptions: Record<AppRole, string> = {
  admin: 'Full system access, manage users, view audit logs',
  operations: 'Manage shipments, clients, vendors',
  warehouse: 'Update shipment status only',
  finance: 'Create invoices and payments only',
  viewer: 'Read-only access to all data',
  user: 'Basic user access',
};

const assignableRoles: AppRole[] = ['admin', 'operations', 'warehouse', 'finance', 'viewer'];

export default function RoleManagement() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { users, loading, assignRole, removeRole, setApproval } = useUserRoles();
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);

  const handleAssignRole = async (userId: string) => {
    if (!selectedRole) return;
    setAssigningUserId(userId);
    await assignRole(userId, selectedRole);
    setAssigningUserId(null);
    setSelectedRole('');
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    if (confirm(`Remove ${role} role from this user?`)) {
      await removeRole(userId, role);
    }
  };

  const handleApproval = async (userId: string, approved: boolean) => {
    setApprovingUserId(userId);
    await setApproval(userId, approved);
    setApprovingUserId(null);
  };

  if (!isAdmin) {
    return (
      <SaasLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </SaasLayout>
    );
  }

  if (loading) {
    return (
      <SaasLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SaasLayout>
    );
  }

  const pendingUsers = users.filter(u => !u.is_approved);
  const approvedUsers = users.filter(u => u.is_approved);

  return (
    <SaasLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/saas/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Role Management</h1>
            <p className="text-muted-foreground">Assign roles and approve new users</p>
          </div>
        </div>

        {/* Pending Approvals */}
        {pendingUsers.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Clock className="h-5 w-5" />
                Pending Approvals ({pendingUsers.length})
              </CardTitle>
              <CardDescription>
                These users have registered and are waiting for your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.display_name || user.email?.split('@')[0] || 'Unknown'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={approvingUserId === user.id}
                            onClick={() => handleApproval(user.id, true)}
                          >
                            {approvingUserId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Role Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Role Permissions
            </CardTitle>
            <CardDescription>
              Each role grants specific permissions within the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {assignableRoles.map(role => (
                <div key={role} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Badge className={roleColors[role]}>{role}</Badge>
                  <span className="text-sm text-muted-foreground">{roleDescriptions[role]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Approved Users ({approvedUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Roles</TableHead>
                  <TableHead>Assign Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.display_name || user.email?.split('@')[0] || 'Unknown'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive h-6 px-2 text-xs"
                          onClick={() => {
                            if (confirm('Revoke access for this user?')) {
                              handleApproval(user.id, false);
                            }
                          }}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Revoke
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length === 0 ? (
                          <span className="text-muted-foreground text-sm">No roles</span>
                        ) : (
                          user.roles.map(role => (
                            <Badge 
                              key={role} 
                              className={`${roleColors[role]} cursor-pointer`}
                              onClick={() => handleRemoveRole(user.id, role)}
                            >
                              {role} ×
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={selectedRole} 
                          onValueChange={(v: AppRole) => setSelectedRole(v)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {assignableRoles
                              .filter(r => !user.roles.includes(r))
                              .map(role => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          size="sm"
                          disabled={!selectedRole || assigningUserId === user.id}
                          onClick={() => handleAssignRole(user.id)}
                        >
                          {assigningUserId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Assign'
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SaasLayout>
  );
}
