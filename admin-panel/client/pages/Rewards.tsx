import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RewardTier {
  id: string;
  name: string;
  nameAr: string | null;
  quarter: number;
  year: number;
  minCartons: number;
  maxCartons: number | null;
  cashbackPerCarton: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CustomerReward {
  id: string;
  customerId: string;
  quarter: number;
  year: number;
  totalCartonsPurchased: number;
  eligibleTierId: string | null;
  calculatedReward: string;
  manualAdjustment: string;
  finalReward: string;
  status: 'pending' | 'processed' | 'cancelled';
  paymentId: string | null;
  processedAt: string | null;
  processedBy: string | null;
  notes: string | null;
  customer: {
    businessName: string;
    phone: string;
  };
  eligibleTier: RewardTier | null;
}

export default function Rewards() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  
  // Tier management state
  const [showTierDialog, setShowTierDialog] = useState(false);
  const [editingTier, setEditingTier] = useState<RewardTier | null>(null);
  const [tierForm, setTierForm] = useState({
    name: '',
    nameAr: '',
    minCartons: 0,
    maxCartons: null as number | null,
    cashbackPerCarton: '',
  });
  
  // Customer reward adjustment state
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [adjustingReward, setAdjustingReward] = useState<CustomerReward | null>(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    manualAdjustment: '',
    notes: '',
  });
  
  // Process confirmation state
  const [showProcessDialog, setShowProcessDialog] = useState(false);

  // Fetch reward tiers
  const { data: tiers = [], isLoading: tiersLoading } = useQuery({
    queryKey: ['reward-tiers', selectedQuarter, selectedYear],
    queryFn: () => fetchWithAuth(`/api/reward-tiers?quarter=${selectedQuarter}&year=${selectedYear}`),
  });

  // Fetch customer rewards
  const { data: customerRewards = [], isLoading: rewardsLoading } = useQuery({
    queryKey: ['customer-rewards', selectedQuarter, selectedYear],
    queryFn: () => fetchWithAuth(`/api/customer-rewards?quarter=${selectedQuarter}&year=${selectedYear}`),
  });

  // Create/Update tier mutation
  const tierMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingTier) {
        return fetchWithAuth(`/api/reward-tiers/${editingTier.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      }
      return fetchWithAuth('/api/reward-tiers', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          quarter: selectedQuarter,
          year: selectedYear,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-tiers'] });
      setShowTierDialog(false);
      resetTierForm();
    },
  });

  // Delete tier mutation
  const deleteTierMutation = useMutation({
    mutationFn: (tierId: string) =>
      fetchWithAuth(`/api/reward-tiers/${tierId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-tiers'] });
    },
  });

  // Update customer reward mutation
  const updateRewardMutation = useMutation({
    mutationFn: (data: { id: string; manualAdjustment: string; notes: string }) =>
      fetchWithAuth(`/api/customer-rewards/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          manualAdjustment: data.manualAdjustment,
          notes: data.notes,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-rewards'] });
      setShowAdjustDialog(false);
      setAdjustingReward(null);
    },
  });

  // Process rewards mutation
  const processRewardsMutation = useMutation({
    mutationFn: () =>
      fetchWithAuth('/api/customer-rewards/process', {
        method: 'POST',
        body: JSON.stringify({
          quarter: selectedQuarter,
          year: selectedYear,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-rewards'] });
      setShowProcessDialog(false);
    },
  });

  const resetTierForm = () => {
    setTierForm({
      name: '',
      nameAr: '',
      minCartons: 0,
      maxCartons: null,
      cashbackPerCarton: '',
    });
    setEditingTier(null);
  };

  const openTierDialog = (tier?: RewardTier) => {
    if (tier) {
      setEditingTier(tier);
      setTierForm({
        name: tier.name,
        nameAr: tier.nameAr || '',
        minCartons: tier.minCartons,
        maxCartons: tier.maxCartons,
        cashbackPerCarton: tier.cashbackPerCarton,
      });
    } else {
      resetTierForm();
    }
    setShowTierDialog(true);
  };

  const openAdjustDialog = (reward: CustomerReward) => {
    setAdjustingReward(reward);
    setAdjustmentForm({
      manualAdjustment: reward.manualAdjustment || '0',
      notes: reward.notes || '',
    });
    setShowAdjustDialog(true);
  };

  const handleSaveTier = () => {
    tierMutation.mutate(tierForm);
  };

  const handleSaveAdjustment = () => {
    if (adjustingReward) {
      updateRewardMutation.mutate({
        id: adjustingReward.id,
        manualAdjustment: adjustmentForm.manualAdjustment,
        notes: adjustmentForm.notes,
      });
    }
  };

  const handleProcessRewards = () => {
    processRewardsMutation.mutate();
  };

  const pendingRewards = customerRewards.filter((r: CustomerReward) => r.status === 'pending');
  const totalPendingAmount = pendingRewards.reduce(
    (sum: number, r: CustomerReward) => sum + parseFloat(r.finalReward),
    0
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quarterly Rewards</h1>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border rounded px-3 py-2"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Tabs value={`q${selectedQuarter}`} onValueChange={(v) => setSelectedQuarter(parseInt(v.slice(1)))}>
        <TabsList>
          <TabsTrigger value="q1">Q1 (Jan-Mar)</TabsTrigger>
          <TabsTrigger value="q2">Q2 (Apr-Jun)</TabsTrigger>
          <TabsTrigger value="q3">Q3 (Jul-Sep)</TabsTrigger>
          <TabsTrigger value="q4">Q4 (Oct-Dec)</TabsTrigger>
        </TabsList>

        {[1, 2, 3, 4].map((q) => (
          <TabsContent key={q} value={`q${q}`} className="space-y-6">
            {/* Reward Tiers Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Reward Tiers</CardTitle>
                <Button onClick={() => openTierDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tier
                </Button>
              </CardHeader>
              <CardContent>
                {tiersLoading ? (
                  <div>Loading tiers...</div>
                ) : tiers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No reward tiers configured for this quarter
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tier Name</TableHead>
                        <TableHead>Min Cartons</TableHead>
                        <TableHead>Max Cartons</TableHead>
                        <TableHead>Cashback/Carton</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tiers.map((tier: RewardTier) => (
                        <TableRow key={tier.id}>
                          <TableCell>
                            {tier.name}
                            {tier.nameAr && (
                              <div className="text-sm text-muted-foreground">{tier.nameAr}</div>
                            )}
                          </TableCell>
                          <TableCell>{tier.minCartons}</TableCell>
                          <TableCell>{tier.maxCartons ?? '∞'}</TableCell>
                          <TableCell>EGP {tier.cashbackPerCarton}</TableCell>
                          <TableCell>
                            <Badge variant={tier.isActive ? 'default' : 'secondary'}>
                              {tier.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openTierDialog(tier)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTierMutation.mutate(tier.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Customer Rewards Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Customer Rewards</CardTitle>
                  {pendingRewards.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Total Pending: EGP {totalPendingAmount.toFixed(2)} ({pendingRewards.length}{' '}
                      customers)
                    </div>
                  )}
                </div>
                {pendingRewards.length > 0 && (
                  <Button onClick={() => setShowProcessDialog(true)}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Process All Rewards
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {rewardsLoading ? (
                  <div>Loading rewards...</div>
                ) : customerRewards.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No customer rewards data available
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Cartons Purchased</TableHead>
                        <TableHead>Eligible Tier</TableHead>
                        <TableHead>Calculated Reward</TableHead>
                        <TableHead>Manual Adjustment</TableHead>
                        <TableHead>Final Reward</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerRewards.map((reward: CustomerReward) => (
                        <TableRow key={reward.id}>
                          <TableCell>
                            <div>{reward.customer.businessName}</div>
                            <div className="text-sm text-muted-foreground">
                              {reward.customer.phone}
                            </div>
                          </TableCell>
                          <TableCell>{reward.totalCartonsPurchased}</TableCell>
                          <TableCell>
                            {reward.eligibleTier ? (
                              <div>{reward.eligibleTier.name}</div>
                            ) : (
                              <span className="text-muted-foreground">No tier</span>
                            )}
                          </TableCell>
                          <TableCell>EGP {reward.calculatedReward}</TableCell>
                          <TableCell>
                            {parseFloat(reward.manualAdjustment || '0') !== 0 && (
                              <span
                                className={
                                  parseFloat(reward.manualAdjustment) > 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }
                              >
                                {parseFloat(reward.manualAdjustment) > 0 ? '+' : ''}
                                {reward.manualAdjustment}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold">
                            EGP {reward.finalReward}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                reward.status === 'processed'
                                  ? 'default'
                                  : reward.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {reward.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {reward.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openAdjustDialog(reward)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Tier Dialog */}
      <Dialog open={showTierDialog} onOpenChange={setShowTierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTier ? 'Edit Tier' : 'Add New Tier'}</DialogTitle>
            <DialogDescription>
              Configure reward tier for Q{selectedQuarter} {selectedYear}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tier Name (English)</Label>
              <Input
                value={tierForm.name}
                onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                placeholder="e.g., Bronze Tier"
              />
            </div>
            <div>
              <Label>Tier Name (Arabic)</Label>
              <Input
                value={tierForm.nameAr}
                onChange={(e) => setTierForm({ ...tierForm, nameAr: e.target.value })}
                placeholder="e.g., الفئة البرونزية"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Cartons</Label>
                <Input
                  type="number"
                  value={tierForm.minCartons}
                  onChange={(e) =>
                    setTierForm({ ...tierForm, minCartons: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label>Max Cartons (optional)</Label>
                <Input
                  type="number"
                  value={tierForm.maxCartons || ''}
                  onChange={(e) =>
                    setTierForm({
                      ...tierForm,
                      maxCartons: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
            <div>
              <Label>Cashback per Carton (EGP)</Label>
              <Input
                type="number"
                step="0.01"
                value={tierForm.cashbackPerCarton}
                onChange={(e) =>
                  setTierForm({ ...tierForm, cashbackPerCarton: e.target.value })
                }
                placeholder="e.g., 5.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTierDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTier} disabled={tierMutation.isPending}>
              {tierMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjustment Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Reward</DialogTitle>
            <DialogDescription>
              Manually adjust the reward amount for {adjustingReward?.customer.businessName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Calculated Reward</Label>
              <div className="text-2xl font-bold">
                EGP {adjustingReward?.calculatedReward}
              </div>
            </div>
            <div>
              <Label>Manual Adjustment</Label>
              <Input
                type="number"
                step="0.01"
                value={adjustmentForm.manualAdjustment}
                onChange={(e) =>
                  setAdjustmentForm({ ...adjustmentForm, manualAdjustment: e.target.value })
                }
                placeholder="e.g., -10.00 or +20.00"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Use negative values to decrease, positive to increase
              </p>
            </div>
            {adjustingReward && (
              <div>
                <Label>Final Reward</Label>
                <div className="text-2xl font-bold text-green-600">
                  EGP{' '}
                  {(
                    parseFloat(adjustingReward.calculatedReward) +
                    parseFloat(adjustmentForm.manualAdjustment || '0')
                  ).toFixed(2)}
                </div>
              </div>
            )}
            <div>
              <Label>Notes</Label>
              <Textarea
                value={adjustmentForm.notes}
                onChange={(e) =>
                  setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })
                }
                placeholder="Reason for adjustment..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAdjustment} disabled={updateRewardMutation.isPending}>
              {updateRewardMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Confirmation Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process All Rewards</DialogTitle>
            <DialogDescription>
              This will process rewards for all pending customers and add the amounts to their
              wallets.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>{pendingRewards.length} customers</strong> will receive rewards
                </p>
                <p>
                  <strong>Total amount: EGP {totalPendingAmount.toFixed(2)}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. Make sure all adjustments are correct before
                  proceeding.
                </p>
              </div>
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProcessRewards}
              disabled={processRewardsMutation.isPending}
              variant="default"
            >
              {processRewardsMutation.isPending ? 'Processing...' : 'Confirm & Process'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
