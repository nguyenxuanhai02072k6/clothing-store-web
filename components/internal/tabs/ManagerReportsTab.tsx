'use client';

import React, { useState } from 'react';

export interface ManagerReportsTabProps {
  submitDailyReport: (title: string, content: string) => void;
}

export default function ManagerReportsTab({ submitDailyReport }: ManagerReportsTabProps) {
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');

  return (
    <div>
      <h3 className="text-lg font-black text-neutral-950 tracking-tight mb-2 uppercase">Báo cáo tình hình vận hành chi nhánh</h3>
      <p className="text-xs text-neutral-400 mb-8">Soạn và gửi báo cáo quyết toán doanh số, nhân sự cuối ngày hôm nay gửi Ban giám đốc đối chiếu.</p>

      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm max-w-xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (reportTitle && reportContent) {
              submitDailyReport(reportTitle, reportContent);
              setReportTitle('');
              setReportContent('');
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 block mb-1">Tiêu đề báo cáo vận hành</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Báo cáo vận hành & doanh số 29/05 - Chi nhánh Quận 1"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white font-semibold text-neutral-800"
            />
          </div>
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 block mb-1">Nội dung báo cáo cụ thể</label>
            <textarea
              required
              rows={6}
              placeholder="Báo cáo chi tiết về: doanh số hôm nay, lượng khách tham quan, các khiếu nại CSKH, tình hình đi làm chấm công của nhân sự chi nhánh..."
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white resize-none font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-850 active:scale-95 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Gửi báo cáo lên Giám đốc
          </button>
        </form>
      </div>
    </div>
  );
}
