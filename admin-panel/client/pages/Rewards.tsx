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
  const { data: tiersResponse, isLoading: tiersLoading } = useQuery({
    queryKey: ['reward-tiers', selectedQuarter, selectedYear],
    queryFn: () => fetchWithAuth(`/api/reward-tiers?quarter=${selectedQuarter}&year=${selectedYear}`),
  });
  const tiers = tiersResponse?.data || [];

  // Fetch customer rewards
  const { data: rewardsResponse, isLoading: rewardsLoading } = useQuery({
    queryKey: ['customer-rewards', selectedQuarter, selectedYear],
    queryFn: () => fetchWithAuth(`/api/customer-rewards?quarter=${selectedQuarter}&year=${selectedYear}`),
  });
  const customerRewards = rewardsResponse?.data || [];

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
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">المكافآت الربعية</h1>
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
          <TabsTrigger value="q1">الربع الأول (يناير-مارس)</TabsTrigger>
          <TabsTrigger value="q2">الربع الثاني (أبريل-يونيو)</TabsTrigger>
          <TabsTrigger value="q3">الربع الثالث (يوليو-سبتمبر)</TabsTrigger>
          <TabsTrigger value="q4">الربع الرابع (أكتوبر-ديسمبر)</TabsTrigger>
        </TabsList>

        {[1, 2, 3, 4].map((q) => (
          <TabsContent key={q} value={`q${q}`} className="space-y-6">
            {/* Reward Tiers Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>مستويات المكافآت</CardTitle>
                <Button onClick={() => openTierDialog()}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة مستوى
                </Button>
              </CardHeader>
              <CardContent>
                {tiersLoading ? (
                  <div>جاري تحميل المستويات...</div>
                ) : tiers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد مستويات مكافآت محددة لهذا الربع
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم المستوى</TableHead>
                        <TableHead>الحد الأدنى للكراتين</TableHead>
                        <TableHead>الحد الأقصى للكراتين</TableHead>
                        <TableHead>المبلغ المسترد/كرتونة</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tiers.map((tier: RewardTier) => (
                        <TableRow key={tier.id}>
                          <TableCell>
                            {tier.nameAr || tier.name}
                            {tier.nameAr && tier.name && (
                              <div className="text-sm text-muted-foreground">{tier.name}</div>
                            )}
                          </TableCell>
                          <TableCell>{tier.minCartons}</TableCell>
                          <TableCell>{tier.maxCartons ?? '∞'}</TableCell>
                          <TableCell>{tier.cashbackPerCarton} جنيه</TableCell>
                          <TableCell>
                            <Badge variant={tier.isActive ? 'default' : 'secondary'}>
                              {tier.isActive ? 'نشط' : 'غير نشط'}
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
                  <CardTitle>مكافآت العملاء</CardTitle>
                  {pendingRewards.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      إجمالي المعلق: {totalPendingAmount.toFixed(2)} جنيه ({pendingRewards.length}{' '}عميل)
                    </div>
                  )}
                </div>
                {pendingRewards.length > 0 && (
                  <Button onClick={() => setShowProcessDialog(true)}>
                    <DollarSign className="ml-2 h-4 w-4" />
                    معالجة جميع المكافآت
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {rewardsLoading ? (
                  <div>جاري تحميل المكافآت...</div>
                ) : customerRewards.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد بيانات مكافآت للعملاء
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>العميل</TableHead>
                        <TableHead>الكراتين المشتراة</TableHead>
                        <TableHead>المستوى المؤهل</TableHead>
                        <TableHead>المكافأة المحسوبة</TableHead>
                        <TableHead>التعديل اليدوي</TableHead>
                        <TableHead>المكافأة النهائية</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الإجراءات</TableHead>
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
                              <div>{reward.eligibleTier.nameAr || reward.eligibleTier.name}</div>
                            ) : (
                              <span className="text-muted-foreground">لا يوجد مستوى</span>
                            )}
                          </TableCell>
                          <TableCell>{reward.calculatedReward} جنيه</TableCell>
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
                            {reward.finalReward} جنيه
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
                              {reward.status === 'processed' ? 'تم المعالجة' : reward.status === 'pending' ? 'معلق' : 'ملغي'}
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
            <DialogTitle>{editingTier ? 'تعديل المستوى' : 'إضافة مستوى جديد'}</DialogTitle>
            <DialogDescription>
              إعداد مستوى المكافأة للربع {selectedQuarter} من {selectedYear}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>اسم المستوى (عربي)</Label>
              <Input
                value={tierForm.nameAr}
                onChange={(e) => setTierForm({ ...tierForm, nameAr: e.target.value })}
                placeholder="مثلاً: الفئة البرونزية"
              />
            </div>
            <div>
              <Label>اسم المستوى (إنجليزي)</Label>
              <Input
                value={tierForm.name}
                onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                placeholder="e.g., Bronze Tier"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الحد الأدنى للكراتين</Label>
                <Input
                  type="number"
                  value={tierForm.minCartons}
                  onChange={(e) =>
                    setTierForm({ ...tierForm, minCartons: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label>الحد الأقصى للكراتين (اختياري)</Label>
                <Input
                  type="number"
                  value={tierForm.maxCartons || ''}
                  onChange={(e) =>
                    setTierForm({
                      ...tierForm,
                      maxCartons: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="اترك فارغاً لغير محدود"
                />
              </div>
            </div>
            <div>
              <Label>المبلغ المسترد لكل كرتونة (جنيه)</Label>
              <Input
                type="number"
                step="0.01"
                value={tierForm.cashbackPerCarton}
                onChange={(e) =>
                  setTierForm({ ...tierForm, cashbackPerCarton: e.target.value })
                }
                placeholder="مثلاً: 5.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTierDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveTier} disabled={tierMutation.isPending}>
              {tierMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjustment Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المكافأة</DialogTitle>
            <DialogDescription>
              تعديل مبلغ المكافأة يدوياً لـ {adjustingReward?.customer.businessName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>المكافأة المحسوبة</Label>
              <div className="text-2xl font-bold">
                {adjustingReward?.calculatedReward} جنيه
              </div>
            </div>
            <div>
              <Label>التعديل اليدوي</Label>
              <Input
                type="number"
                step="0.01"
                value={adjustmentForm.manualAdjustment}
                onChange={(e) =>
                  setAdjustmentForm({ ...adjustmentForm, manualAdjustment: e.target.value })
                }
                placeholder="مثلاً: -10.00 أو +20.00"
              />
              <p className="text-sm text-muted-foreground mt-1">
                استخدم قيم سالبة للتقليل، وموجبة للزيادة
              </p>
            </div>
            {adjustingReward && (
              <div>
                <Label>المكافأة النهائية</Label>
                <div className="text-2xl font-bold text-green-600">
                  {(
                    parseFloat(adjustingReward.calculatedReward) +
                    parseFloat(adjustmentForm.manualAdjustment || '0')
                  ).toFixed(2)} جنيه
                </div>
              </div>
            )}
            <div>
              <Label>ملاحظات</Label>
              <Textarea
                value={adjustmentForm.notes}
                onChange={(e) =>
                  setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })
                }
                placeholder="سبب التعديل..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveAdjustment} disabled={updateRewardMutation.isPending}>
              {updateRewardMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Confirmation Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>معالجة جميع المكافآت</DialogTitle>
            <DialogDescription>
              سيتم معالجة مكافآت جميع العملاء المعلقة وإضافة المبالغ إلى محافظهم.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>{pendingRewards.length} عميل</strong> سيحصلون على مكافآت
                </p>
                <p>
                  <strong>إجمالي المبلغ: {totalPendingAmount.toFixed(2)} جنيه</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  لا يمكن التراجع عن هذا الإجراء. تأكد من أن جميع التعديلات صحيحة قبل المتابعة.
                </p>
              </div>
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleProcessRewards}
              disabled={processRewardsMutation.isPending}
              variant="default"
            >
              {processRewardsMutation.isPending ? 'جاري المعالجة...' : 'تأكيد ومعالجة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
