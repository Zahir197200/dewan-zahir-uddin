import { useEffect, useState } from 'react';
import {
  DEFAULT_SITE_CONFIG,
  INITIAL_LEDGER_TABLES,
} from './data/dbblDefaultData';
import type {
  BankingServiceItem,
  CustomerLead,
  LedgerTable,
  SiteConfig,
} from './types/appTypes';
import {
  columnIndexToLetter,
  evaluateCellDisplay,
  toBengaliDigits,
} from './utils/formulaEngine';
import {
  loadPersistedValue,
  savePersistedValue,
} from './utils/persistentStore';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { PosterGallerySection } from './components/PosterGallerySection';
import { PermanentLedgerSection } from './components/PermanentLedgerSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { BottomTaskbar } from './components/BottomTaskbar';
import { NoteCounterModal } from './components/NoteCounterModal';
import { CalculatorModal } from './components/CalculatorModal';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { RenameModal } from './components/RenameModal';

const STORAGE_KEYS = {
  config: 'zahir_enterprise_site_config_v2',
  tables: 'zahir_enterprise_ledger_tables_v2',
  leads: 'zahir_enterprise_customer_leads_v2',
};

interface UndoSnapshot {
  siteConfig: SiteConfig;
  tables: LedgerTable[];
}

