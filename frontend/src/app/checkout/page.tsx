"use client";

import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { catalogApi, paymentApi, provinceApi } from "@/lib/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Price } from "@/components/ui/price";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Wallet, 
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Ticket,
  XCircle,
  CheckCircle,
  ShoppingBag,
  Star,
  Zap
} from "lucide-react";
import { publicApi } from "@/lib/api";
import Link from "next/link";
import { useSettingsStore } from "@/store/settingsStore";

export default function CheckoutPage() {
  const { items, getTotal, clearCart, getVolumeDiscountPercent } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { publicSettings } = useSettingsStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    shippingAddress: user?.address || "",
    paymentMethod: "COD",
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [detailAddress, setDetailAddress] = useState<string>("");

  // Guest fields
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // New states for shipping and vouchers
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState("");
  const [promotion, setPromotion] = useState<any>(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  // Loyalty Points
  const [usePoints, setUsePoints] = useState(false);
  const userPoints = user?.points || 0;
  
  useEffect(() => {
    provinceApi.getProvinces().then(setProvinces);
    if (user?.address) {
      setDetailAddress(user.address);
    }
  }, [user]);

  const handleProvinceChange = async (value: string) => {
    setSelectedProvince(value);
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);
    
    // Calculate shipping fee
    const fee = calculateShippingFee(value);
    setShippingFee(fee);

    const province = provinces.find(p => p.name === value);
    if (province) {
      const data = await provinceApi.getDistricts(province.code);
      setDistricts(data.districts);
    }
  };

  const calculateShippingFee = (provinceName: string): number => {
    if (!provinceName) return 0;
    const p = provinceName.toLowerCase();
    if (p.includes("hà nội")) return 20000;
    
    const northernProvinces = [
        'bắc ninh', 'hưng yên', 'vĩnh phúc', 'hải dương', 'hải phòng', 
        'thái nguyên', 'phú thọ', 'bắc giang', 'quảng ninh', 'hà nam', 
        'nam định', 'thái bình', 'ninh bình', 'hòa bình'
      ];
    if (northernProvinces.some(item => p.includes(item))) return 35000;
    
    return 50000;
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    setIsValidatingVoucher(true);
    try {
      const promo = await publicApi.validatePromotion(voucherCode);
      const total = getTotal();
      
      if (promo && total >= (promo.minOrderAmount || 0)) {
        setPromotion(promo);
        setAppliedVoucher(voucherCode);
        toast.success(`Đã áp dụng mã: ${voucherCode}`);
      } else {
        toast.error("Mã không hợp lệ hoặc chưa đủ điều kiện.");
        setPromotion(null);
        setAppliedVoucher("");
      }
    } catch (err) {
      toast.error("Mã khuyến mãi không tồn tại.");
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  useEffect(() => {
    if (promotion) {
      const total = getTotal();
      let discount = 0;
      if (promotion.type === 'FREESHIP') {
        discount = shippingFee;
      } else {
        if (promotion.discountPercent) {
          discount = (total * promotion.discountPercent) / 100;
          if (promotion.maxDiscount && discount > promotion.maxDiscount) {
            discount = promotion.maxDiscount;
          }
        } else if (promotion.discountAmount) {
          discount = promotion.discountAmount;
        }
      }
      setDiscountAmount(discount);
    } else {
      setDiscountAmount(0);
    }
  }, [promotion, shippingFee, items]);

  const handleDistrictChange = async (value: string) => {
    setSelectedDistrict(value);
    setSelectedWard("");
    setWards([]);
    const district = districts.find(d => d.name === value);
    if (district) {
      const data = await provinceApi.getWards(district.code);
      setWards(data.wards);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (items.length === 0 && mounted) {
      router.push("/shop");
    }
  }, [items, router, mounted]);

  const mutation = useMutation({
    mutationFn: (data: any) => isAuthenticated ? catalogApi.createOrder(data) : publicApi.createGuestOrder(data),
    onSuccess: async (data) => {
      toast.success("Đơn hàng đã được khởi tạo!");
      clearCart();
      
      if (formData.paymentMethod === 'E_WALLET' || formData.paymentMethod === 'BANK') {
         try {
            const { paymentUrl } = await paymentApi.createPaymentLink(data.id, formData.paymentMethod);
            router.push(paymentUrl);
         } catch (err) {
            toast.error("Không thể khởi tạo thanh toán trực tuyến.");
            router.push(`/orders/${data.id}`);
         }
      } else {
         router.push(`/orders/${data.id}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Thanh toán thất bại");
    },
  });

  if (!mounted || items.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine address parts
    const finalAddress = [
      detailAddress,
      selectedWard,
      selectedDistrict,
      selectedProvince
    ].filter(Boolean).join(", ");

    // Total before volume discount
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const volumeDiscount = subtotal * getVolumeDiscountPercent();

    const orderData = {
      userId: user?.id,
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: subtotal - volumeDiscount + shippingFee - discountAmount,
      shippingFee,
      discountAmount: discountAmount + volumeDiscount, // Include volume discount in total discount for backend tracking
      paymentMethod: formData.paymentMethod,
      shippingAddress: finalAddress,
      shippingProvince: selectedProvince,
      voucherCode: appliedVoucher || undefined,
      guestName: isAuthenticated ? undefined : guestName,
      guestEmail: isAuthenticated ? undefined : guestEmail,
      guestPhone: isAuthenticated ? undefined : guestPhone,
      pointsUsed: usePoints ? Math.min(userPoints, getTotal() + shippingFee - discountAmount) : 0,
    };
    mutation.mutate(orderData);
  };

  return (
    <div className="container mx-auto py-32 px-6 max-w-6xl">
      <div className="flex items-center gap-2 mb-10 text-xs font-black text-gray-400 uppercase tracking-widest animate-fade-in-up">
        <Link href="/cart" className="hover:text-primary transition-colors">Giỏ hàng</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-blue-600">Thanh toán</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-300">Hoàn tất</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="flex-1 space-y-10 w-full animate-fade-in-up">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">
            {/* Shipping Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight uppercase text-[#070f2b]">Thông tin Giao hàng</h2>
              </div>
              
              <Card className="rounded-[2.5rem] border-none shadow-2xl p-4 md:p-8 overflow-hidden bg-white">
                <CardContent className="space-y-6">
                  {!isAuthenticated && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Họ và tên *</Label>
                        <Input 
                          placeholder="Nhập họ tên người nhận" 
                          className="h-14 rounded-2xl bg-gray-50 border-none font-bold"
                          value={guestName} onChange={(e) => setGuestName(e.target.value)} required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Số điện thoại *</Label>
                        <Input 
                          placeholder="Số điện thoại liên hệ" type="tel"
                          className="h-14 rounded-2xl bg-gray-50 border-none font-bold"
                          value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email nhận hóa đơn *</Label>
                        <Input 
                          placeholder="Email để nhận thông báo đơn hàng" type="email"
                          className="h-14 rounded-2xl bg-gray-50 border-none font-bold"
                          value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Tỉnh / Thành phố</Label>
                      <Select value={selectedProvince} onValueChange={(val) => handleProvinceChange(val || "")}>
                        <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none font-bold">
                          <SelectValue placeholder="Chọn Tỉnh/Thành" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl max-h-80">
                          {provinces.map((p) => (
                            <SelectItem key={p.code} value={p.name} className="rounded-xl font-bold">{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Quận / Huyện</Label>
                      <Select value={selectedDistrict} onValueChange={(val) => handleDistrictChange(val || "")} disabled={!selectedProvince}>
                        <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none font-bold">
                          <SelectValue placeholder="Chọn Quận/Huyện" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl max-h-80">
                          {districts.map((d) => (
                            <SelectItem key={d.code} value={d.name} className="rounded-xl font-bold">{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Phường / Xã</Label>
                      <Select value={selectedWard} onValueChange={(val) => setSelectedWard(val || "")} disabled={!selectedDistrict}>
                        <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none font-bold">
                          <SelectValue placeholder="Chọn Phường/Xã" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl max-h-80">
                          {wards.map((w) => (
                            <SelectItem key={w.code} value={w.name} className="rounded-xl font-bold">{w.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address" className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Địa chỉ cụ thể</Label>
                    <Input 
                      id="address" 
                      placeholder="Số nhà, tên đường..." 
                      className="h-14 rounded-2xl bg-gray-50 border-none font-bold focus:ring-2 focus:ring-primary/20"
                      value={detailAddress}
                      onChange={(e) => setDetailAddress(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50/40 text-xs text-blue-600 font-bold border border-blue-100/50">
                    <Truck className="h-4 w-4" /> Giao hàng nhanh từ 2-4 ngày làm việc trên toàn quốc
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Payment Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight uppercase text-[#070f2b]">Phương thức thanh toán</h2>
              </div>

              <RadioGroup 
                value={formData.paymentMethod} 
                onValueChange={(val) => setFormData({...formData, paymentMethod: val})}
                className="grid gap-4"
              >
                <div 
                  onClick={() => setFormData({...formData, paymentMethod: "COD"})}
                  className={`payment-radio-card ${formData.paymentMethod === "COD" ? "active" : ""}`}
                >
                  <RadioGroupItem value="COD" id="cod" className="sr-only" />
                  <div className="payment-icon-box">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="cod" className="text-lg font-extrabold block cursor-pointer">Thanh toán khi nhận hàng (COD)</Label>
                    <p className="text-xs text-gray-400 font-medium">Thanh toán tiền mặt trực tiếp khi shipper giao hàng</p>
                  </div>
                  {formData.paymentMethod === "COD" && <CheckCircle2 className="h-6 w-6 text-blue-600" />}
                </div>

                {publicSettings?.payment?.bankEnabled && (
                  <div 
                    onClick={() => setFormData({...formData, paymentMethod: "BANK"})}
                    className={`payment-radio-card ${formData.paymentMethod === "BANK" ? "active" : ""}`}
                  >
                    <RadioGroupItem value="BANK" id="bank" className="sr-only" />
                    <div className="payment-icon-box">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="bank" className="text-lg font-extrabold block cursor-pointer">Chuyển khoản Ngân hàng (VietQR)</Label>
                      <p className="text-xs text-gray-400 font-medium">Chuyển tiền trực tiếp bằng mã QR qua ứng dụng ngân hàng</p>
                    </div>
                    {formData.paymentMethod === "BANK" && <CheckCircle2 className="h-6 w-6 text-blue-600" />}
                  </div>
                )}
              </RadioGroup>
            </section>
          </form>

          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-blue-600 font-extrabold transition-colors hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại giỏ hàng
          </Button>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:w-96 w-full animate-fade-in-up">
          <Card className="summary-panel-card sticky top-32">
            <CardHeader className="summary-header">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Đơn hàng của bạn</CardTitle>
            </CardHeader>
            <CardContent className="summary-body space-y-6">
              <div className="max-h-[240px] overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Số lượng: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-[#070f2b] flex-shrink-0">
                      <Price amount={item.price * item.quantity} />
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                    <Input 
                        placeholder="Mã giảm giá..." 
                        className="h-12 rounded-xl bg-gray-50 border-none font-bold"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    />
                    <Button 
                        type="button"
                        onClick={handleApplyVoucher}
                        disabled={isValidatingVoucher || !voucherCode}
                        className="h-12 px-6 rounded-xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                    >
                        {isValidatingVoucher ? "..." : "ÁP DỤNG"}
                    </Button>
                </div>
                {promotion && (
                    <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
                        <Ticket className="h-4 w-4" />
                        <span>
                            {promotion.type === 'FREESHIP' 
                                ? "Đã áp dụng miễn phí vận chuyển" 
                                : `Giảm giá ${promotion.discountPercent ? `${promotion.discountPercent}%` : `${promotion.discountAmount.toLocaleString()}đ`}`}
                        </span>
                        <button type="button" onClick={() => {setPromotion(null); setAppliedVoucher("");}} className="ml-auto hover:text-red-500">
                            <XCircle className="h-4 w-4" />
                        </button>
                    </div>
                )}
                
                {/* Loyalty Points */}
                {isAuthenticated && userPoints > 0 && (
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <Star className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-orange-700">Điểm tích lũy: {userPoints.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-orange-600/70 uppercase">Giảm <Price amount={Math.min(userPoints, getTotal() + shippingFee - discountAmount)} /></p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={usePoints} onChange={() => setUsePoints(!usePoints)} />
                      <div className="w-11 h-6 bg-orange-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                )}
              </div>

              <Separator className="bg-gray-100" />

              <div className="space-y-3">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-400">Tạm tính</span>
                  <span className="text-gray-900 font-extrabold"><Price amount={items.reduce((acc, item) => acc + item.price * item.quantity, 0)} /></span>
                </div>
                {getVolumeDiscountPercent() > 0 && (
                  <div className="flex justify-between text-sm font-bold text-red-500">
                    <span className="flex items-center gap-1"><Zap className="h-4 w-4"/> Mua nhiều giảm thêm</span>
                    <span className="font-extrabold">-<Price amount={items.reduce((acc, item) => acc + item.price * item.quantity, 0) * getVolumeDiscountPercent()} /></span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-400">Phí vận chuyển</span>
                  <span className={discountAmount > 0 && promotion?.type === 'FREESHIP' ? "text-gray-400 line-through" : "text-gray-900 font-extrabold"}>
                    {shippingFee > 0 ? <Price amount={shippingFee} /> : "Miễn phí"}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-red-500">
                    <span className="">Khuyến mãi</span>
                    <span className="font-extrabold">-<Price amount={discountAmount} /></span>
                  </div>
                )}
                {usePoints && (
                  <div className="flex justify-between text-sm font-bold text-orange-500">
                    <span className="">Sử dụng điểm</span>
                    <span className="font-extrabold">-<Price amount={Math.min(userPoints, getTotal() + shippingFee - discountAmount)} /></span>
                  </div>
                )}
              </div>

              <Separator className="bg-gray-100" />

              <div className="flex justify-between items-center">
                <span className="text-lg font-black uppercase tracking-tighter">Tổng cộng</span>
                <span className="text-3xl font-black text-blue-600">
                  <Price amount={Math.max(0, getTotal() + shippingFee - discountAmount - (usePoints ? Math.min(userPoints, getTotal() + shippingFee - discountAmount) : 0))} />
                </span>
              </div>

              <div className="bg-blue-50/40 p-4 rounded-2xl flex items-center gap-3 border border-blue-50">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <p className="text-[10px] text-blue-700 font-semibold leading-tight">Thanh toán an toàn 100% với mã hóa SSL bảo mật cao cấp.</p>
              </div>
            </CardContent>
            <CardFooter className="summary-body pt-0">
              <Button 
                type="submit" 
                form="checkout-form"
                className="w-full h-16 rounded-2xl text-lg font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 hover:scale-[1.01] transition-transform" 
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Đang xử lý..." : "Xác nhận đặt hàng"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
