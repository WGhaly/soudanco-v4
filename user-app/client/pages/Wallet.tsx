import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { useDashboard, useWalletTopUp } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Wallet() {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading, refetch } = useDashboard();
  const topUpMutation = useWalletTopUp();
  const { toast } = useToast();
  
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  
  const dashboard = dashboardData?.data;
  
  const creditLimit = parseFloat(dashboard?.creditLimit || "0");
  const creditUsed = parseFloat(dashboard?.currentBalance || "0");
  const walletBalance = parseFloat(dashboard?.walletBalance || "0");
  const availableCredit = creditLimit - creditUsed;
  const totalAvailable = walletBalance + availableCredit;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateCardDetails = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء إدخال رقم بطاقة صحيح",
      });
      return false;
    }
    if (!cardExpiry || cardExpiry.length < 5) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء إدخال تاريخ انتهاء صحيح",
      });
      return false;
    }
    if (!cardCvv || cardCvv.length < 3) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء إدخال CVV صحيح",
      });
      return false;
    }
    if (!cardName.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء إدخال اسم صاحب البطاقة",
      });
      return false;
    }
    return true;
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء إدخال مبلغ صحيح",
      });
      return;
    }

    if (!validateCardDetails()) {
      return;
    }

    setIsProcessing(true);
    try {
      await topUpMutation.mutateAsync({ amount });
      toast({
        title: "تم بنجاح",
        description: "تم شحن المحفظة بنجاح",
      });
      setShowTopUp(false);
      setTopUpAmount("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setCardName("");
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل في شحن المحفظة",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAmounts = [100, 250, 500, 1000];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FD7E14]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] pb-24">
      <div className="p-5 flex-1">
        <PageHeader title="المحفظة" />
        
        {/* Total Available Balance */}
        <div className="bg-gradient-to-br from-[#FD7E14] to-[#E06500] rounded-2xl p-6 mb-6 mt-6 text-white">
          <p className="text-right text-sm opacity-80 mb-2">الرصيد المتاح للشراء</p>
          <p className="text-right text-4xl font-bold">{totalAvailable.toFixed(2)} جم</p>
          <div className="flex flex-row-reverse gap-4 mt-4 text-sm">
            <div className="flex-1 text-right">
              <p className="opacity-70">رصيد المحفظة</p>
              <p className="font-semibold">{walletBalance.toFixed(2)} جم</p>
            </div>
            <div className="flex-1 text-right">
              <p className="opacity-70">الائتمان المتاح</p>
              <p className="font-semibold">{availableCredit.toFixed(2)} جم</p>
            </div>
          </div>
        </div>

        {/* Credit Details */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h3 className="text-[#212529] text-lg font-semibold text-right mb-4">تفاصيل الائتمان</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#212529] font-medium">{creditLimit.toFixed(2)} جم</span>
              <span className="text-[#6C757D]">الحد الائتماني</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`font-medium ${creditUsed > 0 ? 'text-[#DC3545]' : 'text-[#28A745]'}`}>
                {creditUsed.toFixed(2)} جم
              </span>
              <span className="text-[#6C757D]">الائتمان المستخدم</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[#28A745] font-medium">{availableCredit.toFixed(2)} جم</span>
              <span className="text-[#6C757D]">الائتمان المتاح</span>
            </div>
            
            {/* Credit Usage Bar */}
            <div className="mt-2">
              <div className="h-2 bg-[#E9ECEF] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#FD7E14] transition-all duration-300"
                  style={{ width: `${Math.min((creditUsed / creditLimit) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-[#6C757D] text-right mt-1">
                {creditLimit > 0 ? ((creditUsed / creditLimit) * 100).toFixed(0) : 0}% مستخدم
              </p>
            </div>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex flex-row-reverse justify-between items-center mb-4">
            <h3 className="text-[#212529] text-lg font-semibold">رصيد المحفظة</h3>
            <span className="text-[#FD7E14] text-2xl font-bold">{walletBalance.toFixed(2)} جم</span>
          </div>
          
          <p className="text-[#6C757D] text-sm text-right mb-4">
            رصيد المحفظة يُستخدم أولاً عند الشراء. يمكنك شحن المحفظة لسداد الائتمان المستخدم أو لإضافة رصيد مسبق.
          </p>
          
          <Button
            onClick={() => setShowTopUp(!showTopUp)}
            className="w-full bg-[#FD7E14] hover:bg-[#E06500] text-white py-3 rounded-lg font-medium"
          >
            {showTopUp ? "إلغاء" : "شحن المحفظة"}
          </Button>
        </div>

        {/* Top Up Form */}
        {showTopUp && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm animate-in slide-in-from-top-2">
            <h3 className="text-[#212529] text-lg font-semibold text-right mb-4">شحن المحفظة</h3>
            
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTopUpAmount(amount.toString())}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    topUpAmount === amount.toString()
                      ? 'bg-[#FD7E14] text-white'
                      : 'bg-[#F8F9FA] text-[#212529] hover:bg-[#E9ECEF]'
                  }`}
                >
                  {amount} جم
                </button>
              ))}
            </div>
            
            {/* Custom Amount */}
            <div className="mb-4">
              <label className="block text-[#6C757D] text-sm text-right mb-2">مبلغ مخصص</label>
              <Input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                className="text-right"
                min="1"
              />
            </div>

            {/* Card Details Section */}
            <div className="border-t border-[#E9ECEF] pt-4 mb-4">
              <h4 className="text-[#212529] font-semibold text-right mb-3">بيانات البطاقة</h4>
              
              {/* Card Number */}
              <div className="mb-3">
                <label className="block text-[#6C757D] text-sm text-right mb-2">رقم البطاقة</label>
                <Input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  className="text-left"
                  maxLength={19}
                  dir="ltr"
                />
              </div>

              {/* Cardholder Name */}
              <div className="mb-3">
                <label className="block text-[#6C757D] text-sm text-right mb-2">اسم صاحب البطاقة</label>
                <Input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  placeholder="JOHN DOE"
                  className="text-left uppercase"
                  dir="ltr"
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6C757D] text-sm text-right mb-2">تاريخ الانتهاء</label>
                  <Input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="text-left"
                    maxLength={5}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-[#6C757D] text-sm text-right mb-2">CVV</label>
                  <Input
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    className="text-left"
                    maxLength={4}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
            
            {/* Payment Info */}
            {creditUsed > 0 && parseFloat(topUpAmount) > 0 && (
              <div className="bg-[#FFF3CD] rounded-lg p-3 mb-4">
                <p className="text-[#856404] text-sm text-right">
                  {parseFloat(topUpAmount) >= creditUsed ? (
                    <>
                      سيتم سداد الائتمان المستخدم ({creditUsed.toFixed(2)} جم) وإضافة {(parseFloat(topUpAmount) - creditUsed).toFixed(2)} جم لرصيد المحفظة
                    </>
                  ) : (
                    <>
                      سيتم خصم {parseFloat(topUpAmount).toFixed(2)} جم من الائتمان المستخدم
                    </>
                  )}
                </p>
              </div>
            )}
            
            <Button
              onClick={handleTopUp}
              disabled={isProcessing || !topUpAmount || parseFloat(topUpAmount) <= 0}
              className="w-full bg-[#28A745] hover:bg-[#218838] text-white py-3 rounded-lg font-medium"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>جاري المعالجة...</span>
                </div>
              ) : (
                `تأكيد الدفع ${topUpAmount ? `(${topUpAmount} جم)` : ''}`
              )}
            </Button>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-[#E7F3FF] rounded-xl p-4">
          <h4 className="text-[#0D6EFD] font-semibold text-right mb-2">كيف يعمل نظام المحفظة؟</h4>
          <ul className="text-[#0D6EFD] text-sm text-right space-y-2">
            <li>• عند الشراء، يُخصم المبلغ أولاً من رصيد المحفظة</li>
            <li>• إذا لم يكفِ رصيد المحفظة، يُستخدم الائتمان المتاح</li>
            <li>• عند شحن المحفظة، يُسدد الائتمان المستخدم أولاً</li>
            <li>• الرصيد المتبقي يُضاف إلى المحفظة</li>
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