export default function App() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [tables, setTables] = useState<LedgerTable[]>(INITIAL_LEDGER_TABLES);
  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const [undoStack, setUndoStack] = useState<UndoSnapshot[]>([]);

  const [activeTableId, setActiveTableId] = useState<string>(
    INITIAL_LEDGER_TABLES[0].id
  );
  const [selectedCell, setSelectedCell] = useState<{
    tableId: string;
    rowIdx: number;
    colIdx: number;
  } | null>({ tableId: INITIAL_LEDGER_TABLES[0].id, rowIdx: 0, colIdx: 1 });

  const [showFormulaBar, setShowFormulaBar] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNoteCounterOpen, setIsNoteCounterOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState('');
  const [printTarget, setPrintTarget] = useState<'webpage' | 'ledger'>(
    'webpage'
  );
  const [toastMessage, setToastMessage] = useState('');

  // Load persisted data from IndexedDB / localStorage on mount
  useEffect(() => {
    let active = true;
    (async () => {
      const [savedConfig, savedTables, savedLeads] = await Promise.all([
        loadPersistedValue<SiteConfig>(
          STORAGE_KEYS.config,
          DEFAULT_SITE_CONFIG
        ),
        loadPersistedValue<LedgerTable[]>(
          STORAGE_KEYS.tables,
          INITIAL_LEDGER_TABLES
        ),
        loadPersistedValue<CustomerLead[]>(STORAGE_KEYS.leads, []),
      ]);
      if (!active) return;
      if (savedConfig.email === 'zahirenterprise.dbbl@gmail.com') {
        savedConfig.email = 'dewanzahiruddin@gmail.com';
      }
      setSiteConfig(savedConfig);
      setTables(savedTables.length > 0 ? savedTables : INITIAL_LEDGER_TABLES);
      if (savedTables.length > 0) {
        setActiveTableId(savedTables[0].id);
        setSelectedCell({ tableId: savedTables[0].id, rowIdx: 0, colIdx: 1 });
      }
      setLeads(savedLeads);
      setIsHydrated(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    void savePersistedValue(STORAGE_KEYS.config, siteConfig);
    document.title = `${siteConfig.businessName} — ${siteConfig.bankTitle}`;
  }, [siteConfig, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    void savePersistedValue(STORAGE_KEYS.tables, tables);
  }, [tables, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    void savePersistedValue(STORAGE_KEYS.leads, leads);
  }, [leads, isHydrated]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? '' : prev));
    }, 3200);
  };

  const pushUndoSnapshot = () => {
    setUndoStack((prev) =>
      [...prev, { siteConfig, tables }].slice(-20)
    );
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setSiteConfig(last.siteConfig);
    setTables(last.tables);
    setUndoStack((prev) => prev.slice(0, -1));
    showToast('পূর্ববর্তী অবস্থায় সংশোধন করা হয়েছে');
  };

  const activeTable =
    tables.find((t) => t.id === activeTableId) || tables[0];

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdateField = <K extends keyof SiteConfig>(
    field: K,
    value: SiteConfig[K]
  ) => {
    pushUndoSnapshot();
    setSiteConfig((prev) => ({ ...prev, [field]: value }));
    showToast('পরিবর্তন সংরক্ষণ করা হয়েছে');
  };

  const handleUpdateService = (
    id: string,
    patch: Partial<BankingServiceItem>
  ) => {
    pushUndoSnapshot();
    setSiteConfig((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
    showToast('সেবার তথ্য সংশোধন করা হয়েছে');
  };

  const handleUploadCoverImage = (dataUrl: string) => {
    pushUndoSnapshot();
    setSiteConfig((prev) => ({ ...prev, coverImage: dataUrl }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('হোমপেইজে নতুন বড় কভার ছবি যুক্ত করা হয়েছে');
  };

  const handleUploadMultiplePosters = (
    items: { dataUrl: string; title: string }[]
  ) => {
    if (items.length === 0) return;
    pushUndoSnapshot();
    const newPosters = items.map((item, idx) => ({
      id: `poster-${Date.now()}-${idx}`,
      title: item.title,
      subtitle: siteConfig.businessName,
      badgeText: 'নতুন পোস্টার',
      accentColor: 'navy' as const,
      points: [],
      footerNote: siteConfig.branchLocation,
      customImage: item.dataUrl,
    }));

    setSiteConfig((prev) => ({
      ...prev,
      posters: [...newPosters, ...prev.posters],
    }));
    scrollToElement('posters');
    showToast(
      `${toBengaliDigits(items.length)}টি পোস্টার গ্যালারিতে যুক্ত করা হয়েছে`
    );
  };

  const handleRemovePoster = (id: string) => {
    pushUndoSnapshot();
    setSiteConfig((prev) => ({
      ...prev,
      posters: prev.posters.filter((p) => p.id !== id),
    }));
    showToast('পোস্টার সরানো হয়েছে');
  };

  const handleUpdatePosterTitle = (id: string, title: string) => {
    pushUndoSnapshot();
    setSiteConfig((prev) => ({
      ...prev,
      posters: prev.posters.map((p) => (p.id === id ? { ...p, title } : p)),
    }));
    showToast('পোস্টারের শিরোনাম সংশোধন হয়েছে');
  };

  // Separate New Accounting Table Creation
  const handleCreateSeparateTable = () => {
    pushUndoSnapshot();
    const newId = `table-${Date.now()}`;
    const nextNum = toBengaliDigits(tables.length + 1);
    const newTable: LedgerTable = {
      id: newId,
      name: `নতুন আলাদা হিসাব ঘর ${nextNum}`,
      createdAt: new Date().toLocaleDateString('bn-BD'),
      columns: [
        { id: 'col-a', label: 'বিবরণ', type: 'text' },
        { id: 'col-b', label: 'জমা (৳)', type: 'number' },
        { id: 'col-c', label: 'খরচ / উত্তোলন (৳)', type: 'number' },
        { id: 'col-d', label: 'নিট ব্যালেন্স (৳)', type: 'number' },
      ],
      rows: [
        {
          id: `row-${Date.now()}-1`,
          cells: {
            'col-a': 'প্রথম এন্ট্রি',
            'col-b': '0',
            'col-c': '0',
            'col-d': '=B1-C1',
          },
        },
        {
          id: `row-${Date.now()}-2`,
          cells: {
            'col-a': 'মোট হিসাব',
            'col-b': '=SUM(B1:B1)',
            'col-c': '=SUM(C1:C1)',
            'col-d': '=SUM(D1:D1)',
          },
        },
      ],
    };
    setTables((prev) => [...prev, newTable]);
    setActiveTableId(newId);
    setSelectedCell({ tableId: newId, rowIdx: 0, colIdx: 1 });
    scrollToElement('ledger');
    showToast(`"${newTable.name}" আলাদা হিসাব ঘর হিসেবে খোলা হয়েছে`);
  };

  const handleDeleteTable = (id: string) => {
    if (tables.length <= 1) return;
    pushUndoSnapshot();
    const filtered = tables.filter((t) => t.id !== id);
    setTables(filtered);
    if (activeTableId === id) {
      setActiveTableId(filtered[0].id);
    }
    showToast('হিসাব ঘরটি মুছে ফেলা হয়েছে');
  };

  const handleRenameTable = (tableId: string, newName: string) => {
    pushUndoSnapshot();
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, name: newName } : t))
    );
    showToast('হিসাব ঘরের নাম পরিবর্তন হয়েছে');
  };

  const handleUpdateCell = (
    tableId: string,
    rowId: string,
    colId: string,
    value: string
  ) => {
    setTables((prev) =>
      prev.map((tbl) => {
        if (tbl.id !== tableId) return tbl;
        return {
          ...tbl,
          rows: tbl.rows.map((r) =>
            r.id === rowId
              ? { ...r, cells: { ...r.cells, [colId]: value } }
              : r
          ),
        };
      })
    );
  };

  const handleUpdateColumnLabel = (
    tableId: string,
    colId: string,
    label: string
  ) => {
    pushUndoSnapshot();
    setTables((prev) =>
      prev.map((tbl) =>
        tbl.id === tableId
          ? {
              ...tbl,
              columns: tbl.columns.map((c) =>
                c.id === colId ? { ...c, label } : c
              ),
            }
          : tbl
      )
    );
  };

  const handleAddRow = (targetTableId = activeTable.id) => {
    pushUndoSnapshot();
    const targetTable =
      tables.find((t) => t.id === targetTableId) || activeTable;
    const newRowId = `row-${Date.now()}`;
    const emptyCells: Record<string, string> = {};
    targetTable.columns.forEach((col, idx) => {
      emptyCells[col.id] = idx === 0 ? 'নতুন হিসাব' : '0';
    });

    setTables((prev) =>
      prev.map((tbl) =>
        tbl.id === targetTable.id
          ? { ...tbl, rows: [...tbl.rows, { id: newRowId, cells: emptyCells }] }
          : tbl
      )
    );
    setActiveTableId(targetTable.id);
    setSelectedCell({
      tableId: targetTable.id,
      rowIdx: targetTable.rows.length,
      colIdx: 0,
    });
    scrollToElement('ledger');
    showToast('নতুন হিসাবের ঘর (সারি) যোগ হয়েছে');
  };

  const handleRemoveRow = (
    targetTableId = activeTable.id,
    targetRowId?: string
  ) => {
    const targetTable =
      tables.find((t) => t.id === targetTableId) || activeTable;
    if (targetTable.rows.length <= 1) return;
    pushUndoSnapshot();

    setTables((prev) =>
      prev.map((tbl) => {
        if (tbl.id !== targetTable.id || tbl.rows.length <= 1) return tbl;
        const nextRows = targetRowId
          ? tbl.rows.filter((r) => r.id !== targetRowId)
          : tbl.rows.slice(0, -1);
        return { ...tbl, rows: nextRows };
      })
    );
    showToast('একটি ঘর (সারি) বিয়োগ করা হয়েছে');
  };

  const handleAddColumn = (targetTableId = activeTable.id) => {
    pushUndoSnapshot();
    const targetTable =
      tables.find((t) => t.id === targetTableId) || activeTable;
    const newColId = `col-${Date.now()}`;
    const letter = columnIndexToLetter(targetTable.columns.length);

    setTables((prev) =>
      prev.map((tbl) =>
        tbl.id === targetTable.id
          ? {
              ...tbl,
              columns: [
                ...tbl.columns,
                { id: newColId, label: `নতুন কলাম ${letter}`, type: 'number' },
              ],
              rows: tbl.rows.map((r) => ({
                ...r,
                cells: { ...r.cells, [newColId]: '0' },
              })),
            }
          : tbl
      )
    );
    setActiveTableId(targetTable.id);
    scrollToElement('ledger');
    showToast(`নতুন কলাম ${letter} যুক্ত করা হয়েছে`);
  };

  const handleRemoveColumn = (targetTableId = activeTable.id) => {
    const targetTable =
      tables.find((t) => t.id === targetTableId) || activeTable;
    if (targetTable.columns.length <= 2) return;
    pushUndoSnapshot();
    const removedCol = targetTable.columns[targetTable.columns.length - 1];

    setTables((prev) =>
      prev.map((tbl) =>
        tbl.id === targetTable.id && tbl.columns.length > 2
          ? {
              ...tbl,
              columns: tbl.columns.slice(0, -1),
              rows: tbl.rows.map((r) => {
                const nextCells = { ...r.cells };
                delete nextCells[removedCol.id];
                return { ...r, cells: nextCells };
              }),
            }
          : tbl
      )
    );
    showToast('শেষের কলাম বিয়োগ করা হয়েছে');
  };

  const handleInsertNoteCounterToLedger = (
    amount: number,
    summaryText: string
  ) => {
    pushUndoSnapshot();
    const newRowId = `row-${Date.now()}`;
    const cells: Record<string, string> = {};
    activeTable.columns.forEach((col, idx) => {
      if (idx === 0) cells[col.id] = summaryText;
      else if (idx === 1) cells[col.id] = String(amount);
      else cells[col.id] = '0';
    });

    setTables((prev) =>
      prev.map((tbl) =>
        tbl.id === activeTable.id
          ? { ...tbl, rows: [...tbl.rows, { id: newRowId, cells }] }
          : tbl
      )
    );
    scrollToElement('ledger');
    showToast(`নোট গণনার ৳${toBengaliDigits(amount)} হিসাবের ঘরে যুক্ত হয়েছে`);
  };

  const handleTriggerPrint = (target: 'webpage' | 'ledger', tableId?: string) => {
    if (tableId) setActiveTableId(tableId);
    setPrintTarget(target);
    setIsPreviewOpen(false);
    window.setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleSubmitLead = (lead: Omit<CustomerLead, 'id' | 'createdAt'>) => {
    const entry: CustomerLead = {
      ...lead,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toLocaleString('bn-BD'),
    };
    setLeads((prev) => [entry, ...prev]);
    showToast('গ্রাহকের আবেদন সংরক্ষণ করা হয়েছে');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {isEditMode && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-center text-xs sm:text-sm font-semibold text-amber-950 print:hidden">
          সংশোধন মোড চালু আছে — যেকোনো শিরোনাম, বিবরণ, ঠিকানা, পোস্টার বা হিসাবের ঘরের নামের ওপর ক্লিক করে সরাসরি সংশোধন করুন।
        </div>
      )}

      {/* Main Webpage */}
      <div className={printTarget === 'ledger' ? 'print:hidden' : ''}>
        <Navbar
          businessName={siteConfig.businessName}
          onBookService={() => scrollToElement('contact')}
        />

        <main className="flex-1">
          <HeroSection
            config={siteConfig}
            isEditMode={isEditMode}
            onUpdateField={handleUpdateField}
            onBookService={() => scrollToElement('contact')}
          />

          <ServicesSection
            services={siteConfig.services}
            isEditMode={isEditMode}
            onUpdateService={handleUpdateService}
            onSelectService={(title) => {
              setPreselectedService(title);
              scrollToElement('contact');
            }}
          />

          <PosterGallerySection
            config={siteConfig}
            isEditMode={isEditMode}
            onUpdateField={handleUpdateField}
            onUploadMultiplePosters={handleUploadMultiplePosters}
            onRemovePoster={handleRemovePoster}
            onUpdatePosterTitle={handleUpdatePosterTitle}
          />

          {/* Permanent Separate Accounting Ledger Section */}
          <PermanentLedgerSection
            tables={tables}
            activeTableId={activeTable.id}
            onSelectTable={(id) => setActiveTableId(id)}
            onCreateSeparateTable={handleCreateSeparateTable}
            onDeleteTable={handleDeleteTable}
            onRenameTable={handleRenameTable}
            onUpdateCell={handleUpdateCell}
            onUpdateColumnLabel={handleUpdateColumnLabel}
            onAddRow={handleAddRow}
            onRemoveRow={handleRemoveRow}
            onAddColumn={handleAddColumn}
            onRemoveColumn={handleRemoveColumn}
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
            showFormulaBar={showFormulaBar}
            onToggleFormulaBar={() => setShowFormulaBar((p) => !p)}
            canUndo={undoStack.length > 0}
            onUndo={handleUndo}
            isEditMode={isEditMode}
            onToggleEditMode={() => setIsEditMode((p) => !p)}
            leads={leads}
            onPrintTable={(id) => handleTriggerPrint('ledger', id)}
          />

          <ContactSection
            config={siteConfig}
            isEditMode={isEditMode}
            onUpdateField={handleUpdateField}
            preselectedService={preselectedService}
            onSubmitLead={handleSubmitLead}
          />
        </main>

        <Footer
          businessName={siteConfig.businessName}
          branchLocation={siteConfig.branchLocation}
        />
      </div>

      {/* Print-Only View for Active Accounting Table */}
      {printTarget === 'ledger' && (
        <div className="hidden print:block p-8 bg-white text-slate-900">
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold">{siteConfig.businessName}</h1>
              <p className="text-sm font-medium">{siteConfig.bankTitle}</p>
              <p className="text-xs text-slate-600">
                {siteConfig.branchLocation} · মোবাইল: {siteConfig.phones.join(', ')}
              </p>
            </div>
            <div className="text-right text-xs">
              <div>তারিখ: {new Date().toLocaleDateString('bn-BD')}</div>
              <div className="font-bold mt-0.5">হিসাব: {activeTable.name}</div>
            </div>
          </div>

          <table className="w-full border-collapse border border-slate-400 text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-400 px-3 py-2 text-left w-10">
                  ক্রম
                </th>
                {activeTable.columns.map((col) => (
                  <th
                    key={col.id}
                    className={`border border-slate-400 px-3 py-2 ${
                      col.type === 'number' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeTable.rows.map((row, rIdx) => (
                <tr key={row.id}>
                  <td className="border border-slate-400 px-3 py-2 tabular-nums">
                    {toBengaliDigits(rIdx + 1)}
                  </td>
                  {activeTable.columns.map((col) => {
                    const res = evaluateCellDisplay(
                      row.cells[col.id],
                      activeTable.rows,
                      activeTable.columns
                    );
                    return (
                      <td
                        key={col.id}
                        className={`border border-slate-400 px-3 py-2 tabular-nums ${
                          col.type === 'number' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {res.display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-16 right-4 z-50 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs sm:text-sm font-medium shadow-lg border border-slate-700 print:hidden"
        >
          {toastMessage}
        </div>
      )}

      {/* Modals */}
      <NoteCounterModal
        isOpen={isNoteCounterOpen}
        onClose={() => setIsNoteCounterOpen(false)}
        onInsertTotalToLedger={handleInsertNoteCounterToLedger}
      />

      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <PrintPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        siteConfig={siteConfig}
        activeTable={activeTable}
        onPrintTarget={(target) => handleTriggerPrint(target)}
      />

      <RenameModal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        businessName={siteConfig.businessName}
        branchLocation={siteConfig.branchLocation}
        activeTableName={activeTable.name}
        onSave={({ businessName, branchLocation, activeTableName }) => {
          pushUndoSnapshot();
          setSiteConfig((prev) => ({
            ...prev,
            businessName,
            branchLocation,
          }));
          setTables((prev) =>
            prev.map((t) =>
              t.id === activeTable.id ? { ...t, name: activeTableName } : t
            )
          );
          showToast('নাম সফলভাবে পরিবর্তন করা হয়েছে');
        }}
      />

      {/* Computer-Style Fixed Bottom Taskbar */}
      <BottomTaskbar
        onScrollToLedger={() => scrollToElement('ledger')}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode((p) => !p)}
        canUndo={undoStack.length > 0}
        onUndo={handleUndo}
        onNewSeparateTable={handleCreateSeparateTable}
        onAddColumn={() => handleAddColumn(activeTable.id)}
        onAddRow={() => handleAddRow(activeTable.id)}
        onRemoveRow={() => handleRemoveRow(activeTable.id)}
        onOpenFormula={() => {
          setShowFormulaBar(true);
          scrollToElement('ledger');
        }}
        onPrint={() => handleTriggerPrint('ledger', activeTable.id)}
        onPreview={() => setIsPreviewOpen(true)}
        onOpenNoteCounter={() => setIsNoteCounterOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onUploadCoverImage={handleUploadCoverImage}
        onUploadMultiplePosters={handleUploadMultiplePosters}
        onOpenRename={() => setIsRenameOpen(true)}
      />
    </div>
  );
}
