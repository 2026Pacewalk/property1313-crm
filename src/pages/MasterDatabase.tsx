import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Plus, Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown,
  Shield, Database, AlertTriangle,
  Merge, History, ToggleLeft, ToggleRight,
  ClipboardList, FolderOpen, Lock
} from 'lucide-react';
import { useAuthStore, usePermission } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useMasterStore, MASTER_TYPES } from '@/stores/masterStore';
import BottomSheet from '@/components/shared/BottomSheet';
import { cn } from '@/lib/utils';
import type { MasterType, MasterValue } from '@/types';

// ===================== COLOR SWATCHES =====================
const COLOR_SWATCHES = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
  '#06B6D4', '#14B8A6', '#A855F7', '#F97316', '#6B7280', '#004C8F',
  '#1E3A8A', '#25D366', '#DB4437', '#1877F2', '#F7941D', '#DC2626',
  '#60A5FA', '#84CC16',
];

// ===================== MAIN PAGE =====================
export default function MasterDatabase() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { can } = usePermission();
  const { addToast } = useUIStore();
  const {
    masterValues, fieldSettings, auditLogs,
    addValue, updateValue, deactivateValue, activateValue, deleteValue,
    mergeValues, reorderValues, updateFieldSetting,
  } = useMasterStore();

  const [activeTab, setActiveTab] = useState<'values' | 'fields' | 'audit'>('values');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('mt_lead_status');
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);

  // Edit/Add state
  const [showValueSheet, setShowValueSheet] = useState(false);
  const [editingValue, setEditingValue] = useState<MasterValue | null>(null);
  const [valName, setValName] = useState('');
  const [valDesc, setValDesc] = useState('');
  const [valColor, setValColor] = useState('');
  const [valParentId, setValParentId] = useState('');

  // Merge state
  const [showMergeSheet, setShowMergeSheet] = useState(false);
  const [mergeSource, setMergeSource] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Permission check
  if (!user || !can('manage_projects')) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <Shield size={48} className="text-red-400 mb-4" />
        <h2 className="text-lg font-semibold">Access Denied</h2>
        <p className="text-sm text-neutral-500 mt-1">Only Super Admin and Admin can access Master Database.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 h-10 px-6 bg-p13-yellow text-p13-black rounded-lg text-sm font-medium">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const selectedType = MASTER_TYPES.find(mt => mt.id === selectedTypeId);

  // Filter master types
  const filteredTypes = useMemo(() => {
    let types = MASTER_TYPES;
    if (filterModule !== 'all') types = types.filter(mt => mt.module === filterModule);
    if (search) types = types.filter(mt => mt.name.toLowerCase().includes(search.toLowerCase()));
    return types;
  }, [filterModule, search]);

  // Group types by module
  const typesByModule = useMemo(() => {
    const grouped: Record<string, MasterType[]> = {};
    filteredTypes.forEach(mt => {
      if (!grouped[mt.module]) grouped[mt.module] = [];
      grouped[mt.module].push(mt);
    });
    return grouped;
  }, [filteredTypes]);

  // Values for selected type
  const typeValues = masterValues
    .filter(v => v.masterTypeId === selectedTypeId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const activeValues = typeValues.filter(v => v.isActive);
  const inactiveValues = typeValues.filter(v => !v.isActive);
  const displayValues = showInactive ? typeValues : activeValues;

  // Parent type for child values
  const parentType = selectedType?.hasParent && selectedType.parentTypeId
    ? MASTER_TYPES.find(mt => mt.id === selectedType.parentTypeId)
    : null;
  const parentValues = parentType
    ? masterValues.filter(v => v.masterTypeId === parentType.id && v.isActive)
    : [];

  const handleSaveValue = () => {
    if (!valName.trim()) { addToast({ type: 'error', message: 'Name is required' }); return; }

    if (editingValue) {
      updateValue(editingValue.id, {
        name: valName.trim(),
        description: valDesc || undefined,
        color: valColor || undefined,
        parentId: valParentId || undefined,
      }, user.id, user.name);
      addToast({ type: 'success', message: 'Value updated' });
    } else {
      addValue(selectedTypeId, valName.trim(), {
        description: valDesc || undefined,
        color: valColor || undefined,
        parentId: valParentId || undefined,
      }, user.id, user.name);
      addToast({ type: 'success', message: 'Value added' });
    }
    resetValueForm();
  };

  const resetValueForm = () => {
    setShowValueSheet(false);
    setEditingValue(null);
    setValName('');
    setValDesc('');
    setValColor('');
    setValParentId('');
  };

  const startEdit = (v: MasterValue) => {
    setEditingValue(v);
    setValName(v.name);
    setValDesc(v.description || '');
    setValColor(v.color || '');
    setValParentId(v.parentId || '');
    setShowValueSheet(true);
  };

  const startAdd = () => {
    resetValueForm();
    setEditingValue(null);
    setShowValueSheet(true);
  };

  const handleDelete = (id: string) => {
    const result = deleteValue(id);
    if (result.success) {
      addToast({ type: 'success', message: result.message });
    } else {
      addToast({ type: 'error', message: result.message });
    }
    setDeleteConfirm(null);
  };

  const handleMerge = () => {
    if (!mergeSource || !mergeTarget || mergeSource === mergeTarget) {
      addToast({ type: 'error', message: 'Select different source and target' });
      return;
    }
    const result = mergeValues(mergeSource, mergeTarget, user.id, user.name);
    addToast({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) {
      setShowMergeSheet(false);
      setMergeSource('');
      setMergeTarget('');
    }
  };

  const moveUp = (v: MasterValue) => {
    const idx = displayValues.findIndex(x => x.id === v.id);
    if (idx <= 0) return;
    const newOrder = [...displayValues];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    reorderValues(selectedTypeId, newOrder.map(x => x.id));
  };

  const moveDown = (v: MasterValue) => {
    const idx = displayValues.findIndex(x => x.id === v.id);
    if (idx >= displayValues.length - 1) return;
    const newOrder = [...displayValues];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    reorderValues(selectedTypeId, newOrder.map(x => x.id));
  };

  return (
    <div className="h-[calc(100dvh-56px)] bg-neutral-50 flex flex-col md:flex-row overflow-hidden">
      {/* ===== LEFT SIDEBAR: Master Types ===== */}
      <aside className="w-full md:w-72 bg-white border-r border-neutral-200 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-200">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => navigate(-1)} className="text-neutral-600 hover:text-neutral-900"><ArrowLeft size={18} /></button>
            <div className="flex items-center gap-2">
              <Database size={18} className="text-p13-yellow" />
              <h1 className="text-[15px] font-semibold">Master Database</h1>
            </div>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search master types..."
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-neutral-200 bg-white text-xs focus:border-p13-yellow outline-none" />
          </div>
        </div>

        {/* Module filter */}
        <div className="px-3 py-2 border-b border-neutral-200 flex gap-1 overflow-x-auto">
          <button onClick={() => setFilterModule('all')}
            className={cn('px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all',
              filterModule === 'all' ? 'bg-p13-yellow text-p13-black' : 'bg-neutral-100 text-neutral-500')}>
            All
          </button>
          {Object.keys(typesByModule).map(mod => (
            <button key={mod} onClick={() => setFilterModule(mod)}
              className={cn('px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all',
                filterModule === mod ? 'bg-p13-yellow text-p13-black' : 'bg-neutral-100 text-neutral-500')}>
              {mod}
            </button>
          ))}
        </div>

        {/* Type list */}
        <div className="flex-1 overflow-y-auto py-1">
          {Object.entries(typesByModule).map(([module, types]) => (
            <div key={module}>
              <p className="px-4 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">{module}</p>
              {types.map(mt => {
                const count = masterValues.filter(v => v.masterTypeId === mt.id && v.isActive).length;
                return (
                  <button key={mt.id} onClick={() => setSelectedTypeId(mt.id)}
                    className={cn('w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all hover:bg-neutral-50',
                      selectedTypeId === mt.id ? 'bg-p13-yellow/10 border-r-2 border-p13-yellow' : '')}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: mt.isActive ? '#10B981' : '#EF4444' }} />
                    <span className={cn('text-xs flex-1', selectedTypeId === mt.id ? 'font-semibold text-p13-black' : 'text-neutral-600')}>
                      {mt.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full">{count}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* ===== RIGHT PANEL ===== */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Tabs */}
        <div className="bg-white border-b border-neutral-200 px-4 flex items-center gap-1">
          {[
            { key: 'values' as const, label: 'Values', icon: FolderOpen },
            { key: 'fields' as const, label: 'Required Fields', icon: ClipboardList },
            { key: 'audit' as const, label: 'Audit Log', icon: History },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn('flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all',
                activeTab === tab.key
                  ? 'border-p13-yellow text-p13-black'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600')}>
              <tab.icon size={13} />
              {tab.label}
              {tab.key === 'audit' && auditLogs.length > 0 && (
                <span className="bg-p13-yellow text-[9px] px-1 rounded-full">{auditLogs.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* ===== VALUES TAB ===== */}
            {activeTab === 'values' && selectedType && (
              <motion.div key="values" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                {/* Type Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold">{selectedType.name}</h2>
                    <p className="text-[11px] text-neutral-400">{displayValues.length} active {displayValues.length === 1 ? 'value' : 'values'}{showInactive && inactiveValues.length > 0 ? ` (${inactiveValues.length} inactive)` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowInactive(!showInactive)}
                      className={cn('h-8 px-2.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border transition-all',
                        showInactive ? 'bg-p13-yellow text-p13-black border-p13-yellow' : 'bg-white text-neutral-500 border-neutral-200')}>
                      {showInactive ? <Eye size={12} /> : <EyeOff size={12} />}
                      {showInactive ? 'Hide Inactive' : 'Show Inactive'}
                    </button>
                    <button onClick={() => setShowMergeSheet(true)}
                      className="h-8 px-2.5 bg-white text-neutral-600 border border-neutral-200 rounded-lg text-[11px] font-medium flex items-center gap-1.5 hover:bg-neutral-50">
                      <Merge size={12} /> Merge
                    </button>
                    <button onClick={startAdd}
                      className="h-8 px-3 bg-p13-yellow text-p13-black rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-p13-yellow/90">
                      <Plus size={13} /> Add Value
                    </button>
                  </div>
                </div>

                {/* Values Table */}
                <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[60px_1fr_120px_100px_auto] gap-2 px-4 py-2.5 bg-neutral-50 border-b border-neutral-200 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    <span className="hidden md:block">#</span>
                    <span>Name</span>
                    <span className="hidden md:block">Parent</span>
                    <span className="hidden md:block">Status</span>
                    <span className="text-right">Actions</span>
                  </div>

                  {/* Rows */}
                  {displayValues.map((v, i) => {
                    const parentVal = v.parentId ? masterValues.find(mv => mv.id === v.parentId) : null;
                    return (
                      <motion.div key={v.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                        className={cn('grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[60px_1fr_120px_100px_auto] gap-2 px-4 py-2.5 border-b border-neutral-100 items-center',
                          !v.isActive && 'opacity-50')}>
                        {/* Order */}
                        <span className="hidden md:flex items-center gap-1">
                          <span className="text-[11px] text-neutral-400 w-5">{i + 1}</span>
                          <div className="flex flex-col">
                            <button onClick={() => moveUp(v)} className="text-neutral-300 hover:text-neutral-500"><ArrowUp size={10} /></button>
                            <button onClick={() => moveDown(v)} className="text-neutral-300 hover:text-neutral-500"><ArrowDown size={10} /></button>
                          </div>
                        </span>

                        {/* Name + Color */}
                        <div className="flex items-center gap-2 min-w-0">
                          {v.color && <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: v.color }} />}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{v.name}</p>
                            {v.description && <p className="text-[10px] text-neutral-400 truncate">{v.description}</p>}
                          </div>
                          {v.isSystemDefault && <span title="System default"><Lock size={10} className="text-amber-500 flex-shrink-0" /></span>}
                        </div>

                        {/* Parent */}
                        <span className="hidden md:block text-[11px] text-neutral-500 truncate">{parentVal?.name || '-'}</span>

                        {/* Status */}
                        <span className="hidden md:block">
                          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full',
                            v.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500')}>
                            {v.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-0.5 justify-end">
                          <button onClick={() => startEdit(v)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600" title="Edit">
                            <Pencil size={13} />
                          </button>
                          {v.isActive ? (
                            <button onClick={() => deactivateValue(v.id, user.id, user.name)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-green-400 hover:text-green-600" title="Deactivate">
                              <ToggleRight size={15} />
                            </button>
                          ) : (
                            <button onClick={() => activateValue(v.id, user.id, user.name)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-300 hover:text-neutral-500" title="Activate">
                              <ToggleLeft size={15} />
                            </button>
                          )}
                          <button onClick={() => setDeleteConfirm(v.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}

                  {displayValues.length === 0 && (
                    <div className="py-10 text-center">
                      <FolderOpen size={28} className="text-neutral-300 mx-auto mb-2" />
                      <p className="text-sm text-neutral-400">No values found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ===== FIELD SETTINGS TAB ===== */}
            {activeTab === 'fields' && (
              <motion.div key="fields" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold">Required Field Settings</h2>
                  <p className="text-[11px] text-neutral-400">Control required, visible, and editable fields per module</p>
                </div>

                {/* Module selector */}
                <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                  {['add_lead', 'add_project', 'schedule_visit', 'add_followup', 'loan_inquiry', 'add_user'].map(mod => (
                    <button key={mod}
                      onClick={() => { /* re-render with module */ }}
                      className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-all whitespace-nowrap">
                      {mod.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                  <div className="grid grid-cols-[1fr_80px_80px_80px] gap-2 px-4 py-2.5 bg-neutral-50 border-b border-neutral-200 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    <span>Field</span>
                    <span className="text-center">Required</span>
                    <span className="text-center">Visible</span>
                    <span className="text-center">Editable</span>
                  </div>
                  {fieldSettings.slice(0, 15).map(fs => (
                    <div key={fs.id} className="grid grid-cols-[1fr_80px_80px_80px] gap-2 px-4 py-2 border-b border-neutral-100 items-center">
                      <div>
                        <p className="text-sm font-medium">{fs.fieldLabel}</p>
                        <p className="text-[10px] text-neutral-400">{fs.fieldType} {fs.masterTypeId && <span className="text-p13-yellow"> (master)</span>}</p>
                      </div>
                      <div className="flex justify-center">
                        <button onClick={() => updateFieldSetting(fs.id, { isRequired: !fs.isRequired })}
                          className={cn('w-9 h-5 rounded-full transition-all relative', fs.isRequired ? 'bg-p13-yellow' : 'bg-neutral-300')}>
                          <div className={cn('w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm', fs.isRequired ? 'left-[18px]' : 'left-0.5')} />
                        </button>
                      </div>
                      <div className="flex justify-center">
                        <button onClick={() => updateFieldSetting(fs.id, { isVisible: !fs.isVisible })}
                          className={cn('w-9 h-5 rounded-full transition-all relative', fs.isVisible ? 'bg-green-400' : 'bg-neutral-300')}>
                          <div className={cn('w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm', fs.isVisible ? 'left-[18px]' : 'left-0.5')} />
                        </button>
                      </div>
                      <div className="flex justify-center">
                        <button onClick={() => updateFieldSetting(fs.id, { isEditable: !fs.isEditable })}
                          className={cn('w-9 h-5 rounded-full transition-all relative', fs.isEditable ? 'bg-blue-400' : 'bg-neutral-300')}>
                          <div className={cn('w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm', fs.isEditable ? 'left-[18px]' : 'left-0.5')} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ===== AUDIT LOG TAB ===== */}
            {activeTab === 'audit' && (
              <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                <h2 className="text-base font-semibold mb-4">Master Database Audit Log</h2>
                <div className="space-y-2">
                  {auditLogs.length === 0 && (
                    <div className="text-center py-10">
                      <History size={28} className="text-neutral-300 mx-auto mb-2" />
                      <p className="text-sm text-neutral-400">No audit log entries yet</p>
                      <p className="text-[11px] text-neutral-400 mt-1">Actions will be logged as you manage master values</p>
                    </div>
                  )}
                  {auditLogs.map(log => {
                    const actionColors: Record<string, string> = {
                      value_added: 'bg-green-100 text-green-700',
                      value_edited: 'bg-blue-100 text-blue-700',
                      value_deactivated: 'bg-orange-100 text-orange-700',
                      value_activated: 'bg-green-100 text-green-700',
                      value_deleted: 'bg-red-100 text-red-700',
                      value_merged: 'bg-purple-100 text-purple-700',
                      values_reordered: 'bg-neutral-100 text-neutral-600',
                    };
                    return (
                      <div key={log.id} className="bg-white rounded-lg border border-neutral-200 px-4 py-3 flex items-start gap-3">
                        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5', actionColors[log.action] || 'bg-neutral-100')}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{log.details}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            {log.masterTypeName} &middot; {log.changedByName} &middot; {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ===== ADD/EDIT VALUE SHEET ===== */}
      <BottomSheet isOpen={showValueSheet} onClose={resetValueForm} title={editingValue ? 'Edit Value' : 'Add Value'} maxHeight="75vh">
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1 block">Value Name <span className="text-red-500">*</span></label>
            <input value={valName} onChange={e => setValName(e.target.value)}
              placeholder="Enter value name"
              className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-p13-yellow outline-none" />
          </div>

          {/* Parent selector if type has parent */}
          {selectedType?.hasParent && parentValues.length > 0 && (
            <div>
              <label className="text-xs font-medium text-neutral-600 mb-1 block">Parent ({parentType?.name})</label>
              <select value={valParentId} onChange={e => setValParentId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-p13-yellow outline-none">
                <option value="">No parent</option>
                {parentValues.map(pv => (
                  <option key={pv.id} value={pv.id}>{pv.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1 block">Description</label>
            <input value={valDesc} onChange={e => setValDesc(e.target.value)}
              placeholder="Optional description"
              className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-p13-yellow outline-none" />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-600 mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_SWATCHES.map(c => (
                <button key={c} onClick={() => setValColor(valColor === c ? '' : c)}
                  className={cn('w-7 h-7 rounded-full border-2 transition-all', valColor === c ? 'border-p13-black scale-110' : 'border-transparent hover:scale-105')}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <button onClick={handleSaveValue}
            className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold hover:bg-p13-yellow/90 transition-all">
            {editingValue ? 'Update Value' : 'Add Value'}
          </button>
        </div>
      </BottomSheet>

      {/* ===== MERGE SHEET ===== */}
      <BottomSheet isOpen={showMergeSheet} onClose={() => { setShowMergeSheet(false); setMergeSource(''); setMergeTarget(''); }} title="Merge Values" maxHeight="60vh">
        <div className="space-y-4 py-2">
          <p className="text-xs text-neutral-500">Select a source value to merge into a target. The source will be removed and its usage count transferred.</p>
          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1 block">Source (will be removed)</label>
            <select value={mergeSource} onChange={e => setMergeSource(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-p13-yellow outline-none">
              <option value="">Select source value</option>
              {displayValues.map(v => (
                <option key={v.id} value={v.id}>{v.name} {v.usageCount > 0 && `(${v.usageCount} uses)`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1 block">Target (will be kept)</label>
            <select value={mergeTarget} onChange={e => setMergeTarget(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-p13-yellow outline-none">
              <option value="">Select target value</option>
              {displayValues.filter(v => v.id !== mergeSource).map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <button onClick={handleMerge}
            className="w-full h-11 bg-p13-black text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
            <Merge size={15} /> Merge Values
          </button>
        </div>
      </BottomSheet>

      {/* ===== DELETE CONFIRM SHEET ===== */}
      <BottomSheet isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="py-4 space-y-4">
          {(() => {
            const v = masterValues.find(mv => mv.id === deleteConfirm);
            if (!v) return null;
            return (
              <>
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    {v.usageCount > 0
                      ? `This value is used in ${v.usageCount} record(s). Deletion is blocked — consider deactivating or merging.`
                      : 'This action cannot be undone. The value will be permanently removed.'}
                  </p>
                </div>
                <p className="text-sm font-medium text-center">Delete &quot;{v.name}&quot;?</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)}
                    className="flex-1 h-11 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(v.id)} disabled={v.usageCount > 0 || v.isSystemDefault}
                    className={cn('flex-1 h-11 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5',
                      v.usageCount > 0 || v.isSystemDefault
                        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600')}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </BottomSheet>
    </div>
  );
}
