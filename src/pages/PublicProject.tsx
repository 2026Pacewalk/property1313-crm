import { useParams, useNavigate } from 'react-router';
import { MapPin, IndianRupee, Phone, MessageCircle, Calculator, Home, Shield, Waves, Dumbbell, Users, TreePine, Car, Sparkles, Play, Navigation, Pencil } from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { useUIStore } from '@/stores/uiStore';
import { usePermission } from '@/stores/authStore';
import { useState } from 'react';
import BottomSheet from '@/components/shared/BottomSheet';
import { ArrowUpDown } from 'lucide-react';

const amenities = [
  { icon: Waves, label: 'Swimming Pool' }, { icon: Dumbbell, label: 'Gym' },
  { icon: Users, label: 'Club House' }, { icon: Sparkles, label: 'Play Area' },
  { icon: TreePine, label: 'Jogging Track' }, { icon: Shield, label: '24/7 Security' },
  { icon: Home, label: 'Power Backup' }, { icon: Car, label: 'Parking' },
  { icon: ArrowUpDown, label: 'Lift' }, { icon: TreePine, label: 'Garden' },
  { icon: Sparkles, label: 'Indoor Games' }, { icon: Users, label: 'Community Hall' },
];

export default function PublicProject() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { projects } = useDataStore();
  const { addToast } = useUIStore();
  const { can } = usePermission();
  const project = projects.find(p => p.slug === slug) || projects[0];
  const [activeTab, setActiveTab] = useState('photos');
  const [showLoan, setShowLoan] = useState(false);
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const emi = Math.round(loanAmount * (rate / 1200) * Math.pow(1 + rate / 1200, tenure * 12) / (Math.pow(1 + rate / 1200, tenure * 12) - 1));
  const totalInterest = emi * tenure * 12 - loanAmount;
  const totalPayment = loanAmount + totalInterest;

  const details = [
    { label: 'Property Type', value: project.propertyType.join(', ') },
    { label: 'Total Units', value: String(project.totalUnits || 'N/A') },
    { label: 'Possession', value: project.possession || 'N/A' },
    { label: 'RERA ID', value: project.reraId || 'N/A' },
    { label: 'Land Area', value: project.landArea || 'N/A' },
    { label: 'Floors', value: project.floors || 'N/A' },
  ];

  return (
    <div className="min-h-screen bg-card">
      {/* Header */}
      <header className="h-14 bg-card flex items-center px-4 border-b border-border sticky top-0 z-10">
        <img src="/logo-website.png" alt="Property1313" className="h-6 w-auto" />
        <div className="ml-auto flex gap-2 items-center">
          {can('manage_projects') && (
            <button onClick={() => navigate(`/projects/${project.slug}/edit`)}
              className="flex items-center gap-1.5 h-9 px-3 bg-muted text-foreground/80 rounded-lg text-xs font-medium hover:bg-neutral-200 transition-all"
              title="Edit Project">
              <Pencil size={13} /> Edit
            </button>
          )}
          <a href={`tel:+919876543210`} className="flex items-center gap-1.5 bg-p13-yellow text-p13-black px-4 py-2 rounded-lg text-sm font-semibold">
            <Phone size={14} /> Call Now
          </a>
        </div>
      </header>

      {/* Hero */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">{project.name}</h1>
          <div className="flex items-center gap-1.5 text-white/80 text-sm mt-1">
            <MapPin size={14} />
            <span>{project.location}</span>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-1.5">
          <IndianRupee size={18} className="text-p13-black" />
          <span className="text-xl md:text-2xl font-bold">Starting from Rs.{(project.minPrice / 100000).toFixed(0)} Lakhs</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{project.propertyType.join(' | ')}</p>
      </div>

      {/* Details Grid */}
      <div className="px-4 py-5 bg-muted">
        <h2 className="text-lg font-semibold mb-4">Project Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {details.map(d => (
            <div key={d.label} className="bg-card rounded-lg p-3">
              <p className="text-[11px] text-muted-foreground">{d.label}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{d.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="px-4 py-5">
        <h2 className="text-lg font-semibold mb-4">Amenities & Features</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {amenities.map((a, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-11 h-11 rounded-full bg-p13-yellow/10 flex items-center justify-center mb-1.5">
                <a.icon size={20} className="text-p13-yellow" />
              </div>
              <span className="text-xs text-muted-foreground">{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Media Tabs */}
      <div className="px-4 py-5 bg-muted">
        <div className="flex gap-4 border-b border-border mb-4">
          {['photos', 'video', 'location'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'text-p13-black border-b-2 border-p13-yellow' : 'text-muted-foreground'}`}>
              {tab}
            </button>
          ))}
        </div>
        {activeTab === 'photos' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {project.galleryImages.map((img, i) => (
              <img key={i} src={img} alt={`Gallery ${i + 1}`} className="w-full h-32 object-cover rounded-lg" loading="lazy" />
            ))}
          </div>
        )}
        {activeTab === 'video' && (
          <div className="aspect-video bg-neutral-200 rounded-lg flex items-center justify-center relative">
            <Play size={48} className="text-white/80" />
            {project.youtubeUrl && <p className="absolute bottom-2 text-xs text-muted-foreground">{project.youtubeUrl}</p>}
          </div>
        )}
        {activeTab === 'location' && (
          <div className="aspect-video bg-neutral-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{project.location}</p>
              <button className="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1 mx-auto">
                <Navigation size={12} /> Get Directions
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EMI Calculator */}
      <div className="px-4 py-5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Calculator size={18} /> EMI Calculator</h2>
        <div className="bg-muted rounded-xl p-4">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Loan Amount: Rs.{(loanAmount / 100000).toFixed(0)}L</label>
              <input type="range" min="1000000" max="50000000" step="100000" value={loanAmount}
                onChange={e => setLoanAmount(Number(e.target.value))}
                className="w-full h-1 bg-neutral-300 rounded-full accent-p13-yellow" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Interest Rate: {rate}%</label>
              <input type="range" min="6" max="15" step="0.1" value={rate}
                onChange={e => setRate(Number(e.target.value))}
                className="w-full h-1 bg-neutral-300 rounded-full accent-p13-yellow" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tenure: {tenure} Years</label>
              <input type="range" min="5" max="30" step="1" value={tenure}
                onChange={e => setTenure(Number(e.target.value))}
                className="w-full h-1 bg-neutral-300 rounded-full accent-p13-yellow" />
            </div>
            <div className="bg-card rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Monthly EMI</p>
              <p className="text-2xl font-bold text-foreground">Rs.{emi.toLocaleString()}</p>
              <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>Total Interest: Rs.{(totalInterest / 100000).toFixed(1)}L</span>
                <span>Total: Rs.{(totalPayment / 100000).toFixed(1)}L</span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowLoan(true)} className="w-full h-10 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold mt-3">
            Apply for Loan
          </button>
        </div>
      </div>

      {/* Callback Form */}
      <div className="px-4 py-5 bg-muted">
        <h2 className="text-lg font-semibold mb-3">Interested? Request a Callback</h2>
        <div className="space-y-3">
          <input placeholder="Your Name" className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm" />
          <input placeholder="Phone Number" className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm" />
          <input placeholder="Email" className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm" />
          <select className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm">
            <option>Preferred Time</option><option>Morning (9AM-12PM)</option><option>Afternoon (12PM-5PM)</option><option>Evening (5PM-8PM)</option>
          </select>
          <button onClick={() => { addToast({ type: 'success', message: 'Callback requested!' }); }}
            className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold">
            Request Callback
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card py-5 text-center">
        <img src="/logo-footer.png" alt="Property1313" className="h-6 w-auto mx-auto mb-1" />
      </footer>

      {/* Bottom CTA (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 h-14 bg-card border-t border-border flex items-center gap-3 px-4 z-40 md:hidden" style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.08)' }}>
        <a href="tel:+919876543210" className="flex-1 h-10 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5">
          <Phone size={14} /> Call Now
        </a>
        <button onClick={() => { addToast({ type: 'info', message: 'Opening WhatsApp...' }); }}
          className="flex-1 h-10 bg-green-500 text-foreground rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5">
          <MessageCircle size={14} /> WhatsApp
        </button>
      </div>

      {/* Loan Inquiry Sheet */}
      <BottomSheet isOpen={showLoan} onClose={() => setShowLoan(false)} title="Home Loan Inquiry">
        <div className="space-y-3 py-2">
          <input placeholder="Full Name" className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm" />
          <input placeholder="Phone Number" className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm" />
          <input placeholder="Email" className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm" />
          <input placeholder="Loan Amount Required" type="number" className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm" />
          <select className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm"><option>Salaried</option><option>Self-employed</option></select>
          <input placeholder="Monthly Income" type="number" className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm" />
          <button onClick={() => { addToast({ type: 'success', message: 'Loan inquiry submitted!' }); setShowLoan(false); }}
            className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold">Submit Inquiry</button>
        </div>
      </BottomSheet>
    </div>
  );
}
