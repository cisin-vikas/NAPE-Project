import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { ArrowDownTrayIcon, ChevronDownIcon } from './icons';
import jsPDF from 'jspdf';
// FIX: Use functional import for `jspdf-autotable` which is more reliable with module bundlers.
import autoTable from 'jspdf-autotable';

interface ExportButtonProps {
  analysisData: AnalysisResult;
}

const ExportButton: React.FC<ExportButtonProps> = ({ analysisData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const escapeCsvCell = (cellData: string) => {
    if (!cellData) return '""';
    // If the cell data contains a comma, double quote, or newline, wrap it in double quotes
    if (/[",\n]/.test(cellData)) {
      // and escape any existing double quotes by doubling them
      return `"${cellData.replace(/"/g, '""')}"`;
    }
    return cellData;
  };

  const handleExportCSV = () => {
    const {
      projectId, projectName, asOfDate, projectedCompletionDate, projectStatus,
      confidenceLevel, rawCompletionPercent, adjustedCompletionPercent,
      justification, topRisks, recommendations, diagnostics
    } = analysisData;

    const rows = [
      ['Project Analysis Report'],
      [],
      ['Project Name', projectName],
      ['Project ID', projectId],
      ['Analysis Date', asOfDate],
      [],
      ['--SUMMARY--'],
      ['Project Status', projectStatus],
      ['Confidence Level', confidenceLevel],
      ['Projected Completion Date', projectedCompletionDate],
      ['Raw Completion', `${(rawCompletionPercent * 100).toFixed(1)}%`],
      ['Adjusted Completion', `${(adjustedCompletionPercent * 100).toFixed(1)}%`],
      [],
      ['--JUSTIFICATION--'],
      [justification],
      [],
      ['--TOP RISKS--'],
      ['Risk', 'Details'],
      ...topRisks.map(r => [r.risk, r.details]),
      [],
      ['--RECOMMENDATIONS--'],
      ['Action', 'Details'],
      ...recommendations.map(r => [r.action, r.details]),
      [],
      ['--DIAGNOSTICS--'],
      ['Missing Data', diagnostics.missing.join('; ')],
      ['Assumptions Made', diagnostics.assumptions.join('; ')],
      ['Suggested Data to Collect', diagnostics.suggestedData.join('; ')],
    ];

    const csvContent = "data:text/csv;charset=utf-8," +
      rows.map(e => e.map(escapeCsvCell).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NAPE_Analysis_${projectName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    const {
      projectName, asOfDate, projectedCompletionDate, projectStatus,
      confidenceLevel, rawCompletionPercent, adjustedCompletionPercent,
      justification, topRisks, recommendations, diagnostics
    } = analysisData;

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.text(`Project Analysis Report: ${projectName}`, 14, y);
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Analysis as of: ${new Date(asOfDate).toLocaleDateString()}`, 14, y);
    y += 15;

    // Summary
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Summary', 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`- Status: ${projectStatus} (Confidence: ${confidenceLevel})`, 16, y);
    y += 6;
    doc.text(`- Projected Completion: ${new Date(projectedCompletionDate).toLocaleDateString()}`, 16, y);
    y += 6;
    doc.text(`- Completion: ${(adjustedCompletionPercent * 100).toFixed(1)}% Adjusted (vs. ${(rawCompletionPercent * 100).toFixed(1)}% Raw)`, 16, y);
    y += 10;
    
    // Justification
    doc.setFontSize(12);
    doc.text('Justification', 14, y);
    y += 6;
    doc.setFontSize(10);
    const justificationLines = doc.splitTextToSize(justification, 180);
    doc.text(justificationLines, 16, y);
    y += (justificationLines.length * 5) + 5;


    const checkPageBreak = (spaceNeeded: number) => {
        if (y + spaceNeeded > pageHeight - 20) {
            doc.addPage();
            y = 20;
        }
    }
    
    // Risks Table
    checkPageBreak(30);
    // FIX: Changed from `doc.autoTable` to functional call `autoTable(doc, ...)` to fix 'autoTable' does not exist error.
    autoTable(doc, {
        startY: y,
        head: [['Top Risks', 'Details']],
        body: topRisks.map(r => [r.risk, r.details]),
        theme: 'striped',
        headStyles: { fillColor: [218, 54, 51] }, // status-red
    });
    // FIX: Cast `doc` to `any` to access `lastAutoTable`. This is necessary due to type augmentation issues with jspdf-autotable in some environments.
    y = (doc as any).lastAutoTable.finalY! + 10;

    // Recommendations Table
    checkPageBreak(30);
    // FIX: Changed from `doc.autoTable` to functional call `autoTable(doc, ...)` to fix 'autoTable' does not exist error.
    autoTable(doc, {
        startY: y,
        head: [['Recommendations', 'Details']],
        body: recommendations.map(r => [r.action, r.details]),
        theme: 'striped',
        headStyles: { fillColor: [88, 166, 255] }, // brand-primary
    });
    // FIX: Cast `doc` to `any` for the same reason as above to fix 'lastAutoTable' does not exist error.
    y = (doc as any).lastAutoTable.finalY! + 10;

    // Diagnostics
    checkPageBreak(40);
    doc.setFontSize(12);
    doc.text('Diagnostics', 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`Missing Data: ${diagnostics.missing.length > 0 ? diagnostics.missing.join(', ') : 'None'}`, 16, y);
    y += 6;
    doc.text(`Assumptions: ${diagnostics.assumptions.length > 0 ? diagnostics.assumptions.join('; ') : 'None'}`, 16, y);
    y += 6;
    doc.text(`Suggested Data: ${diagnostics.suggestedData.length > 0 ? diagnostics.suggestedData.join(', ') : 'None'}`, 16, y);
    
    doc.save(`NAPE_Analysis_${projectName.replace(/\s+/g, '_')}.pdf`);
    setIsOpen(false);
  };


  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-brand-surface border border-brand-border text-brand-secondary font-semibold rounded-md shadow-sm hover:border-brand-primary disabled:bg-brand-muted disabled:cursor-not-allowed transition-colors duration-200 ease-in-out"
      >
        <ArrowDownTrayIcon className="h-5 w-5" />
        <span>Export</span>
        <ChevronDownIcon className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-brand-surface border border-brand-border rounded-md shadow-lg z-10 animate-fade-in">
          <ul className="py-1">
            <li>
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-2 text-sm text-brand-secondary hover:bg-brand-primary hover:text-white"
              >
                Export as CSV
              </button>
            </li>
            <li>
              <button
                onClick={handleExportPDF}
                className="w-full text-left px-4 py-2 text-sm text-brand-secondary hover:bg-brand-primary hover:text-white"
              >
                Export as PDF
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExportButton;