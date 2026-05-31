import React from 'react';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationControlsProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function PaginationControls({ total, page, limit, onPageChange, onLimitChange }: PaginationControlsProps) {
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between py-4 px-6 border-t border-gray-100 bg-white gap-4">
      {/* Total items */}
      <div className="text-sm font-bold text-primary flex-1">
        Tổng số: {total}
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1 md:gap-2 justify-center flex-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-md bg-white border-gray-200"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-md bg-white border-gray-200"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="mx-2 flex items-center">
          <Select value={page.toString()} onValueChange={(val) => onPageChange(Number(val))}>
            <SelectTrigger className="h-8 w-24 rounded-md border-gray-200 bg-white text-sm font-bold text-primary text-center flex justify-center gap-1">
              <SelectValue placeholder={`Trang ${page}`} />
            </SelectTrigger>
            <SelectContent className="max-h-48 rounded-xl">
              {Array.from({ length: totalPages }).map((_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Trang {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-md bg-white border-gray-200"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-md bg-white border-gray-200"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Page size */}
      <div className="flex items-center gap-2 justify-end flex-1">
        <span className="text-sm font-bold text-primary">Hiển thị</span>
        <Select value={limit.toString()} onValueChange={(val) => onLimitChange(Number(val))}>
          <SelectTrigger className="h-8 w-20 rounded-md border-gray-200 bg-white text-sm font-bold text-primary">
            <SelectValue placeholder={limit.toString()} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
