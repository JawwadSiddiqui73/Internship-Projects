import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  FileText, 
  Download, 
  Calendar, 
  ArrowRight, 
  PieChart, 
  Activity,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { api } from "../lib/api";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-hot-toast";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    fetchReport();
  }, [month]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await api.reports.getMonthly(month);
      setReportData(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!reportData) return;
    const headers = ["Date", "Type", "Category", "Amount", "Description"];
    const rows = reportData.transactions.map((t: any) => [
      t.date,
      t.type,
      t.category,
      t.amount,
      t.description
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map((e: any) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WealthFlow_Report_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (!reportData) return;
    const doc = new jsPDF() as any;
    
    doc.setFontSize(20);
    doc.text("WealthFlow Monthly Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Month: ${month}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

    doc.setFontSize(14);
    doc.text("Financial Summary", 14, 50);
    doc.setFontSize(11);
    doc.text(`Total Income: $${reportData.income.toLocaleString()}`, 14, 60);
    doc.text(`Total Expenses: $${reportData.expenses.toLocaleString()}`, 14, 66);
    doc.text(`Net Savings: $${reportData.savings.toLocaleString()}`, 14, 72);

    autoTable(doc, {
      startY: 85,
      head: [["Date", "Type", "Category", "Amount", "Description"]],
      body: reportData.transactions.map((t: any) => [
        t.date,
        t.type,
        t.category,
        `$${t.amount.toLocaleString()}`,
        t.description || ""
      ]),
    });

    doc.save(`WealthFlow_Report_${month}.pdf`);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Financial Reports</h1>
          <p className="text-slate-400 font-medium">Analyze and export your monthly financial performance.</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="month" 
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="glass px-6 py-3 rounded-2xl text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button 
            onClick={exportCSV}
            disabled={!reportData}
            className="glass flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-xs hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <Download size={16} />
            CSV
          </button>
          <button 
            onClick={exportPDF}
            disabled={!reportData}
            className="accent-gradient flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-xs shadow-xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <FileText size={16} />
            PDF
          </button>
        </div>
      </header>

      {loading ? (
        <div className="glass rounded-[3rem] p-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Generating Report...</p>
        </div>
      ) : reportData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 rounded-[2.5rem] border border-white/5 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 group-hover:scale-110 transition-transform">
                  <ArrowUpRight size={80} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Income</p>
                <p className="text-3xl font-black text-white tracking-tighter">${reportData.income.toLocaleString()}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-8 rounded-[2.5rem] border border-white/5 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 group-hover:scale-110 transition-transform text-rose-500">
                  <Activity size={80} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Expenses</p>
                <p className="text-3xl font-black text-white tracking-tighter">${reportData.expenses.toLocaleString()}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-8 rounded-[2.5rem] border border-white/5 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 group-hover:scale-110 transition-transform text-emerald-500">
                  <PieChart size={80} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Net Savings</p>
                <p className={cn("text-3xl font-black tracking-tighter", reportData.savings >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  ${reportData.savings.toLocaleString()}
                </p>
              </motion.div>
            </div>

            <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Transactions Ledger</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {(reportData.transactions || []).map((t: any) => (
                      <tr key={t.id} className="group hover:bg-white/[0.01] transition-colors">
                        <td className="px-8 py-6 font-medium text-slate-400 font-mono text-xs">{t.date}</td>
                        <td className="px-8 py-6 text-white font-bold">{t.category}</td>
                        <td className={cn("px-8 py-6 font-black", t.type === 'income' ? 'text-emerald-400' : 'text-white')}>
                          {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            t.type === 'income' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          )}>
                            {t.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8 ml-1">Spending by Category</h3>
              <div className="space-y-6">
                {Object.entries(reportData.categoryBreakdown || {}).sort((a: any, b: any) => b[1] - a[1]).map(([cat, val]: [any, any]) => (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-widest">{cat}</span>
                      <span className="text-white font-black">${val.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(val / reportData.expenses) * 100}%` }}
                        className="h-full accent-gradient"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8 ml-1">Habit Performance</h3>
              <div className="space-y-6">
                {(reportData.habits || []).map((h: any) => (
                  <div key={h.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        h.completions > 20 ? "bg-emerald-400" : h.completions > 10 ? "bg-amber-400" : "bg-rose-400"
                      )} />
                      <span className="text-slate-300 font-medium text-sm">{h.name}</span>
                    </div>
                    <span className="text-white font-black text-xs">{h.completions} checks</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass p-24 rounded-[3rem] text-center">
          <p className="text-slate-500 font-medium italic">No data detected for this temporal selector.</p>
        </div>
      )}
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
