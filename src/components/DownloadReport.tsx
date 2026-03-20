import { Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DownloadReportProps {
  userId: string;
  stats: {
    totalIncome: number;
    totalExpenses: number;
    totalAssets: number;
    goalsCount: number;
  };
  netWorth: number;
}

export default function DownloadReport({ userId, stats, netWorth }: DownloadReportProps) {
  const transliterate = (text: string): string => {
    const map: { [key: string]: string } = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
      'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
      'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
      'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
      'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '',
      'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
    };

    return text.split('').map(char => map[char] || char).join('');
  };

  const generateReport = async () => {
    try {
      const [goalsData, incomeData, expensesData, assetsData] = await Promise.all([
        supabase.from('financial_goals').select('*').eq('user_id', userId),
        supabase.from('income').select('*').eq('user_id', userId),
        supabase.from('expenses').select('*').eq('user_id', userId),
        supabase.from('assets').select('*').eq('user_id', userId),
      ]);

      const savingsRate = stats.totalIncome > 0
        ? ((stats.totalIncome - stats.totalExpenses) / stats.totalIncome * 100).toFixed(1)
        : 0;

      const netIncome = stats.totalIncome - stats.totalExpenses;

      const doc = new jsPDF();
      let yPos = 20;

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('FINANCIAL REPORT', 105, yPos, { align: 'center' });

      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Date: ${new Date().toLocaleDateString('en-GB')}`, 105, yPos, { align: 'center' });

      yPos += 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('OVERALL STATISTICS', 14, yPos);

      yPos += 7;
      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: [
          ['Net Worth', `£${netWorth.toLocaleString('en-GB')}`],
          ['Net Income', `£${netIncome.toLocaleString('en-GB')}`],
          ['Savings Rate', `${savingsRate}%`],
          ['Total Income', `£${stats.totalIncome.toLocaleString('en-GB')}`],
          ['Total Expenses', `£${stats.totalExpenses.toLocaleString('en-GB')}`],
          ['Total Assets', `£${stats.totalAssets.toLocaleString('en-GB')}`],
          ['Financial Goals', `${stats.goalsCount}`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], fontSize: 11, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`FINANCIAL GOALS (${goalsData.data?.length || 0})`, 14, yPos);

      yPos += 7;
      if (goalsData.data && goalsData.data.length > 0) {
        const goalsTableData = goalsData.data.map((goal) => {
          const progress = (goal.current_amount / goal.target_amount * 100).toFixed(1);
          const remaining = goal.target_amount - goal.current_amount;
          return [
            transliterate(goal.title),
            `${progress}%`,
            `£${goal.current_amount.toLocaleString('en-GB')}`,
            `£${goal.target_amount.toLocaleString('en-GB')}`,
            `£${remaining.toLocaleString('en-GB')}`,
            new Date(goal.deadline).toLocaleDateString('en-GB'),
          ];
        });

        autoTable(doc, {
          startY: yPos,
          head: [['Goal', 'Progress', 'Current', 'Target', 'Remaining', 'Deadline']],
          body: goalsTableData,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontSize: 10, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No goals defined', 14, yPos);
        yPos += 15;
      }

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`INCOME (${incomeData.data?.length || 0})`, 14, yPos);
      doc.setFontSize(11);
      doc.text(`Total Amount: £${stats.totalIncome.toLocaleString('en-GB')}`, 14, yPos + 6);

      yPos += 13;
      if (incomeData.data && incomeData.data.length > 0) {
        const incomeTableData = incomeData.data.map((income) => [
          transliterate(income.source),
          `£${Number(income.amount).toLocaleString('en-GB')}`,
          transliterate(income.category),
          new Date(income.date).toLocaleDateString('en-GB'),
          income.is_recurring ? 'Recurring' : 'One-time',
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Source', 'Amount', 'Category', 'Date', 'Type']],
          body: incomeTableData,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129], fontSize: 10, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No income data', 14, yPos);
        yPos += 15;
      }

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`EXPENSES (${expensesData.data?.length || 0})`, 14, yPos);
      doc.setFontSize(11);
      doc.text(`Total Amount: £${stats.totalExpenses.toLocaleString('en-GB')}`, 14, yPos + 6);

      yPos += 13;
      if (expensesData.data && expensesData.data.length > 0) {
        const categorySums: { [key: string]: number } = {};
        expensesData.data.forEach((expense) => {
          const amount = Number(expense.amount);
          categorySums[expense.category] = (categorySums[expense.category] || 0) + amount;
        });

        const categoryTableData = Object.entries(categorySums).map(([category, amount]) => {
          const percentage = ((amount / stats.totalExpenses) * 100).toFixed(1);
          return [transliterate(category), `£${amount.toLocaleString('en-GB')}`, `${percentage}%`];
        });

        autoTable(doc, {
          startY: yPos,
          head: [['Category', 'Amount', 'Share']],
          body: categoryTableData,
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68], fontSize: 10, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Expense Details', 14, yPos);
        yPos += 7;

        const expensesTableData = expensesData.data.map((expense) => [
          transliterate(expense.title),
          `£${Number(expense.amount).toLocaleString('en-GB')}`,
          transliterate(expense.category),
          new Date(expense.date).toLocaleDateString('en-GB'),
          expense.is_recurring ? 'Recurring' : 'One-time',
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Title', 'Amount', 'Category', 'Date', 'Type']],
          body: expensesTableData,
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68], fontSize: 10, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No expense data', 14, yPos);
        yPos += 15;
      }

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`ASSETS (${assetsData.data?.length || 0})`, 14, yPos);
      doc.setFontSize(11);
      doc.text(`Total Value: £${stats.totalAssets.toLocaleString('en-GB')}`, 14, yPos + 6);

      yPos += 13;
      if (assetsData.data && assetsData.data.length > 0) {
        const typeSums: { [key: string]: number } = {};
        assetsData.data.forEach((asset) => {
          const value = Number(asset.value);
          typeSums[asset.type] = (typeSums[asset.type] || 0) + value;
        });

        const typeTableData = Object.entries(typeSums).map(([type, value]) => {
          const percentage = ((value / stats.totalAssets) * 100).toFixed(1);
          return [transliterate(type), `£${value.toLocaleString('en-GB')}`, `${percentage}%`];
        });

        autoTable(doc, {
          startY: yPos,
          head: [['Type', 'Value', 'Share']],
          body: typeTableData,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontSize: 10, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Asset Details', 14, yPos);
        yPos += 7;

        const assetsTableData = assetsData.data.map((asset) => [
          transliterate(asset.name),
          `£${Number(asset.value).toLocaleString('en-GB')}`,
          transliterate(asset.type),
          asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString('en-GB') : '-',
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Name', 'Value', 'Type', 'Purchase Date']],
          body: assetsTableData,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontSize: 10, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No asset data', 14, yPos);
        yPos += 15;
      }

      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RECOMMENDATIONS', 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const recommendations = [];
      if (stats.totalIncome === 0) recommendations.push('- Add income sources to create a comprehensive financial plan.');
      if (stats.totalExpenses === 0) recommendations.push('- Track your expenses for better budget analysis.');
      if (stats.goalsCount === 0) recommendations.push('- Set financial goals for motivation and planning.');
      if (stats.totalAssets === 0) recommendations.push('- Add asset information to calculate your net worth.');
      if (savingsRate && Number(savingsRate) < 10) recommendations.push('- Low savings rate. Aim to save at least 10-20% of your income.');
      if (savingsRate && Number(savingsRate) >= 20) recommendations.push('- Excellent savings rate! Keep up the good work.');
      if (netIncome < 0) recommendations.push('- WARNING: Expenses exceed income! Review your budget immediately.');
      if (netIncome > 0 && stats.goalsCount > 0) recommendations.push('- You have surplus income and goals. Allocate funds towards achieving them.');

      if (recommendations.length > 0) {
        recommendations.forEach((rec) => {
          const lines = doc.splitTextToSize(rec, 180);
          lines.forEach((line: string) => {
            if (yPos > 280) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, 14, yPos);
            yPos += 6;
          });
        });
      } else {
        doc.text('No recommendations at this time', 14, yPos);
      }

      yPos += 10;
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Создано в FinancePlan', 105, yPos, { align: 'center' });

      doc.save(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report');
    }
  };

  return (
    <button
      onClick={generateReport}
      className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg text-sm sm:text-base whitespace-nowrap"
    >
      <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
      <span className="hidden xs:inline">Скачать отчет</span>
      <span className="xs:hidden">Отчет</span>
    </button>
  );
}
