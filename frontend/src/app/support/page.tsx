"use client";

import { useState } from "react";
import { ChevronDown, ShieldCheck, Truck, RefreshCcw, Headphones, BookOpen } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("shipping");

  const tabs = [
    { id: "shipping", label: "Chính sách vận chuyển", icon: Truck },
    { id: "return", label: "Đổi trả & Bảo hành", icon: RefreshCcw },
    { id: "privacy", label: "Bảo mật thông tin", icon: ShieldCheck },
    { id: "guide", label: "Hướng dẫn mua hàng", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-32 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 mb-6 shadow-inner">
            <Headphones className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#070f2b] tracking-tight uppercase mb-4">
            Trung tâm hỗ trợ
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
            Chúng tôi luôn ở đây để giúp đỡ bạn. Dưới đây là các thông tin chi tiết về chính sách và hướng dẫn sử dụng dịch vụ của hệ thống.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar Tabs */}
          <div className="md:w-1/3 animate-fade-in-left">
            <div className="bg-white rounded-[2rem] p-4 shadow-xl border border-gray-100 sticky top-32">
              <nav className="flex flex-col gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-left ${
                        activeTab === tab.id
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                          : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                <h3 className="font-black text-gray-900 mb-2">Cần hỗ trợ trực tiếp?</h3>
                <p className="text-sm text-gray-500 mb-4">Chat trực tiếp với nhân viên hỗ trợ hoặc gọi hotline của chúng tôi.</p>
                <Link href="/shop">
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 shadow-sm border border-blue-100 font-bold h-12 rounded-xl">
                    Liên hệ ngay
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="md:w-2/3 animate-fade-in-right">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100 min-h-[500px]">
              
              {activeTab === "shipping" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                    <Truck className="h-10 w-10 text-blue-600" />
                    <h2 className="text-3xl font-black text-[#070f2b]">Chính sách vận chuyển</h2>
                  </div>
                  
                  <div className="prose prose-blue max-w-none text-gray-600">
                    <h3 className="text-lg font-bold text-gray-900">1. Thời gian giao hàng</h3>
                    <p>Thời gian giao hàng dự kiến phụ thuộc vào địa chỉ nhận hàng của bạn:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Khu vực nội thành Hà Nội & TP.HCM: 1-2 ngày làm việc.</li>
                      <li>Khu vực tỉnh lẻ: 3-5 ngày làm việc.</li>
                      <li>Khu vực vùng sâu vùng xa: 5-7 ngày làm việc.</li>
                    </ul>

                    <h3 className="text-lg font-bold text-gray-900 mt-6">2. Phí vận chuyển</h3>
                    <p>Chúng tôi áp dụng các mức phí vận chuyển theo khu vực:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Đồng giá 20,000đ cho đơn hàng tại Hà Nội.</li>
                      <li>Đồng giá 35,000đ cho khu vực miền Bắc.</li>
                      <li>Đồng giá 50,000đ cho các khu vực khác.</li>
                      <li className="font-bold text-green-600">Miễn phí vận chuyển cho đơn hàng có sử dụng mã FREESHIP.</li>
                    </ul>

                    <h3 className="text-lg font-bold text-gray-900 mt-6">3. Theo dõi đơn hàng</h3>
                    <p>Bạn có thể theo dõi trạng thái đơn hàng trực tiếp trong phần "Đơn hàng của tôi" sau khi đăng nhập.</p>
                  </div>
                </div>
              )}

              {activeTab === "return" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                    <RefreshCcw className="h-10 w-10 text-blue-600" />
                    <h2 className="text-3xl font-black text-[#070f2b]">Đổi trả & Bảo hành</h2>
                  </div>
                  
                  <div className="prose prose-blue max-w-none text-gray-600">
                    <h3 className="text-lg font-bold text-gray-900">1. Điều kiện đổi trả</h3>
                    <p>Sản phẩm được đổi trả trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Sản phẩm còn nguyên tem, mác, chưa qua sử dụng.</li>
                      <li>Có lỗi từ nhà sản xuất hoặc hư hỏng do vận chuyển.</li>
                      <li>Đầy đủ hộp, phụ kiện và quà tặng kèm theo (nếu có).</li>
                    </ul>

                    <h3 className="text-lg font-bold text-gray-900 mt-6">2. Chính sách bảo hành</h3>
                    <p>Tất cả sản phẩm công nghệ bán ra đều được bảo hành chính hãng từ 12 đến 24 tháng tùy loại sản phẩm. Quý khách vui lòng mang sản phẩm kèm hóa đơn đến các trung tâm bảo hành của hãng hoặc gửi về cửa hàng.</p>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                    <ShieldCheck className="h-10 w-10 text-blue-600" />
                    <h2 className="text-3xl font-black text-[#070f2b]">Bảo mật thông tin</h2>
                  </div>
                  
                  <div className="prose prose-blue max-w-none text-gray-600">
                    <h3 className="text-lg font-bold text-gray-900">1. Mục đích thu thập</h3>
                    <p>Chúng tôi chỉ thu thập thông tin của bạn nhằm mục đích xử lý đơn hàng, giao hàng và cung cấp dịch vụ hỗ trợ khách hàng tốt nhất.</p>

                    <h3 className="text-lg font-bold text-gray-900 mt-6">2. Cam kết bảo mật</h3>
                    <p>Toàn bộ thông tin cá nhân và dữ liệu thanh toán của bạn được mã hóa hoàn toàn và tuyệt đối không chia sẻ cho bên thứ ba vì mục đích thương mại.</p>
                  </div>
                </div>
              )}

              {activeTab === "guide" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                    <BookOpen className="h-10 w-10 text-blue-600" />
                    <h2 className="text-3xl font-black text-[#070f2b]">Hướng dẫn mua hàng</h2>
                  </div>
                  
                  <Accordion className="w-full">
                    <AccordionItem value="item-1" className="border-b-gray-100">
                      <AccordionTrigger className="font-bold text-gray-900 hover:text-blue-600">Làm thế nào để đặt hàng?</AccordionTrigger>
                      <AccordionContent className="text-gray-600 leading-relaxed">
                        Bạn chỉ cần tìm kiếm sản phẩm, chọn số lượng và bấm "Thêm vào giỏ" hoặc "Mua ngay". Sau đó điền thông tin địa chỉ giao hàng và chọn phương thức thanh toán.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-gray-100">
                      <AccordionTrigger className="font-bold text-gray-900 hover:text-blue-600">Tôi có thể hủy đơn hàng không?</AccordionTrigger>
                      <AccordionContent className="text-gray-600 leading-relaxed">
                        Được, bạn có thể hủy đơn hàng trong phần "Đơn hàng của tôi" nếu trạng thái đơn hàng vẫn đang ở "Chờ xử lý". Nếu đơn đã giao, vui lòng liên hệ hotline để được hỗ trợ.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-none">
                      <AccordionTrigger className="font-bold text-gray-900 hover:text-blue-600">Làm sao để áp dụng mã giảm giá?</AccordionTrigger>
                      <AccordionContent className="text-gray-600 leading-relaxed">
                        Tại trang Thanh toán, hãy nhập mã Voucher của bạn vào ô "Mã giảm giá" và bấm "Áp dụng". Hệ thống sẽ tự động trừ tiền vào tổng hóa đơn nếu mã hợp lệ.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
