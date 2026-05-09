import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Star, Clock, Sparkles, MessageCircle, Heart,
  ChevronRight, Flame, Snowflake, Sun, ExternalLink,
  CheckCircle, AlertTriangle, Smartphone, Monitor, Link2,
} from 'lucide-react';
import { useWhatsAppStore } from '@/stores/whatsappStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import type { WhatsAppTemplate } from '@/types';
import {
  isMobileDevice, isValidWhatsAppNumber, getSendMethodLabel, openWhatsApp,
} from '@/lib/whatsapp';
import MessagePreview from './MessagePreview';
import BottomSheet from './BottomSheet';

const toneIcons: Record<string, React.ReactNode> = {
  hot: <Flame size={12} className="text-orange-500" />,
  warm: <Sun size={12} className="text-yellow-500" />,
  cold: <Snowflake size={12} className="text-blue-400" />,
};

export default function TemplatePicker() {
  const {
    isPickerOpen, closePicker, pickerContext, pendingConfirmation,
    getFavorites, getRecent, getSuggested, getFilteredTemplates,
    toggleFavorite, renderMessage, logWhatsAppOpen, markAsSent,
    clearPendingConfirmation, categories,
  } = useWhatsAppStore();
  const { addToast } = useUIStore();
  const { user } = useAuthStore();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [previewMessage, setPreviewMessage] = useState('');
  const [opening, setOpening] = useState(false);
  const [openFailed, setOpenFailed] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recent'>('all');

  const leadScore = 'warm';
  const favorites = getFavorites();
  const recent = getRecent();
  const suggested = getSuggested(leadScore);

  // Validation
  const userHasMobile = !!(user?.whatsappMobile || user?.phone);
  const leadPhone = pickerContext?.leadPhone || '';
  const leadPhoneValid = isValidWhatsAppNumber(leadPhone);
  const deviceLabel = getSendMethodLabel();
  const isMobile = isMobileDevice();

  const filtered = useMemo(() => {
    const templates = activeTab === 'favorites' ? favorites :
      activeTab === 'recent' ? recent :
      getFilteredTemplates();
    return templates.filter((t) => {
      if (activeCategory !== 'all' && t.category !== activeCategory) return false;
      if (search) {
        const s = search.toLowerCase();
        return t.name.toLowerCase().includes(s) || t.content.toLowerCase().includes(s) || t.category.toLowerCase().includes(s);
      }
      return t.status === 'active';
    });
  }, [activeTab, activeCategory, search, favorites, recent, getFilteredTemplates]);

  const buildContext = useCallback((): Record<string, string> => ({
    customer_name: pickerContext?.leadName || 'Customer',
    project_name: pickerContext?.projectName || 'Our Project',
    project_location: 'Prime Location',
    sales_person_name: user?.name || 'Team',
    user_mobile: user?.whatsappMobile || user?.phone || '',
    company_name: 'Property1313',
    company_mobile: '8910001313',
    visit_date: new Date().toLocaleDateString(),
    visit_time: '10:30 AM',
    callback_time: '2:00 PM today',
    public_project_link: `https://p1313.com/p/${pickerContext?.projectName?.toLowerCase().replace(/\s+/g, '-') || 'project'}`,
  }), [pickerContext, user]);

  const handleSelectTemplate = (template: WhatsAppTemplate) => {
    const rendered = renderMessage(template, buildContext());
    setPreviewMessage(rendered);
    setSelectedTemplate(template);
    setOpenFailed(false);
    setManualUrl('');
  };

  /**
   * CRITICAL: window.open() MUST be called synchronously from the click handler.
   * Browsers block popups that are not directly triggered by user gesture.
   * This function is called directly from onClick — no async, no setTimeout.
   */
  const handleOpenWhatsApp = () => {
    if (!selectedTemplate || !pickerContext?.leadName || !leadPhoneValid || !userHasMobile) return;

    setOpening(true);
    setOpenFailed(false);

    // STEP 1: Open WhatsApp synchronously from click handler (REQUIRED for popup permission)
    const result = openWhatsApp({
      phone: pickerContext.leadPhone || '',
      message: previewMessage,
    });

    if (result.opened) {
      addToast({ type: 'success', message: `Opening WhatsApp for ${pickerContext.leadName}...` });
    } else {
      // Popup blocked — show manual button with URL
      setOpenFailed(true);
      setManualUrl(result.url);
      addToast({ type: 'error', message: 'Popup blocked. Use the button below to open WhatsApp.' });
    }

    // STEP 2: Log the action (async, after opening)
    // This runs after the synchronous open so it doesn't block the user gesture
    try {
      logWhatsAppOpen({
        templateId: selectedTemplate.id,
        leadId: pickerContext.leadId,
        leadName: pickerContext.leadName,
        leadPhone: pickerContext.leadPhone || '',
        userId: user?.id || 'unknown',
        userName: user?.name || 'Unknown',
        userMobile: user?.whatsappMobile || user?.phone || '',
        renderedContent: previewMessage,
        method: isMobile ? 'user_device_manual' : 'whatsapp_web',
      });
    } catch {
      // Log error silently
    }

    setOpening(false);
  };

  const handleMarkAsSent = () => {
    if (pendingConfirmation) {
      markAsSent(pendingConfirmation.logId);
      addToast({ type: 'success', message: 'Message marked as sent!' });
    }
  };

  const handleClose = () => {
    setSearch('');
    setActiveCategory('all');
    setSelectedTemplate(null);
    setPreviewMessage('');
    setOpening(false);
    setOpenFailed(false);
    setManualUrl('');
    setActiveTab('all');
    clearPendingConfirmation();
    closePicker();
  };

  const categoryOptions = [{ id: 'all', name: 'All' }, ...categories.map((c) => ({ id: c.name, name: c.name }))];

  return (
    <BottomSheet isOpen={isPickerOpen} onClose={handleClose} title="Send WhatsApp Message" maxHeight="92vh">
      <div className="space-y-3 pb-6">
        {/* Validation errors */}
        {!userHasMobile && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-700">Mobile number required</p>
              <p className="text-[11px] text-red-600">Please add your mobile number in your profile before sending WhatsApp messages.</p>
            </div>
          </div>
        )}
        {userHasMobile && !leadPhoneValid && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-700">Invalid lead number</p>
              <p className="text-[11px] text-red-600">Lead mobile number is invalid or missing.</p>
            </div>
          </div>
        )}

        {/* Mark as Sent Confirmation */}
        {pendingConfirmation && !selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink size={16} className="text-green-600" />
              <p className="text-sm font-semibold text-green-800">WhatsApp opened</p>
            </div>
            <p className="text-xs text-green-700 mb-3">
              Message to <strong>{pendingConfirmation.leadName}</strong> was opened in WhatsApp.
              Please confirm after sending.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleMarkAsSent}
                className="flex-1 h-10 bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-green-700 transition-all"
              >
                <CheckCircle size={14} /> Mark as Sent
              </button>
              <button
                onClick={clearPendingConfirmation}
                className="h-10 px-4 bg-white border border-neutral-200 text-neutral-600 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Search */}
        {!selectedTemplate && !pendingConfirmation && (
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full h-10 pl-9 pr-9 rounded-lg border border-neutral-200 bg-white text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Template Selection */}
        {!selectedTemplate && !pendingConfirmation && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
              {[
                { key: 'all' as const, label: 'All', icon: MessageCircle },
                { key: 'favorites' as const, label: 'Favorites', icon: Heart },
                { key: 'recent' as const, label: 'Recent', icon: Clock },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={cn('flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all',
                    activeTab === t.key ? 'bg-white text-p13-black shadow-sm' : 'text-neutral-500')}
                >
                  <t.icon size={12} />{t.label}
                </button>
              ))}
            </div>

            {/* Suggested for lead */}
            {activeTab === 'all' && !search && suggested.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={13} className="text-p13-yellow" />
                  <span className="text-xs font-semibold text-neutral-700">Suggested for this lead</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
                  {suggested.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTemplate(t)}
                      className="snap-start flex-shrink-0 bg-gradient-to-br from-p13-black to-neutral-800 text-white rounded-lg px-3 py-2 text-left min-w-[140px] max-w-[180px]"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {t.aiTone && toneIcons[t.aiTone]}
                        <span className="text-[11px] font-medium truncate">{t.name}</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-2">{t.category}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {categoryOptions.slice(0, 8).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={cn('flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border',
                    activeCategory === c.id
                      ? 'bg-p13-yellow text-p13-black border-p13-yellow'
                      : 'bg-white text-neutral-600 border-neutral-200')}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Template List */}
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle size={32} className="text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">No templates found</p>
                </div>
              ) : (
                filtered.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => handleSelectTemplate(template)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* Preview & Open WhatsApp */}
        {selectedTemplate && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Back button */}
              <button
                onClick={() => { setSelectedTemplate(null); setPreviewMessage(''); setOpenFailed(false); setManualUrl(''); }}
                className="text-xs text-neutral-500 flex items-center gap-1 mb-3"
              >
                <ChevronRight size={12} className="rotate-180" /> Back to templates
              </button>

              {/* Template info */}
              <div className="bg-white rounded-lg border border-neutral-200 p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedTemplate.aiTone && toneIcons[selectedTemplate.aiTone]}
                    <div>
                      <p className="text-sm font-semibold">{selectedTemplate.name}</p>
                      <p className="text-[11px] text-neutral-500">{selectedTemplate.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(selectedTemplate.id)}
                    className={cn('p-1.5 rounded-full', selectedTemplate.isFavorite ? 'text-p13-yellow' : 'text-neutral-300')}
                  >
                    <Star size={16} fill={selectedTemplate.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {/* WhatsApp Preview */}
              <div className="bg-[#E5DDD5] rounded-xl p-4 mb-3">
                <p className="text-[10px] text-neutral-500 text-center mb-3 uppercase tracking-wider">WhatsApp Preview</p>
                <MessagePreview
                  message={previewMessage}
                  mediaType={selectedTemplate.messageType !== 'text' ? selectedTemplate.messageType : undefined}
                  mediaUrl={selectedTemplate.mediaUrl}
                  status="sent"
                />
              </div>

              {/* Sender info */}
              <div className="flex items-center gap-2 mb-3 bg-neutral-50 rounded-lg p-2.5">
                {isMobile ? <Smartphone size={14} className="text-green-600" /> : <Monitor size={14} className="text-green-600" />}
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-neutral-700">Sending from your {deviceLabel}</p>
                  <p className="text-[10px] text-neutral-500">
                    {user?.whatsappMobile || user?.phone || 'No mobile set'}
                  </p>
                </div>
              </div>

              {/* Main: Open WhatsApp Button — called DIRECTLY from onClick */}
              {!openFailed && (
                <button
                  onClick={handleOpenWhatsApp}
                  disabled={opening || !userHasMobile || !leadPhoneValid}
                  className="w-full h-12 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {opening ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Opening WhatsApp...
                    </>
                  ) : (
                    <>
                      <ExternalLink size={16} />
                      Open WhatsApp {deviceLabel} for {pickerContext?.leadName || 'Lead'}
                    </>
                  )}
                </button>
              )}

              {/* Fallback: Manual open button if popup blocked */}
              {openFailed && manualUrl && (
                <div className="space-y-2">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700">
                      WhatsApp could not open automatically.
                      Click the button below to open manually.
                    </p>
                  </div>
                  <a
                    href={manualUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 flex items-center justify-center gap-2 transition-all"
                  >
                    <Link2 size={16} /> Open WhatsApp Manually
                  </a>
                </div>
              )}

              {/* Validation messages */}
              {!userHasMobile && (
                <p className="text-[10px] text-red-500 mt-1.5 text-center">
                  Add your mobile number in Profile to enable WhatsApp sending
                </p>
              )}
              {userHasMobile && !leadPhoneValid && (
                <p className="text-[10px] text-red-500 mt-1.5 text-center">
                  Lead phone number is invalid for WhatsApp
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </BottomSheet>
  );
}

function TemplateCard({ template, onSelect, onToggleFavorite }: {
  template: WhatsAppTemplate;
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  const toneColor: Record<string, string> = {
    hot: 'text-orange-500',
    warm: 'text-yellow-500',
    cold: 'text-blue-400',
  };

  return (
    <div
      className="bg-white rounded-lg border border-neutral-200 p-3 hover:border-p13-yellow transition-all cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-semibold truncate">{template.name}</span>
            {template.aiTone && (
              <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-neutral-100', toneColor[template.aiTone])}>
                {template.aiTone.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 line-clamp-2 mb-1.5">{template.content.slice(0, 100)}...</p>
          <div className="flex items-center gap-2 text-[10px] text-neutral-400">
            <span>{template.category}</span>
            {template.automationEnabled && <span className="text-blue-500">Auto</span>}
            <span>{template.usageCount} uses</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 ml-2">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={cn('p-1 rounded-full transition-colors', template.isFavorite ? 'text-p13-yellow' : 'text-neutral-300 hover:text-neutral-500')}
          >
            <Star size={14} fill={template.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <ChevronRight size={14} className="text-neutral-300 group-hover:text-p13-yellow transition-colors" />
        </div>
      </div>
    </div>
  );
}
