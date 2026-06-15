import { useParams, useNavigate } from 'react-router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Phone, MessageCircle, Calculator, Home, Shield, Waves, Dumbbell,
  Users, TreePine, Car, Sparkles, Navigation, Pencil, Building2,
  ArrowUpDown, Zap, Gamepad2, Footprints, Trees, CheckCircle2, BedDouble,
  CalendarClock, Layers, Ruler, BadgeCheck, ChevronRight, Star,
} from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { useUIStore } from '@/stores/uiStore';
import { usePermission } from '@/stores/authStore';
import { normalizeMobile } from '@/lib/phone-validation';
import BottomSheet from '@/components/shared/BottomSheet';

// Map amenity labels to icons (with a sensible fallback)
const AMENITY_ICONS: Record<string, typeof Home> = {
  'Swimming Pool': Waves,
  'Gym': Dumbbell,
  'Club House': Users,
  'Children Play Area': Sparkles,
  'Play Area': Sparkles,
  '24/7 Security': Shield,
  'Power Backup': Zap,
  'Parking': Car,
  'Jogging Track': Footprints,
  'Garden': Trees,
  'Lift': ArrowUpDown,
  'Indoor Games': Gamepad2,
  'Community Hall': Building2,
  'Landscaped Gardens': TreePine,
};
const getAmenityIcon = (label: string) => AMENITY_ICONS[label] || CheckCircle2;

// Indian-format price: ₹1.50 Cr / ₹45 L
const formatPrice = (n: number) => {
  if (!n) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  return `₹${Math.round(n / 100000)} L`;
};

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function PublicProject() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { projects, addLead, addLoanInquiry } = useDataStore();
  const { addToast } = useUIStore();
  const { can } = usePermission();
  const project = projects.find((p) => p.slug === slug);

  const [showLoan, setShowLoan] = useState(false);
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  // Enquiry form
  const [enqName, setEnqName] = useState('');
  const [enqPhone, setEnqPhone] = useState('');
  const [enqEmail, setEnqEmail] = useState('');
  const [enqTime, setEnqTime] = useState('');

  // Loan inquiry form
  const [lName, setLName] = useState('');
  const [lPhone, setLPhone] = useState('');
  const [lEmail, setLEmail] = useState('');
  const [lAmount, setLAmount] = useState('');
  const [lEmployment, setLEmployment] = useState('Salaried');
  const [lIncome, setLIncome] = useState('');

  const openWhatsApp = () => {
    const text = encodeURIComponent(`Hi, I'm interested in ${project?.name ?? 'your project'}. Please share more details.`);
    window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
  };

  if (!project) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-background">
        <Home size={48} className="text-muted-foreground/40 mb-4" />
        <h2 className="text-lg font-semibold">Project not found</h2>
        <p className="text-sm text-muted-foreground mt-1">This project may have been removed or the link is incorrect.</p>
        <button onClick={() => navigate('/projects')} className="mt-4 h-10 px-6 bg-p13-yellow text-p13-black rounded-lg text-sm font-medium hover:bg-p13-yellow/90">
          Back to Projects
        </button>
      </div>
    );
  }

  const emi = Math.round(loanAmount * (rate / 1200) * Math.pow(1 + rate / 1200, tenure * 12) / (Math.pow(1 + rate / 1200, tenure * 12) - 1));
  const totalInterest = emi * tenure * 12 - loanAmount;
  const totalPayment = loanAmount + totalInterest;

  const gallery = [...new Set([project.coverImage, ...project.galleryImages].filter(Boolean))];

  const heroStats = [
    { icon: BedDouble, label: 'Configurations', value: project.propertyType.join(' · ') },
    { icon: CalendarClock, label: 'Possession', value: project.possession || 'On Request' },
    { icon: Building2, label: 'Total Units', value: project.totalUnits ? `${project.totalUnits} Units` : 'On Request' },
  ];

  const details = [
    { icon: BedDouble, label: 'Property Type', value: project.propertyType.join(', ') },
    { icon: Building2, label: 'Total Units', value: String(project.totalUnits || 'N/A') },
    { icon: CalendarClock, label: 'Possession', value: project.possession || 'N/A' },
    { icon: BadgeCheck, label: 'RERA ID', value: project.reraId || 'N/A' },
    { icon: Ruler, label: 'Land Area', value: project.landArea || 'N/A' },
    { icon: Layers, label: 'Floors', value: project.floors || 'N/A' },
  ];

  const handleEnquiry = () => {
    if (!enqName.trim()) { addToast({ type: 'error', message: 'Please enter your name' }); return; }
    if (!/^\d{10}$/.test(enqPhone.replace(/\D/g, '').slice(-10))) { addToast({ type: 'error', message: 'Enter a valid 10-digit phone' }); return; }
    const now = new Date().toISOString();
    addLead({
      id: `l${Date.now()}`,
      name: enqName.trim(),
      phone: normalizeMobile(enqPhone),
      email: enqEmail.trim() || undefined,
      status: 'new',
      source: 'Website',
      inquirySource: 'Website',
      projectInterest: project!.name,
      preferredLocation: project!.location,
      initialRemark: enqTime ? `Preferred callback: ${enqTime}` : undefined,
      assignedTo: 'u1',
      leadScore: 'warm',
      createdAt: now, updatedAt: now, lastActivityAt: now,
    });
    addToast({ type: 'success', message: `Thanks ${enqName.split(' ')[0]}! Our team will call you shortly.` });
    setEnqName(''); setEnqPhone(''); setEnqEmail(''); setEnqTime('');
  };

  const handleLoanSubmit = () => {
    if (!lName.trim()) { addToast({ type: 'error', message: 'Please enter your name' }); return; }
    if (!/^\d{10}$/.test(lPhone.replace(/\D/g, '').slice(-10))) { addToast({ type: 'error', message: 'Enter a valid 10-digit phone' }); return; }
    addLoanInquiry({
      id: `loan_${Date.now()}`,
      name: lName.trim(),
      phone: normalizeMobile(lPhone),
      email: lEmail.trim() || undefined,
      loanAmount: lAmount ? Number(lAmount) : 0,
      employmentType: lEmployment,
      monthlyIncome: lIncome ? Number(lIncome) : undefined,
      linkedProject: project!.name,
      status: 'new',
      assignedTo: 'u1',
      createdAt: new Date().toISOString(),
    });
    addToast({ type: 'success', message: 'Loan inquiry submitted! Our team will reach out.' });
    setLName(''); setLPhone(''); setLEmail(''); setLAmount(''); setLEmployment('Salaried'); setLIncome('');
    setShowLoan(false);
  };

  const directionsUrl = `https://maps.google.com/?q=${encodeURIComponent(project.location)}`;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* ===== Header ===== */}
      <header className="h-14 bg-background/80 backdrop-blur-md flex items-center px-4 md:px-8 border-b border-border sticky top-0 z-30">
        <button onClick={() => navigate('/listings')} title="All projects">
          <img src="/logo-website.png" alt="Property1313" className="h-6 w-auto" />
        </button>
        <div className="ml-auto flex gap-2 items-center">
          {can('manage_projects') && (
            <button onClick={() => navigate(`/projects/${project.slug}/edit`)}
              className="flex items-center gap-1.5 h-9 px-3 bg-muted text-foreground/80 rounded-lg text-xs font-medium hover:bg-muted/70 transition-all"
              title="Edit Project">
              <Pencil size={13} /> Edit
            </button>
          )}
          <a href="tel:+919876543210" className="hidden sm:flex items-center gap-1.5 bg-p13-yellow text-p13-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-p13-yellow/90 transition-all">
            <Phone size={14} /> Call Now
          </a>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative h-[62vh] min-h-[440px] md:h-[72vh] overflow-hidden">
        <motion.img
          src={project.coverImage}
          alt={project.name}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

        <div className="absolute inset-x-0 bottom-0 px-4 md:px-8 pb-6 md:pb-10 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {project.status === 'active' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/90 text-white text-[11px] font-semibold backdrop-blur">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Now Selling
                </span>
              )}
              {project.reraId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-medium backdrop-blur border border-white/20">
                  <BadgeCheck size={12} /> RERA Approved
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-p13-yellow text-p13-black text-[11px] font-bold">
                <Star size={11} className="fill-current" /> Premium
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-1.5 text-white/85 text-sm md:text-base mt-2">
              <MapPin size={16} className="text-p13-yellow" />
              <span>{project.location}</span>
            </div>

            <div className="mt-4 inline-flex items-baseline gap-2 bg-black/40 backdrop-blur px-4 py-2.5 rounded-xl border border-white/10">
              <span className="text-white/70 text-xs">Starting from</span>
              <span className="text-2xl md:text-3xl font-bold text-p13-yellow">{formatPrice(project.minPrice)}</span>
              {project.maxPrice > project.minPrice && (
                <span className="text-white/60 text-sm">– {formatPrice(project.maxPrice)}</span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Hero quick-stats strip ===== */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-3 divide-x divide-border">
          {heroStats.map((s) => (
            <div key={s.label} className="px-3 md:px-6 py-4 flex items-center gap-3">
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-p13-yellow/10 items-center justify-center flex-shrink-0">
                <s.icon size={18} className="text-p13-yellow" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <p className="text-xs md:text-sm font-semibold text-foreground truncate">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 grid lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-12">
          {/* Overview */}
          <Reveal>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">Overview</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{project.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.propertyType.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm font-medium text-foreground">
                  <BedDouble size={14} className="text-p13-yellow" /> {t}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Configurations & Pricing */}
          <Reveal>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Configurations & Pricing</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {project.propertyType.map((type, i) => {
                // Spread price across configs for an indicative range
                const span = (project.maxPrice - project.minPrice) / Math.max(1, project.propertyType.length - 1);
                const price = Math.round(project.minPrice + span * i);
                return (
                  <div key={type} className="group rounded-2xl border border-border bg-card p-4 hover:border-p13-yellow/60 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-p13-yellow/10 flex items-center justify-center">
                          <BedDouble size={16} className="text-p13-yellow" />
                        </div>
                        <span className="font-semibold text-foreground">{type}</span>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-p13-yellow group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Starting at</p>
                    <p className="text-lg font-bold text-foreground">{formatPrice(price)}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Amenities */}
          {project.amenities.length > 0 && (
            <Reveal>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Amenities & Features</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {project.amenities.map((a) => {
                  const Icon = getAmenityIcon(a);
                  return (
                    <div key={a} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-p13-yellow/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-p13-yellow" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{a}</span>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          )}

          {/* Gallery */}
          {gallery.length > 0 && (
            <Reveal>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {gallery.map((img, i) => (
                  <div key={i} className={`relative overflow-hidden rounded-2xl group ${i === 0 ? 'col-span-2 md:col-span-2 row-span-2 aspect-[4/3]' : 'aspect-square'}`}>
                    <img src={img} alt={`${project.name} ${i + 1}`} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {/* Project details */}
          <Reveal>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Project Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {details.map((d) => (
                <div key={d.label} className="rounded-2xl border border-border bg-card p-4">
                  <d.icon size={18} className="text-p13-yellow mb-2" />
                  <p className="text-[11px] text-muted-foreground">{d.label}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 break-words">{d.value}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* EMI Calculator */}
          <Reveal>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Calculator size={20} className="text-p13-yellow" /> EMI Calculator
            </h2>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-5 space-y-5">
                  <Slider label="Loan Amount" value={`${formatPrice(loanAmount)}`} min={1000000} max={50000000} step={100000} val={loanAmount} onChange={setLoanAmount} />
                  <Slider label="Interest Rate" value={`${rate}%`} min={6} max={15} step={0.1} val={rate} onChange={setRate} />
                  <Slider label="Tenure" value={`${tenure} Years`} min={5} max={30} step={1} val={tenure} onChange={setTenure} />
                </div>
                <div className="bg-gradient-to-br from-p13-black to-neutral-800 p-6 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-white/60">Your Monthly EMI</p>
                  <p className="text-3xl md:text-4xl font-bold text-p13-yellow mt-1">₹{emi.toLocaleString('en-IN')}</p>
                  <div className="grid grid-cols-2 gap-3 mt-5 w-full">
                    <div className="bg-white/5 rounded-lg p-2.5">
                      <p className="text-[10px] text-white/50">Total Interest</p>
                      <p className="text-sm font-semibold text-white">{formatPrice(totalInterest)}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2.5">
                      <p className="text-[10px] text-white/50">Total Amount</p>
                      <p className="text-sm font-semibold text-white">{formatPrice(totalPayment)}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowLoan(true)} className="w-full h-10 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold mt-5 hover:bg-p13-yellow/90 transition-all">
                    Apply for Home Loan
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Location */}
          <Reveal>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Location</h2>
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="aspect-[16/7] bg-muted flex items-center justify-center relative">
                <div className="text-center">
                  <MapPin size={36} className="text-p13-yellow mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{project.location}</p>
                </div>
              </div>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-12 bg-card text-foreground text-sm font-semibold hover:bg-muted/50 transition-colors border-t border-border">
                <Navigation size={15} className="text-p13-yellow" /> Get Directions
              </a>
            </div>
          </Reveal>
        </div>

        {/* Right column — sticky enquiry card (desktop) */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-20 space-y-4">
            <Reveal>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-foreground">{formatPrice(project.minPrice)}</span>
                  {project.maxPrice > project.minPrice && <span className="text-sm text-muted-foreground">– {formatPrice(project.maxPrice)}</span>}
                </div>
                <p className="text-xs text-muted-foreground mb-4">{project.propertyType.join(' · ')} · {project.location}</p>

                <h3 className="text-sm font-semibold text-foreground mb-3">Request a Callback</h3>
                <div className="space-y-2.5">
                  <input value={enqName} onChange={(e) => setEnqName(e.target.value)} placeholder="Your Name"
                    className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 transition-all" />
                  <input value={enqPhone} onChange={(e) => setEnqPhone(e.target.value)} inputMode="numeric" placeholder="Phone Number"
                    className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 transition-all" />
                  <input value={enqEmail} onChange={(e) => setEnqEmail(e.target.value)} placeholder="Email (optional)"
                    className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 transition-all" />
                  <select value={enqTime} onChange={(e) => setEnqTime(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-p13-yellow">
                    <option value="">Preferred Time</option>
                    <option>Morning (9AM–12PM)</option>
                    <option>Afternoon (12PM–5PM)</option>
                    <option>Evening (5PM–8PM)</option>
                  </select>
                  <button onClick={handleEnquiry} className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold hover:bg-p13-yellow/90 transition-all">
                    Request Callback
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <a href="tel:+919876543210" className="flex items-center justify-center gap-1.5 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                    <Phone size={14} /> Call
                  </a>
                  <button onClick={openWhatsApp}
                    className="flex items-center justify-center gap-1.5 h-10 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors">
                    <MessageCircle size={14} /> WhatsApp
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </aside>
      </div>

      {/* ===== Footer ===== */}
      <footer className="bg-card border-t border-border py-8 text-center">
        <img src="/logo-footer.png" alt="Property1313" className="h-7 w-auto mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">© 2026 Property1313. All rights reserved.</p>
      </footer>

      {/* ===== Mobile bottom CTA ===== */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur border-t border-border flex items-center gap-3 px-4 z-40 md:hidden">
        <div className="flex-shrink-0">
          <p className="text-[10px] text-muted-foreground leading-none">Starting</p>
          <p className="text-base font-bold text-foreground">{formatPrice(project.minPrice)}</p>
        </div>
        <a href="tel:+919876543210" className="flex-1 h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5">
          <Phone size={15} /> Call
        </a>
        <button onClick={openWhatsApp}
          className="flex-1 h-11 bg-green-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5">
          <MessageCircle size={15} /> Enquire
        </button>
      </div>

      {/* ===== Loan Inquiry Sheet ===== */}
      <BottomSheet isOpen={showLoan} onClose={() => setShowLoan(false)} title="Home Loan Inquiry">
        <div className="space-y-3 py-2">
          <input value={lName} onChange={e => setLName(e.target.value)} placeholder="Full Name" className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-p13-yellow" />
          <input value={lPhone} onChange={e => setLPhone(e.target.value)} inputMode="numeric" placeholder="Phone Number" className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-p13-yellow" />
          <input value={lEmail} onChange={e => setLEmail(e.target.value)} placeholder="Email" className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-p13-yellow" />
          <input value={lAmount} onChange={e => setLAmount(e.target.value)} placeholder="Loan Amount Required" type="number" className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-p13-yellow" />
          <select value={lEmployment} onChange={e => setLEmployment(e.target.value)} className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-p13-yellow">
            <option>Salaried</option><option>Self-employed</option>
          </select>
          <input value={lIncome} onChange={e => setLIncome(e.target.value)} placeholder="Monthly Income" type="number" className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-p13-yellow" />
          <button onClick={handleLoanSubmit}
            className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold hover:bg-p13-yellow/90">Submit Inquiry</button>
        </div>
      </BottomSheet>
    </div>
  );
}

function Slider({ label, value, min, max, step, val, onChange }: {
  label: string; value: string; min: number; max: number; step: number; val: number; onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-sm font-semibold text-foreground">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-muted rounded-full accent-p13-yellow cursor-pointer" />
    </div>
  );
}
