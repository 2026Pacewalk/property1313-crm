import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  Search, MapPin, Phone, Building2, BedDouble, CalendarClock, ArrowRight,
  SlidersHorizontal, X, Home, Eye, BadgeCheck, Star,
} from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';

// Indian-format price: ₹1.50 Cr / ₹45 L
const formatPrice = (n: number) => {
  if (!n) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  return `₹${Math.round(n / 100000)} L`;
};

type SortKey = 'featured' | 'price_low' | 'price_high';

export default function PublicListings() {
  const { projects } = useDataStore();

  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('all');
  const [types, setTypes] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>('featured');
  const [showFilters, setShowFilters] = useState(false);

  const locations = useMemo(() => [...new Set(projects.map((p) => p.location))], [projects]);
  const allTypes = useMemo(() => [...new Set(projects.flatMap((p) => p.propertyType))].sort(), [projects]);

  const toggleType = (t: string) =>
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const filtered = useMemo(() => {
    let list = projects.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
      const matchesLocation = location === 'all' || p.location === location;
      const matchesType = types.length === 0 || p.propertyType.some((t) => types.includes(t));
      return matchesQuery && matchesLocation && matchesType;
    });
    if (sort === 'price_low') list = [...list].sort((a, b) => a.minPrice - b.minPrice);
    else if (sort === 'price_high') list = [...list].sort((a, b) => b.minPrice - a.minPrice);
    return list;
  }, [projects, query, location, types, sort]);

  const hasFilters = query || location !== 'all' || types.length > 0;
  const clearAll = () => { setQuery(''); setLocation('all'); setTypes([]); };

  return (
    <div className="min-h-screen bg-background">
      {/* ===== Header ===== */}
      <header className="h-14 bg-background/80 backdrop-blur-md flex items-center px-4 md:px-8 border-b border-border sticky top-0 z-30">
        <Link to="/listings"><img src="/logo-website.png" alt="Property1313" className="h-6 w-auto" /></Link>
        <a href="tel:+919876543210" className="ml-auto flex items-center gap-1.5 bg-p13-yellow text-p13-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-p13-yellow/90 transition-all">
          <Phone size={14} /> Call Now
        </a>
      </header>

      {/* ===== Hero / Search ===== */}
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80"
          alt="Properties"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/70 to-black/50" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-p13-yellow text-p13-black text-[11px] font-bold mb-4">
              <Star size={11} className="fill-current" /> Premium Real Estate
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight max-w-2xl leading-tight">
              Find Your Dream Home in Tricity
            </h1>
            <p className="text-white/80 text-sm md:text-lg mt-3 max-w-xl">
              Explore handpicked premium projects with world-class amenities, RERA-approved and ready for you.
            </p>

            {/* Search bar */}
            <div className="mt-7 bg-card/95 backdrop-blur rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl shadow-2xl">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search size={18} className="text-muted-foreground flex-shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by project or location…"
                  className="w-full h-11 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-11 px-3 rounded-xl bg-muted text-sm text-foreground outline-none sm:w-44 focus:ring-2 focus:ring-p13-yellow/30"
              >
                <option value="all">All Locations</option>
                {locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <button className="h-11 px-5 rounded-xl bg-p13-yellow text-p13-black text-sm font-semibold hover:bg-p13-yellow/90 transition-all flex items-center justify-center gap-1.5">
                <Search size={15} /> Search
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Filter / sort bar ===== */}
      <div className="sticky top-14 z-20 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            <SlidersHorizontal size={15} /> Filters
            {types.length > 0 && <span className="w-5 h-5 rounded-full bg-p13-yellow text-p13-black text-[10px] font-bold flex items-center justify-center">{types.length}</span>}
          </button>

          {/* Inline BHK chips on larger screens */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto">
            {allTypes.map((t) => (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  types.includes(t) ? 'bg-p13-yellow text-p13-black' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:block text-xs text-muted-foreground">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground outline-none focus:border-p13-yellow"
            >
              <option value="featured">Featured</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Collapsible filter panel (BHK chips for mobile + clear) */}
        {showFilters && (
          <div className="max-w-6xl mx-auto px-4 md:px-8 pb-3 border-t border-border/50 pt-3">
            <div className="flex flex-wrap gap-1.5 md:hidden mb-2">
              {allTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    types.includes(t) ? 'bg-p13-yellow text-p13-black' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {hasFilters && (
              <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                <X size={13} /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ===== Listings grid ===== */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <Home size={48} className="text-muted-foreground/40 mb-4" />
            <h2 className="text-lg font-semibold">No projects match your search</h2>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search terms.</p>
            {hasFilters && (
              <button onClick={clearAll} className="mt-4 h-10 px-6 bg-p13-yellow text-p13-black rounded-lg text-sm font-medium hover:bg-p13-yellow/90">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
              >
                <Link
                  to={`/project/${p.slug}`}
                  className="group block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Media */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={p.coverImage} alt={p.name} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {p.status === 'active' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/90 text-white text-[10px] font-semibold backdrop-blur">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Now Selling
                        </span>
                      )}
                      {p.reraId && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-medium backdrop-blur border border-white/20">
                          <BadgeCheck size={11} /> RERA
                        </span>
                      )}
                    </div>

                    {/* View count */}
                    {p.viewCount > 0 && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 text-white text-[10px] backdrop-blur">
                        <Eye size={11} /> {p.viewCount >= 1000 ? `${(p.viewCount / 1000).toFixed(1)}k` : p.viewCount}
                      </span>
                    )}

                    {/* Title + price over image */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-bold text-white leading-tight">{p.name}</h3>
                      <div className="flex items-center gap-1 text-white/85 text-xs mt-0.5">
                        <MapPin size={12} className="text-p13-yellow" /> {p.location}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-muted-foreground">From</span>
                      <span className="text-lg font-bold text-foreground">{formatPrice(p.minPrice)}</span>
                      {p.maxPrice > p.minPrice && <span className="text-xs text-muted-foreground">– {formatPrice(p.maxPrice)}</span>}
                    </div>

                    {/* BHK badges */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.propertyType.slice(0, 4).map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground">
                          <BedDouble size={11} className="text-p13-yellow" /> {t}
                        </span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-[11px] text-muted-foreground">
                      {p.totalUnits ? <span className="flex items-center gap-1"><Building2 size={12} /> {p.totalUnits} units</span> : null}
                      {p.possession ? <span className="flex items-center gap-1"><CalendarClock size={12} /> {p.possession}</span> : null}
                    </div>

                    {/* CTA */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground group-hover:text-p13-yellow transition-colors">View Details</span>
                      <span className="w-8 h-8 rounded-full bg-p13-yellow/10 flex items-center justify-center group-hover:bg-p13-yellow transition-colors">
                        <ArrowRight size={15} className="text-p13-yellow group-hover:text-p13-black transition-colors" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* ===== Footer ===== */}
      <footer className="bg-card border-t border-border py-8 text-center">
        <img src="/logo-footer.png" alt="Property1313" className="h-7 w-auto mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">© 2026 Property1313. All rights reserved.</p>
      </footer>
    </div>
  );
}
