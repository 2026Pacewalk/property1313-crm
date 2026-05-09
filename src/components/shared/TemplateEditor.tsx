import { useState, useMemo } from 'react';
import { Plus, Save, Flame, Snowflake, Sun, MessageCircle, Image, FileText, Video, Link2, Mic, Bot } from 'lucide-react';
import { useWhatsAppStore } from '@/stores/whatsappStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import type { WhatsAppTemplate, MessageType, AITone, UserRole } from '@/types';
import MessagePreview from './MessagePreview';
import BottomSheet from './BottomSheet';

const messageTypes: { key: MessageType; label: string; icon: typeof MessageCircle }[] = [
  { key: 'text', label: 'Text', icon: MessageCircle },
  { key: 'image', label: 'Image', icon: Image },
  { key: 'pdf', label: 'PDF', icon: FileText },
  { key: 'video', label: 'Video', icon: Video },
  { key: 'brochure', label: 'Brochure', icon: FileText },
  { key: 'link', label: 'Link', icon: Link2 },
  { key: 'voice', label: 'Voice', icon: Mic },
];

const aiTones: { key: AITone; label: string; icon: typeof Flame; color: string; desc: string }[] = [
  { key: 'hot', label: 'HOT', icon: Flame, color: 'text-orange-500 bg-orange-50 border-orange-200', desc: 'Urgent, conversion-focused' },
  { key: 'warm', label: 'WARM', icon: Sun, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', desc: 'Informative, relationship' },
  { key: 'cold', label: 'COLD', icon: Snowflake, color: 'text-blue-500 bg-blue-50 border-blue-200', desc: 'Soft re-engagement' },
];

export default function TemplateEditor() {
  const { isEditorOpen, closeEditor, selectedTemplateId, createTemplate, updateTemplate, categories, variables, renderMessage } = useWhatsAppStore();
  const { addToast } = useUIStore();
  const { user } = useAuthStore();

  const existing = selectedTemplateId ? useWhatsAppStore.getState().getTemplateById(selectedTemplateId) : null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('New Lead Response');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('text');
  const [aiTone, setAiTone] = useState<AITone | undefined>('warm');
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [isFavorite, setIsFavorite] = useState(false);

  // Load existing data
  useMemo(() => {
    if (existing) {
      setName(existing.name);
      setCategory(existing.category);
      setContent(existing.content);
      setDescription(existing.description || '');
      setMessageType(existing.messageType);
      setAiTone(existing.aiTone);
      setAutomationEnabled(existing.automationEnabled);
      setStatus(existing.status === 'archived' ? 'archived' : 'active');
      setIsFavorite(existing.isFavorite);
    } else {
      setName('');
      setCategory('New Lead Response');
      setContent('');
      setDescription('');
      setMessageType('text');
      setAiTone('warm');
      setAutomationEnabled(false);
      setStatus('active');
      setIsFavorite(false);
    }
  }, [existing]);

  const previewContext: Record<string, string> = {
    customer_name: 'Rahul Sharma',
    project_name: 'Sunset Residences',
    project_location: 'Sector 62, Noida',
    sales_person_name: user?.name || 'Amit Kumar',
    company_name: 'Property1313',
    company_mobile: '8910001313',
    visit_date: 'May 10, 2026',
    visit_time: '10:30 AM',
    callback_time: '2:00 PM today',
    loan_amount: 'Rs.50 Lakhs',
    emi_amount: 'Rs.45,000/month',
    public_project_link: 'https://p1313.com/p/sunset-residences',
  };

  const preview = useMemo(() => {
    const dummyTemplate = { content, variables: [] } as unknown as WhatsAppTemplate;
    return renderMessage(dummyTemplate, previewContext);
  }, [content, renderMessage]);

  const detectedVars = useMemo(() => {
    const matches = content.match(/\{\{(\w+)\}\}/g);
    return matches ? [...new Set(matches.map((m) => m.replace(/[{}]/g, '')))] : [];
  }, [content]);

  const handleSave = () => {
    if (!name.trim()) { addToast({ type: 'error', message: 'Template name is required' }); return; }
    if (!content.trim()) { addToast({ type: 'error', message: 'Template content is required' }); return; }

    const data = {
      name: name.trim(),
      category,
      content: content.trim(),
      description: description.trim(),
      variables: detectedVars,
      messageType,
      aiTone,
      isFavorite,
      status: status as 'active' | 'archived' | 'pending',
      automationEnabled,
      roleAccess: ['super_admin', 'admin', 'manager', 'telecaller', 'sales_person'] as UserRole[],
      approved: true,
    };

    if (existing) {
      updateTemplate(existing.id, data);
      addToast({ type: 'success', message: 'Template updated!' });
    } else {
      createTemplate(data);
      addToast({ type: 'success', message: 'Template created!' });
    }
    closeEditor();
  };

  const insertVariable = (varName: string) => {
    setContent((prev) => prev + `{{${varName}}}`);
  };

  return (
    <BottomSheet isOpen={isEditorOpen} onClose={closeEditor} title={existing ? 'Edit Template' : 'Create Template'} maxHeight="95vh">
      <div className="space-y-4 pb-6">
        {/* Name */}
        <div>
          <label className="text-xs font-medium text-neutral-600 mb-1 block">Template Name *</label>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Welcome - New Lead"
            className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-neutral-600 mb-1 block">Category</label>
          <select
            value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-p13-yellow outline-none"
          >
            {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-neutral-600 mb-1 block">Description</label>
          <input
            value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this template"
            className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-p13-yellow outline-none"
          />
        </div>

        {/* Message Type */}
        <div>
          <label className="text-xs font-medium text-neutral-600 mb-1 block">Message Type</label>
          <div className="flex gap-2 flex-wrap">
            {messageTypes.map((mt) => (
              <button
                key={mt.key}
                onClick={() => setMessageType(mt.key)}
                className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  messageType === mt.key ? 'bg-p13-yellow border-p13-yellow text-p13-black' : 'bg-white border-neutral-200 text-neutral-600')}
              >
                <mt.icon size={12} />{mt.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Tone */}
        <div>
          <label className="text-xs font-medium text-neutral-600 mb-1 block">AI Tone</label>
          <div className="flex gap-2">
            {aiTones.map((t) => (
              <button
                key={t.key}
                onClick={() => setAiTone(aiTone === t.key ? undefined : t.key)}
                className={cn('flex-1 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all',
                  aiTone === t.key ? t.color : 'bg-white border-neutral-200 text-neutral-600')}
              >
                <t.icon size={13} />
                <div className="text-left">
                  <div className="font-semibold">{t.label}</div>
                  <div className="text-[10px] font-normal opacity-70">{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Variables */}
        <div>
          <label className="text-xs font-medium text-neutral-600 mb-1 block">Insert Variables</label>
          <div className="flex flex-wrap gap-1.5">
            {variables.map((v) => (
              <button
                key={v.name}
                onClick={() => insertVariable(v.name)}
                className="px-2 py-1 bg-p13-yellow/10 hover:bg-p13-yellow/20 text-p13-black text-[11px] font-medium rounded-md transition-colors flex items-center gap-1"
              >
                <Plus size={10} />{'{{'}{v.name}{'}}'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="text-xs font-medium text-neutral-600 mb-1 block">Message Content *</label>
          <textarea
            value={content} onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Type your message here... Use {{variable_name}} for dynamic content."
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none resize-none font-mono leading-relaxed"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-neutral-400">{content.length} characters</span>
            {detectedVars.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-neutral-400">Detected:</span>
                {detectedVars.map((v) => (
                  <span key={v} className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded">{v}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="flex gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
            <input type="checkbox" checked={automationEnabled} onChange={(e) => setAutomationEnabled(e.target.checked)} className="accent-p13-yellow" />
            <span className="flex items-center gap-1"><Bot size={12} /> Enable automation</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
            <input type="checkbox" checked={isFavorite} onChange={(e) => setIsFavorite(e.target.checked)} className="accent-p13-yellow" />
            <span>Mark as favorite</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
            <input type="checkbox" checked={status === 'archived'} onChange={(e) => setStatus(e.target.checked ? 'archived' : 'active')} className="accent-p13-yellow" />
            <span>Archive</span>
          </label>
        </div>

        {/* Preview */}
        <div>
          <label className="text-xs font-medium text-neutral-600 mb-1 block">Live Preview</label>
          <div className="bg-[#E5DDD5] rounded-xl p-4">
            <MessagePreview message={preview} mediaType={messageType !== 'text' ? messageType : undefined} status="sent" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button onClick={closeEditor} className="flex-1 h-11 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 h-11 bg-p13-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
            <Save size={14} />{existing ? 'Update' : 'Create'} Template
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
