import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  MessageCircle, Smartphone, CheckCircle2, RefreshCw, Link2, Unlink,
  QrCode, Info, Save, Send, Building2,
} from 'lucide-react';
import { useWhatsAppConnectionStore } from '@/stores/whatsappConnectionStore';
import { useUIStore } from '@/stores/uiStore';
import MessagePreview from '@/components/shared/MessagePreview';

export default function WhatsAppConnect() {
  const {
    businessNumber, businessName, connected, connectedAt, introMessage, autoIntro,
    setBusinessName, setIntroMessage, setAutoIntro, connect, disconnect, renderIntro,
  } = useWhatsAppConnectionStore();
  const { addToast } = useUIStore();

  const [numberInput, setNumberInput] = useState(businessNumber);
  const [connecting, setConnecting] = useState(false);
  const [introDraft, setIntroDraft] = useState(introMessage);
  const [nameDraft, setNameDraft] = useState(businessName);

  const waLink = `https://wa.me/${businessNumber}`;

  const handleConnect = () => {
    const digits = numberInput.replace(/\D/g, '');
    if (digits.length < 10) { addToast({ type: 'error', message: 'Enter a valid WhatsApp number with country code' }); return; }
    setConnecting(true);
    // Simulate the QR-link handshake (a real gateway/Cloud API would confirm here)
    setTimeout(() => {
      connect(digits);
      setConnecting(false);
      addToast({ type: 'success', message: 'WhatsApp connected!' });
    }, 1400);
  };

  const handleSaveIntro = () => {
    setIntroMessage(introDraft);
    setBusinessName(nameDraft);
    addToast({ type: 'success', message: 'Intro message saved' });
  };

  const sendTest = () => {
    const text = encodeURIComponent(renderIntro('there'));
    window.open(`https://wa.me/${businessNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="page-container pt-4 pb-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
          <MessageCircle size={18} className="text-green-600" />
        </div>
        <h1 className="text-h1-mobile md:text-h1-desktop font-semibold">WhatsApp</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Connect your WhatsApp to message clients and auto-send a company intro to new leads.</p>

      {/* Connection status / QR */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4">
        {connected ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={26} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Connected</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">+{businessNumber}</p>
              {connectedAt && <p className="text-[11px] text-muted-foreground">Since {new Date(connectedAt).toLocaleString()}</p>}
            </div>
            <button onClick={() => { disconnect(); addToast({ type: 'info', message: 'WhatsApp disconnected' }); }}
              className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
              <Unlink size={15} /> Disconnect
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* QR */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-3 rounded-2xl border border-border">
                <QRCodeSVG value={waLink} size={168} level="M" includeMargin={false} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1"><QrCode size={12} /> Scan to chat with you</p>
            </div>
            {/* Steps + connect */}
            <div className="flex-1">
              <h2 className="text-base font-semibold flex items-center gap-2"><Smartphone size={17} className="text-green-600" /> Link your WhatsApp</h2>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="font-semibold text-foreground">1.</span> Open WhatsApp on your phone</li>
                <li className="flex gap-2"><span className="font-semibold text-foreground">2.</span> Tap <b className="text-foreground">Settings → Linked Devices</b></li>
                <li className="flex gap-2"><span className="font-semibold text-foreground">3.</span> Tap <b className="text-foreground">Link a device</b> & scan the QR</li>
              </ol>
              <div className="mt-4">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Business WhatsApp number (with country code)</label>
                <div className="flex gap-2">
                  <input value={numberInput} onChange={(e) => setNumberInput(e.target.value)} inputMode="numeric" placeholder="91XXXXXXXXXX"
                    className="flex-1 h-11 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-p13-yellow" />
                  <button onClick={handleConnect} disabled={connecting}
                    className="h-11 px-4 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-60 flex items-center gap-1.5">
                    {connecting ? <RefreshCw size={15} className="animate-spin" /> : <Link2 size={15} />}
                    {connecting ? 'Connecting…' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="flex gap-2 bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mb-4">
        <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-[12px] text-blue-700 dark:text-blue-300 leading-relaxed">
          Messages are sent via WhatsApp's official link flow — each message opens in WhatsApp pre-filled, ready to send in one tap (no automation bans).
          For fully automated bulk sending, connect the <b>WhatsApp Business Cloud API</b> — this screen is built to plug it in.
        </p>
      </div>

      {/* Company intro message */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4">
        <h2 className="text-base font-semibold flex items-center gap-2 mb-1"><Building2 size={17} className="text-p13-yellow" /> Company Intro Message</h2>
        <p className="text-xs text-muted-foreground mb-4">Sent to every new lead. Use <code className="bg-muted px-1 rounded">{'{{name}}'}</code> to insert the lead's name.</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Name</label>
            <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-p13-yellow mb-3" />
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Intro Message</label>
            <textarea value={introDraft} onChange={(e) => setIntroDraft(e.target.value)} rows={9}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-p13-yellow resize-none" />
            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <button onClick={() => setAutoIntro(!autoIntro)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${autoIntro ? 'bg-green-500' : 'bg-muted'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoIntro ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
                <span className="text-xs text-foreground">Auto-send to new leads</span>
              </label>
              <button onClick={handleSaveIntro} className="flex items-center gap-1.5 h-9 px-3 bg-p13-yellow text-p13-black rounded-lg text-xs font-semibold hover:bg-p13-yellow/90">
                <Save size={14} /> Save
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Preview</label>
            <div className="bg-[#E5DDD5] dark:bg-[#0b141a] rounded-xl p-3">
              <MessagePreview message={renderIntro('Rahul')} status="read" />
            </div>
            <button onClick={sendTest} className="mt-3 w-full h-10 rounded-lg border border-green-200 text-green-600 text-sm font-medium hover:bg-green-50 flex items-center justify-center gap-1.5">
              <Send size={14} /> Send test to my number
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
