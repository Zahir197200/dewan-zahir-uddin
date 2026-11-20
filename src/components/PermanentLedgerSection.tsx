import { useState } from 'react';
import {
  Columns,
  Download,
  FilePlus2,
  FileSpreadsheet,
  FunctionSquare,
  Minus,
  Pencil,
  Plus,
  Printer,
  Trash2,
  Undo2,
  Users,
} from 'lucide-react';
import type { CustomerLead, LedgerTable } from '../types/appTypes';
import {
  columnIndexToLetter,
  evaluateCellDisplay,
  toBengaliDigits,
} from '../utils/formulaEngine';

interface PermanentLedgerSectionProps {
  tables: LedgerTable[];
  activeTableId: string;
  onSelectTable: (id: string) => void;
  onCreateSeparateTable: () => void;
  onDeleteTable: (id: string) => void;
  onRenameTable: (tableId: string, newName: string) => void;
  onUpdateCell: (
    tableId: string,
    rowId: string,
    colId: string,
    value: string
  ) => void;
  onUpdateColumnLabel: (tableId: string, colId: string, label: string) => void;
  onAddRow: (tableId: string) => void;
  onRemoveRow: (tableId: string, rowId?: string) => void;
  onAddColumn: (tableId: string) => void;
  onRemoveColumn: (tableId: string) => void;
  selectedCell: { tableId: string; rowIdx: number; colIdx: number } | null;
  onSelectCell: (cell: { tableId: string; rowIdx: number; colIdx: number }) => void;
  showFormulaBar: boolean;
  onToggleFormulaBar: () => void;
  canUndo: boolean;
  onUndo: () => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  leads: CustomerLead[];
  onPrintTable: (tableId: string) => void;
}

