"use client";

import { useState, useRef, useCallback } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  FileX,
  Loader2,
  LayoutGrid,
  Info,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface ImportError {
  row: number;
  error: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: ImportError[];
  imported: { row: number; id: number; name: string }[];
}

export default function ProductImportPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      setSelectedFile(file);
      setResult(null);
    } else {
      toast.error("Chỉ chấp nhận file Excel (.xlsx hoặc .xls)");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const blob = await adminApi.downloadImportTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "product-import-template.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Đã tải xuống file mẫu thành công!");
    } catch (err: any) {
      toast.error("Không thể tải file mẫu. Vui lòng thử lại.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setResult(null);
    try {
      const data: ImportResult = await adminApi.importProductsExcel(selectedFile);
      setResult(data);
      if (data.success > 0) {
        toast.success(`Import thành công ${data.success} sản phẩm!`);
      }
      if (data.failed > 0) {
        toast.warning(`${data.failed} dòng bị lỗi, vui lòng kiểm tra bên dưới.`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi import. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin" className="hover:text-white transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/admin/catalog" className="hover:text-white transition-colors">
          Sản phẩm
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white font-medium">Import từ Excel</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Import Sản phẩm từ Excel</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Nhập hàng loạt sản phẩm nhanh chóng bằng file Excel
            </p>
          </div>
        </div>
        <Link
          href="/admin/catalog"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-sm border border-slate-700"
        >
          <LayoutGrid className="w-4 h-4" />
          Về danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Hướng dẫn + Download template */}
        <div className="lg:col-span-1 space-y-4">
          {/* Step 1: Tải template */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-sm font-bold">
                1
              </span>
              <h2 className="text-white font-semibold">Tải file mẫu</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              Tải xuống file Excel mẫu để biết đúng định dạng cần nhập. File mẫu chứa hướng dẫn chi tiết và dữ liệu ví dụ.
            </p>
            <button
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-medium transition-all shadow-lg shadow-blue-500/20 text-sm"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloading ? "Đang tải..." : "Tải file mẫu (.xlsx)"}
            </button>
          </div>

          {/* Step 2: Điền dữ liệu */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center text-sm font-bold">
                2
              </span>
              <h2 className="text-white font-semibold">Điền dữ liệu</h2>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { key: "name", label: "name", req: true, desc: "Tên sản phẩm" },
                { key: "price", label: "price", req: true, desc: "Giá gốc (VNĐ)" },
                { key: "description", label: "description", req: true, desc: "Mô tả chi tiết" },
                { key: "stock", label: "stock", req: true, desc: "Số lượng tồn kho" },
                { key: "categoryId", label: "categoryId", req: true, desc: "ID danh mục" },
                { key: "images", label: "images", req: false, desc: "URL ảnh, cách nhau bằng '|'" },
                { key: "isFlashSale", label: "isFlashSale", req: false, desc: "TRUE hoặc FALSE" },
                { key: "flashSalePrice", label: "flashSalePrice", req: false, desc: "Giá Flash Sale" },
                { key: "attributes", label: "attributes", req: false, desc: "JSON string" },
              ].map((col) => (
                <div key={col.key} className="flex items-start gap-2">
                  <span
                    className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      col.req
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-slate-600/50 text-slate-400 border border-slate-600"
                    }`}
                  >
                    {col.req ? "BẮT BUỘC" : "TUỲ CHỌN"}
                  </span>
                  <div>
                    <code className="text-emerald-400 text-xs">{col.label}</code>
                    <span className="text-slate-500 text-xs ml-1">— {col.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lưu ý */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-amber-300 font-semibold text-sm">Lưu ý quan trọng</span>
            </div>
            <ul className="space-y-1.5 text-amber-200/70 text-xs leading-relaxed">
              <li>• <strong>categoryId</strong> phải là số ID hợp lệ trong hệ thống (xem trang Danh mục)</li>
              <li>• Nếu <strong>isFlashSale = TRUE</strong> thì phải điền <strong>flashSalePrice</strong></li>
              <li>• <strong>flashSalePrice</strong> phải nhỏ hơn <strong>price</strong></li>
              <li>• Nhiều URL ảnh phân cách bởi dấu <code className="bg-black/20 px-1 rounded">|</code></li>
              <li>• File import chỉ hỗ trợ định dạng <strong>.xlsx</strong> và <strong>.xls</strong></li>
              <li>• Dữ liệu cũ KHÔNG bị xóa, chỉ thêm mới sản phẩm</li>
            </ul>
          </div>
        </div>

        {/* Right: Upload + Kết quả */}
        <div className="lg:col-span-2 space-y-5">
          {/* Step 3: Upload */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-sm font-bold">
                3
              </span>
              <h2 className="text-white font-semibold">Upload file & Bắt đầu Import</h2>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                isDragging
                  ? "border-emerald-400 bg-emerald-500/10"
                  : selectedFile
                  ? "border-emerald-500/50 bg-emerald-500/5 cursor-default"
                  : "border-slate-600 hover:border-slate-400 hover:bg-slate-700/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto">
                    <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{selectedFile.name}</p>
                    <p className="text-slate-400 text-sm mt-1">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setResult(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors underline"
                  >
                    Xoá file, chọn file khác
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Kéo thả file vào đây hoặc{" "}
                      <span className="text-blue-400 underline">chọn file</span>
                    </p>
                    <p className="text-slate-500 text-sm mt-1">Hỗ trợ .xlsx và .xls</p>
                  </div>
                </div>
              )}
            </div>

            {/* Import button */}
            <button
              onClick={handleImport}
              disabled={!selectedFile || isUploading}
              className={`w-full mt-4 flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-base transition-all ${
                selectedFile && !isUploading
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang import sản phẩm...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Bắt đầu Import
                </>
              )}
            </button>
          </div>

          {/* Kết quả import */}
          {result && (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg">Kết quả Import</h3>
                <button
                  onClick={() => { setResult(null); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Import lại
                </button>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
                  <div className="text-slate-400 text-xs mb-1">Tổng dòng</div>
                  <div className="text-2xl font-bold text-white">{result.success + result.failed}</div>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
                  <div className="text-emerald-400 text-xs mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Thành công
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">{result.success}</div>
                </div>
                <div className={`rounded-xl p-4 border ${result.failed > 0 ? "bg-red-500/10 border-red-500/30" : "bg-slate-900/60 border-slate-700/50"}`}>
                  <div className={`text-xs mb-1 flex items-center gap-1 ${result.failed > 0 ? "text-red-400" : "text-slate-400"}`}>
                    <XCircle className="w-3 h-3" /> Thất bại
                  </div>
                  <div className={`text-2xl font-bold ${result.failed > 0 ? "text-red-400" : "text-slate-400"}`}>{result.failed}</div>
                </div>
              </div>

              {/* Danh sách import thành công */}
              {result.imported && result.imported.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Đã thêm thành công ({result.imported.length} sản phẩm)
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                    {result.imported.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-emerald-400/60 text-xs shrink-0">Dòng {item.row}</span>
                          <span className="text-white text-sm truncate">{item.name}</span>
                        </div>
                        <Link
                          href={`/admin/catalog/${item.id}`}
                          className="shrink-0 text-xs text-blue-400 hover:text-blue-300 ml-2"
                        >
                          ID #{item.id}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Danh sách lỗi */}
              {result.errors && result.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Các dòng bị lỗi ({result.errors.length} dòng)
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                    {result.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                      >
                        <div className="shrink-0 flex items-center gap-1 mt-0.5">
                          <FileX className="w-3.5 h-3.5 text-red-400" />
                          <span className="text-red-400 text-xs font-medium whitespace-nowrap">Dòng {err.row}</span>
                        </div>
                        <p className="text-red-200/80 text-xs leading-relaxed">{err.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All success banner */}
              {result.failed === 0 && result.success > 0 && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-emerald-300 font-semibold">Import hoàn tất!</p>
                    <p className="text-emerald-400/70 text-sm">Tất cả {result.success} sản phẩm đã được thêm vào hệ thống.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