export function PermanentLedgerSection({
  tables,
  activeTableId,
  onSelectTable,
  onCreateSeparateTable,
  onDeleteTable,
  onRenameTable,
  onUpdateCell,
  onUpdateColumnLabel,
  onAddRow,
  onRemoveRow,
  onAddColumn,
  onRemoveColumn,
  selectedCell,
  onSelectCell,
  showFormulaBar,
  onToggleFormulaBar,
  canUndo,
  onUndo,
  isEditMode,
  onToggleEditMode,
  leads,
  onPrintTable,
}: PermanentLedgerSectionProps) {
  const [editingCol, setEditingCol] = useState<{
    tableId: string;
    colId: string;
  } | null>(null);
  const [colDraft, setColDraft] = useState('');
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [tableNameDraft, setTableNameDraft] = useState('');
  const [showLeads, setShowLeads] = useState(false);

  const handleExportCsv = (table: LedgerTable) => {
    const headers = table.columns.map((c) => `"${c.label}"`).join(',');
    const csvRows = table.rows.map((r) =>
      table.columns
        .map((c) => {
          const val = evaluateCellDisplay(
            r.cells[c.id],
            table.rows,
            table.columns
          ).display;
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = '\uFEFF' + [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${table.name}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const insertFormulaIntoTable = (
    table: LedgerTable,
    type: 'sum' | 'sub' | 'mul' | 'avg'
  ) => {
    const cellTarget =
      selectedCell && selectedCell.tableId === table.id
        ? selectedCell
        : { tableId: table.id, rowIdx: table.rows.length - 1, colIdx: 1 };

    const targetRow = table.rows[cellTarget.rowIdx] || table.rows[0];
    const targetCol = table.columns[cellTarget.colIdx] || table.columns[1];
    if (!targetRow || !targetCol) return;

    const colIdx = table.columns.findIndex((c) => c.id === targetCol.id);
    const colLetter = columnIndexToLetter(colIdx >= 0 ? colIdx : 1);
    const rowNum =
      table.rows.findIndex((r) => r.id === targetRow.id) + 1 || 1;

    let formula = '';
    if (type === 'sum') {
      const endRow = Math.max(1, rowNum - 1);
      formula = `=SUM(${colLetter}1:${colLetter}${endRow})`;
    } else if (type === 'avg') {
      const endRow = Math.max(1, rowNum - 1);
      formula = `=AVG(${colLetter}1:${colLetter}${endRow})`;
    } else if (type === 'sub') {
      const c1 = columnIndexToLetter(Math.max(0, colIdx - 2));
      const c2 = columnIndexToLetter(Math.max(0, colIdx - 1));
      formula = `=${c1}${rowNum}-${c2}${rowNum}`;
    } else if (type === 'mul') {
      const c1 = columnIndexToLetter(Math.max(0, colIdx - 2));
      const c2 = columnIndexToLetter(Math.max(0, colIdx - 1));
      formula = `=${c1}${rowNum}*${c2}${rowNum}`;
    }

    onUpdateCell(table.id, targetRow.id, targetCol.id, formula);
  };

  return (
    <section
      id="ledger"
      className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-200/80 print:hidden"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-10">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#047857] mb-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span>স্থায়ী হিসাব ঘর ও ডিজিটাল খাতা</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F2942] tracking-tight leading-tight">
              প্রতিটি হিসাব টেবিল আলাদা আলাদাভাবে সংরক্ষণ ও পরিচালনা করুন
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onCreateSeparateTable}
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg cursor-pointer whitespace-nowrap"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>নতুন আলাদা হিসাব ঘর খুলুন</span>
            </button>

            <button
              type="button"
              onClick={onToggleEditMode}
              className={`inline-flex items-center gap-2 min-h-[42px] px-4 py-2 text-sm font-semibold rounded-lg border cursor-pointer whitespace-nowrap ${
                isEditMode
                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Pencil className="w-4 h-4" />
              <span>{isEditMode ? 'সংশোধন চালু' : 'সংশোধন'}</span>
            </button>

            {canUndo && (
              <button
                type="button"
                onClick={onUndo}
                className="inline-flex items-center gap-1.5 min-h-[42px] px-3.5 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer whitespace-nowrap"
              >
                <Undo2 className="w-4 h-4 text-[#1D4ED8]" />
                <span>পূর্বাবস্থা</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowLeads((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 min-h-[42px] px-3.5 py-2 text-sm font-medium border rounded-lg cursor-pointer whitespace-nowrap ${
                showLeads
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>গ্রাহক আবেদন ({toBengaliDigits(leads.length)})</span>
            </button>
          </div>
        </div>

        {/* Optional Customer Leads Drawer inside Permanent Workspace */}
        {showLeads && (
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                ওয়েবসাইট ফরম থেকে আসা গ্রাহকদের আবেদন তালিকা
              </h3>
              <button
                type="button"
                onClick={() => setShowLeads(false)}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
            {leads.length === 0 ? (
              <p className="text-sm text-slate-500">
                এখনো কোনো গ্রাহক আবেদন জমা হয়নি। নিচের যোগাযোগ ফরম পূরণ করলে এখানে তালিকা দেখা যাবে।
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {lead.name} ·{' '}
                        <span className="text-[#1D4ED8] tabular-nums">
                          {lead.phone}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {lead.service} · {lead.createdAt}
                      </div>
                      <p className="text-sm text-slate-700 mt-1.5">
                        {lead.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Render Every Accounting Table as its Own Separate, Independent Ledger Box */}
        <div className="space-y-8">
          {tables.map((table, tableIdx) => {
            const isActiveTable = table.id === activeTableId;
            const tableCell =
              selectedCell && selectedCell.tableId === table.id
                ? selectedCell
                : { tableId: table.id, rowIdx: 0, colIdx: 1 };

            const activeRow =
              table.rows[tableCell.rowIdx] || table.rows[0];
            const activeCol =
              table.columns[tableCell.colIdx] || table.columns[1];

            const activeCellRef = activeCol
              ? `${columnIndexToLetter(
                  Math.max(0, table.columns.indexOf(activeCol))
                )}${Math.max(1, table.rows.indexOf(activeRow) + 1)}`
              : 'A1';

            const activeRawValue =
              activeRow && activeCol ? activeRow.cells[activeCol.id] ?? '' : '';

            return (
              <div
                key={table.id}
                onClick={() => onSelectTable(table.id)}
                className={`rounded-xl bg-white overflow-hidden transition-colors ${
                  isActiveTable
                    ? 'border-2 border-[#1D4ED8]'
                    : 'border border-slate-200'
                }`}
              >
                {/* Separate Table Card Header */}
                <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 tabular-nums">
                      খাতা #{toBengaliDigits(tableIdx + 1)}
                    </span>

                    {editingTableId === table.id ? (
                      <input
                        type="text"
                        value={tableNameDraft}
                        onChange={(e) => setTableNameDraft(e.target.value)}
                        onBlur={() => {
                          if (tableNameDraft.trim()) {
                            onRenameTable(table.id, tableNameDraft.trim());
                          }
                          setEditingTableId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (tableNameDraft.trim()) {
                              onRenameTable(table.id, tableNameDraft.trim());
                            }
                            setEditingTableId(null);
                          }
                        }}
                        autoFocus
                        className="px-2 py-1 text-sm font-bold text-slate-900 bg-white rounded"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTableId(table.id);
                          setTableNameDraft(table.name);
                        }}
                        title="হিসাব ঘরের নাম সংশোধন করতে ক্লিক করুন"
                        className="inline-flex items-center gap-1.5 text-base font-bold text-white hover:text-blue-300 cursor-pointer"
                      >
                        <span>{table.name}</span>
                        <Pencil className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    )}

                    <span className="hidden sm:inline text-xs text-slate-400 tabular-nums">
                      · {table.createdAt}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportCsv(table);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-md cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrintTable(table.id);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-md cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>প্রিন্ট</span>
                    </button>

                    {tables.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTable(table.id);
                        }}
                        title="এই আলাদা হিসাব ঘরটি মুছুন"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-red-700 text-rose-300 hover:text-white rounded-md cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>মুছুন</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Per-Table Action Toolbar */}
                <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onAddRow(table.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ঘর যোগ (সারি)</span>
                    </button>

                    <button
                      type="button"
                      disabled={table.rows.length <= 1}
                      onClick={() =>
                        onRemoveRow(
                          table.id,
                          selectedCell?.tableId === table.id
                            ? table.rows[selectedCell.rowIdx]?.id
                            : undefined
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-40 border border-red-200 rounded cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>ঘর বিয়োগ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onAddColumn(table.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer"
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>নতুন কলাম</span>
                    </button>

                    <button
                      type="button"
                      disabled={table.columns.length <= 2}
                      onClick={() => onRemoveColumn(table.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-300 rounded cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>কলাম বিয়োগ</span>
                    </button>

                    <button
                      type="button"
                      onClick={onToggleFormulaBar}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border rounded cursor-pointer ${
                        showFormulaBar
                          ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <FunctionSquare className="w-3.5 h-3.5" />
                      <span>সূত্র এড</span>
                    </button>
                  </div>

                  <span className="text-xs text-slate-500">
                    শিরোনাম বা ঘরের ওপর ক্লিক করে সংশোধন করুন
                  </span>
                </div>

                {/* Formula Bar */}
                {showFormulaBar && isActiveTable && (
                  <div className="px-4 sm:px-5 py-2 bg-blue-50/70 border-b border-blue-200 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D4ED8] shrink-0">
                      <span className="px-2 py-0.5 bg-white border border-blue-200 rounded tabular-nums">
                        সেল: {activeCellRef}
                      </span>
                      <span>fx</span>
                    </div>

                    <input
                      type="text"
                      value={activeRawValue}
                      onChange={(e) => {
                        if (activeRow && activeCol) {
                          onUpdateCell(
                            table.id,
                            activeRow.id,
                            activeCol.id,
                            e.target.value
                          );
                        }
                      }}
                      placeholder="সংখ্যা বা সূত্র লিখুন (যেমন: =SUM(B1:B4) বা =B1-C1)"
                      className="flex-1 min-w-[200px] h-8 px-3 text-xs font-mono bg-white border border-blue-300 rounded focus:outline-none focus:border-[#1D4ED8]"
                    />

                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onClick={() => insertFormulaIntoTable(table, 'sum')}
                        className="px-2 py-1 text-[11px] font-semibold bg-white hover:bg-blue-100 text-slate-800 border border-blue-200 rounded cursor-pointer"
                      >
                        + যোগ (SUM)
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormulaIntoTable(table, 'sub')}
                        className="px-2 py-1 text-[11px] font-semibold bg-white hover:bg-blue-100 text-slate-800 border border-blue-200 rounded cursor-pointer"
                      >
                        - বিয়োগ
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormulaIntoTable(table, 'mul')}
                        className="px-2 py-1 text-[11px] font-semibold bg-white hover:bg-blue-100 text-slate-800 border border-blue-200 rounded cursor-pointer"
                      >
                        × গুণ
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormulaIntoTable(table, 'avg')}
                        className="px-2 py-1 text-[11px] font-semibold bg-white hover:bg-blue-100 text-slate-800 border border-blue-200 rounded cursor-pointer"
                      >
                        গড় (AVG)
                      </button>
                    </div>
                  </div>
                )}

                {/* Spreadsheet Grid */}
                <div className="overflow-x-auto p-4 sm:p-5">
                  <table className="w-full border-collapse border border-slate-300 text-sm min-w-[640px]">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 px-2 py-2 text-center text-xs font-bold text-slate-500 w-12">
                          #
                        </th>
                        {table.columns.map((col, colIdx) => {
                          const letter = columnIndexToLetter(colIdx);
                          const isEditingHeader =
                            editingCol?.tableId === table.id &&
                            editingCol?.colId === col.id;

                          return (
                            <th
                              key={col.id}
                              className="border border-slate-300 px-2.5 py-2 text-left text-xs font-bold text-slate-800"
                            >
                              {isEditingHeader ? (
                                <input
                                  type="text"
                                  value={colDraft}
                                  onChange={(e) => setColDraft(e.target.value)}
                                  onBlur={() => {
                                    if (colDraft.trim()) {
                                      onUpdateColumnLabel(
                                        table.id,
                                        col.id,
                                        colDraft.trim()
                                      );
                                    }
                                    setEditingCol(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      if (colDraft.trim()) {
                                        onUpdateColumnLabel(
                                          table.id,
                                          col.id,
                                          colDraft.trim()
                                        );
                                      }
                                      setEditingCol(null);
                                    }
                                  }}
                                  autoFocus
                                  className="w-full px-1.5 py-0.5 text-xs bg-white border border-[#1D4ED8] rounded"
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCol({
                                      tableId: table.id,
                                      colId: col.id,
                                    });
                                    setColDraft(col.label);
                                  }}
                                  title="কলামের নাম সংশোধন করতে ক্লিক করুন"
                                  className="w-full flex items-center justify-between gap-2 text-left cursor-pointer hover:text-[#1D4ED8]"
                                >
                                  <span>{col.label}</span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {letter}
                                  </span>
                                </button>
                              )}
                            </th>
                          );
                        })}
                        <th className="border border-slate-300 px-2 py-2 text-center text-xs font-bold text-slate-500 w-12">
                          মুছুন
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {table.rows.map((row, rowIdx) => (
                        <tr key={row.id} className="hover:bg-slate-50/70">
                          <td className="border border-slate-300 px-2 py-1.5 text-center text-xs font-semibold text-slate-500 bg-slate-50 tabular-nums">
                            {rowIdx + 1}
                          </td>

                          {table.columns.map((col, colIdx) => {
                            const raw = row.cells[col.id] ?? '';
                            const isSelected =
                              selectedCell?.tableId === table.id &&
                              selectedCell?.rowIdx === rowIdx &&
                              selectedCell?.colIdx === colIdx;
                            const evaluated = evaluateCellDisplay(
                              raw,
                              table.rows,
                              table.columns
                            );

                            return (
                              <td
                                key={col.id}
                                onClick={() =>
                                  onSelectCell({
                                    tableId: table.id,
                                    rowIdx,
                                    colIdx,
                                  })
                                }
                                className={`border border-slate-300 p-0 ${
                                  isSelected
                                    ? 'ring-2 ring-inset ring-[#1D4ED8]'
                                    : ''
                                }`}
                              >
                                <input
                                  type="text"
                                  value={
                                    isSelected
                                      ? raw
                                      : evaluated.isFormula
                                      ? evaluated.display
                                      : raw
                                  }
                                  onFocus={() =>
                                    onSelectCell({
                                      tableId: table.id,
                                      rowIdx,
                                      colIdx,
                                    })
                                  }
                                  onChange={(e) =>
                                    onUpdateCell(
                                      table.id,
                                      row.id,
                                      col.id,
                                      e.target.value
                                    )
                                  }
                                  className={`w-full h-9 px-2.5 text-sm bg-transparent focus:outline-none tabular-nums ${
                                    col.type === 'number'
                                      ? 'text-right font-medium text-slate-900'
                                      : 'text-left text-slate-800'
                                  } ${
                                    evaluated.isFormula && !isSelected
                                      ? 'text-[#1D4ED8] font-bold bg-blue-50/30'
                                      : ''
                                  }`}
                                />
                              </td>
                            );
                          })}

                          <td className="border border-slate-300 px-1 py-1 text-center">
                            <button
                              type="button"
                              disabled={table.rows.length <= 1}
                              onClick={() => onRemoveRow(table.id, row.id)}
                              title="এই সারি মুছুন"
                              className="w-7 h-7 inline-flex items-center justify-center rounded text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
