import React, { useState, useEffect } from 'react';
import {
  Plus, Search, FileText, Truck, CreditCard, Download, LayoutDashboard,
  History, CheckCircle2, Clock, AlertCircle, MapPin, Users, Calendar,
  BarChart3, Edit2, Trash2, X, Check, ChevronRight, LogOut, LogIn
} from 'lucide-react';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db, signInWithGoogle, signOutUser, getRedirectResult } from './firebase';
import { Consignment, Driver, Customer, FutureBooking, BANK_DETAILS, cn } from './types';
import { generateLR } from './pdfService';

// ─── Firestore collection names ────────────────────────────────────────────────
const COLS = {
  consignments:   'consignments',
  futureBookings: 'future_bookings',
  drivers:        'drivers',
  customers:      'customers',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCurrency = (n?: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d || ''; }
};

// ─── UI Components ─────────────────────────────────────────────────────────────
function Input({ label, type = 'text', required = false, value, onChange, placeholder, className = '' }: {
  label: string; type?: string; required?: boolean;
  value: string | number | undefined; onChange: (v: string) => void;
  placeholder?: string; className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <input
        type={type} required={required} placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
        value={value ?? ''} onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">{label}</label>
      <select
        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
        value={value} onChange={e => onChange(e.target.value)}
      >{options.map(o => <option key={o} value={o}>{o}</option>)}</select>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Paid: 'bg-emerald-100 text-emerald-700', Pending: 'bg-rose-100 text-rose-700',
    Partial: 'bg-amber-100 text-amber-700', Converted: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', styles[status] || 'bg-stone-100 text-stone-700')}>
      {status}
    </span>
  );
}

function StatCard({ label, value, icon, bg }: { label: string; value: string | number; icon: React.ReactNode; bg: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{label}</span>
        <div className={cn('p-2 rounded-lg', bg)}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-stone-800">{value}</div>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={cn(
      'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
      active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'text-emerald-100/60 hover:text-white hover:bg-emerald-800/50'
    )}>
      {icon}<span className="font-medium">{label}</span>
    </button>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed top-4 right-4 z-[100] bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in">
      <Check size={16} /><span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

function DeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="font-bold text-lg mb-2">Confirm Delete</h3>
        <p className="text-stone-500 text-sm mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 border border-stone-200 rounded-xl text-stone-600 font-medium">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-bold">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, loading, error }: { onLogin: () => void; loading: boolean; error: string | null }) {
  return (
    <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <img src="/icon.svg" alt="SDT" className="w-14 h-14" />
        </div>
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Sree Damodar</h1>
        <p className="text-emerald-600 font-bold mb-1">TRANSPORTS</p>
        <p className="text-stone-400 text-sm mb-8">Sign in with Google to access the transport management system.</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-sm">{error}</div>
        )}

        <button
          onClick={onLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-stone-200 rounded-xl font-semibold hover:bg-stone-50 hover:border-stone-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading ? 'Redirecting to Google...' : 'Sign in with Google'}
        </button>

        <p className="text-stone-400 text-xs mt-4">
          On mobile: you will be redirected to Google, then brought back here automatically.
        </p>
      </div>
      <p className="text-emerald-700 text-xs mt-6">v3.0 · Firebase Cloud · PWA</p>
    </div>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}

// ─── Mobile Bottom Nav ─────────────────────────────────────────────────────────
type ViewType = 'dashboard' | 'bookings' | 'add' | 'ledger' | 'future-bookings' | 'drivers' | 'customers' | 'reports';

function MobileNav({ view, onNav }: { view: ViewType; onNav: (v: ViewType) => void }) {
  const activeGroup = (['ledger', 'customers', 'reports'] as ViewType[]).includes(view) ? 'more' : view;
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around items-center px-2 z-50 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)', paddingTop: '8px' }}>
      {([
        { id: 'dashboard' as ViewType, label: 'Home', icon: <LayoutDashboard size={20} /> },
        { id: 'bookings' as ViewType, label: 'Bookings', icon: <FileText size={20} /> },
        { id: 'add' as ViewType, label: '', icon: <Plus size={26} />, primary: true },
        { id: 'drivers' as ViewType, label: 'Drivers', icon: <Truck size={20} /> },
        { id: 'future-bookings' as ViewType, label: 'Enquiries', icon: <Calendar size={20} /> },
      ]).map(item => (
        <button key={item.id} onClick={() => onNav(item.id)}
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all',
            item.primary
              ? 'bg-emerald-600 text-white p-3.5 rounded-full shadow-lg shadow-emerald-200 -mt-5'
              : activeGroup === item.id ? 'text-emerald-600' : 'text-stone-400'
          )}>
          {item.icon}
          {!item.primary && <span className="text-[10px] font-medium">{item.label}</span>}
        </button>
      ))}
    </nav>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  // ── Auth state ──────────────────────────────────────────────────────────────
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // ── App state ───────────────────────────────────────────────────────────────
  const [view, setView] = useState<ViewType>('dashboard');
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [futureBookings, setFutureBookings] = useState<FutureBooking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ col: string; id: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const defaultForm: Partial<Consignment> = {
    date: new Date().toISOString().split('T')[0],
    payment_status: 'Pending', driver_payment_status: 'Pending',
    freight_amount: 0, advance_paid: 0, balance_amount: 0,
    commission: 0, handling_charges: 0, halting_charges: 0, gc_charges: 0,
  };
  const [formData, setFormData] = useState<Partial<Consignment>>(defaultForm);
  const [futureForm, setFutureForm] = useState<Partial<FutureBooking>>({
    expected_date: new Date().toISOString().split('T')[0], status: 'Pending', estimated_freight: 0
  });
  const [driverForm, setDriverForm] = useState<Partial<Driver>>({});
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({});

  // ── Auth listener ───────────────────────────────────────────────────────────
  useEffect(() => {
    // Handle redirect result from mobile sign-in FIRST
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          setLoginError(null);
        }
      })
      .catch((error) => {
        console.error('Redirect error:', error);
        // Display the actual error to the user
        setLoginError(error.message || 'Sign-in failed. Please try again.');
        setAuthLoading(false);
      });

    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (firebaseUser) {
        setLoginLoading(false);
        setLoginError(null);
      }
    });
  }, []);

  // ── Firestore real-time listeners (all 4 collections) ───────────────────────
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const unsubs = [
      onSnapshot(
        query(collection(db, COLS.consignments), orderBy('createdAt', 'desc')),
        snap => {
          setConsignments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Consignment)));
          setLoading(false);
        },
        () => setLoading(false)
      ),
      onSnapshot(collection(db, COLS.futureBookings), snap => {
        setFutureBookings(
          snap.docs
            .map(d => ({ id: d.id, ...d.data() } as FutureBooking))
            .sort((a, b) => (a.expected_date > b.expected_date ? 1 : -1))
        );
      }),
      onSnapshot(collection(db, COLS.drivers), snap => {
        setDrivers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Driver)));
      }),
      onSnapshot(collection(db, COLS.customers), snap => {
        setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer)));
      }),
    ];

    return () => unsubs.forEach(u => u());
  }, [user]);

  // ── Computed ────────────────────────────────────────────────────────────────
  const calcTotal = (fd: Partial<Consignment>) =>
    (Number(fd.freight_amount) || 0) + (Number(fd.handling_charges) || 0) +
    (Number(fd.halting_charges) || 0) + (Number(fd.gc_charges) || 0);

  const filteredConsignments = consignments.filter(c =>
    !searchTerm ||
    (c.consignment_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.vehicle_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: consignments.length,
    pending: consignments.filter(c => c.payment_status === 'Pending').length,
    totalFreight: consignments.reduce((a, c) => a + Number(c.freight_amount || 0), 0),
    totalBalance: consignments.reduce((a, c) => a + Number(c.balance_amount || 0), 0),
  };

  // ── Auth handlers ───────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setLoginError(err.message || 'Sign in failed. Please try again.');
      setLoginLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setConsignments([]); setFutureBookings([]); setDrivers([]); setCustomers([]);
  };

  // ── Data handlers ────────────────────────────────────────────────────────────
  const resetForm = () => { setFormData(defaultForm); setEditingId(null); };
  const navTo = (v: ViewType) => { if (v === 'add') resetForm(); setView(v); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const balance = calcTotal(formData) - (Number(formData.advance_paid) || 0);
    const data = { ...formData, balance_amount: balance };

    try {
      if (editingId) {
        const { id, ...updateData } = data as Consignment;
        await updateDoc(doc(db, COLS.consignments, editingId), updateData);
        setToast('Consignment updated! ✓');
      } else {
        const docData = { ...data, createdAt: Date.now() };
        const docRef = await addDoc(collection(db, COLS.consignments), docData);
        // Generate LR PDF
        try { generateLR({ ...docData, id: docRef.id } as Consignment); } catch (err) { console.error('PDF error:', err); }
        setToast('LR saved & PDF downloaded! ✓');
      }
      setView('bookings');
      resetForm();
    } catch (err) {
      console.error('Save error:', err);
      setToast('Error saving. Check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, deleteTarget.col, deleteTarget.id));
      setToast('Deleted successfully');
    } catch (err) {
      setToast('Error deleting. Try again.');
    }
    setDeleteTarget(null);
  };

  const handleEdit = (c: Consignment) => {
    setFormData({ ...c }); setEditingId(c.id); setView('add');
  };

  const handleFutureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, COLS.futureBookings), { ...futureForm, status: 'Pending', createdAt: Date.now() });
      setFutureForm({ expected_date: new Date().toISOString().split('T')[0], status: 'Pending', estimated_freight: 0 });
      setToast('Enquiry added!');
    } catch { setToast('Error saving enquiry.'); }
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, COLS.drivers), { ...driverForm, createdAt: Date.now() });
      setDriverForm({});
      setToast('Driver saved!');
    } catch { setToast('Error saving driver.'); }
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, COLS.customers), { ...customerForm, createdAt: Date.now() });
      setCustomerForm({});
      setToast('Customer saved!');
    } catch { setToast('Error saving customer.'); }
  };

  const convertToBooking = (fb: FutureBooking) => {
    setFormData({
      ...defaultForm, customer_name: fb.customer_name, customer_phone: fb.phone,
      from_location: fb.from_location, to_location: fb.to_location,
      goods_description: fb.goods_description, freight_amount: fb.estimated_freight, date: fb.expected_date,
    });
    setView('add');
  };

  const exportCSV = () => {
    const headers = ['LR No','Date','From','To','Customer','Consignee','Goods','Freight','Advance','Balance','Status'];
    const rows = filteredConsignments.map(c => [c.consignment_no,c.date,c.from_location,c.to_location,c.customer_name,c.consignee_name,c.goods_description,c.freight_amount,c.advance_paid,c.balance_amount,c.payment_status]);
    const csv = [headers,...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `Bookings_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  // ── Render guards ────────────────────────────────────────────────────────────
  if (authLoading) return <LoadingScreen />;
  if (!user) return <LoginScreen onLogin={handleLogin} loading={loginLoading} error={loginError} />;

  const viewTitle: Record<ViewType, string> = {
    dashboard: 'Dashboard', bookings: 'All Bookings', add: editingId ? 'Edit LR' : 'New LR',
    'future-bookings': 'Enquiries', ledger: 'Driver Ledger',
    drivers: 'Drivers', customers: 'Customers', reports: 'Reports'
  };

  const sideNavItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'bookings' as ViewType, label: 'Bookings', icon: <FileText size={20} /> },
    { id: 'future-bookings' as ViewType, label: 'Enquiries', icon: <Calendar size={20} /> },
    { id: 'add' as ViewType, label: 'New LR', icon: <Plus size={20} /> },
    { id: 'ledger' as ViewType, label: 'Driver Ledger', icon: <History size={20} /> },
    { id: 'drivers' as ViewType, label: 'Drivers', icon: <Truck size={20} /> },
    { id: 'customers' as ViewType, label: 'Customers', icon: <Users size={20} /> },
    { id: 'reports' as ViewType, label: 'Reports', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {deleteTarget && <DeleteModal onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}

      {/* ── Desktop Sidebar ─────────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-emerald-900 text-white p-6 hidden lg:flex flex-col z-40 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8 shrink-0">
          <img src="/icon.svg" alt="SDT" className="w-10 h-10 rounded-lg" />
          <h1 className="font-bold text-lg leading-tight">SREE DAMODAR<br /><span className="text-emerald-400">TRANSPORTS</span></h1>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {sideNavItems.map(item => (
            <NavItem key={item.id} active={view === item.id} icon={item.icon} label={item.label} onClick={() => navTo(item.id)} />
          ))}
        </nav>
        <div className="mt-auto pt-5 border-t border-emerald-800 shrink-0 space-y-3">
          {/* Logged-in user */}
          <div className="flex items-center gap-3 px-2">
            {user.photoURL
              ? <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
              : <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">{user.displayName?.[0] || '?'}</div>
            }
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-emerald-400 truncate">{user.email}</p>
            </div>
          </div>
          {/* Bank details */}
          <div className="p-3 bg-emerald-800/50 rounded-xl border border-emerald-700/50 text-sm">
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">Bank</p>
            <p className="font-medium text-xs">{BANK_DETAILS.bankName} · {BANK_DETAILS.branch}</p>
            <p className="text-xs opacity-60">{BANK_DETAILS.accountNumber}</p>
          </div>
          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-rose-300 hover:bg-rose-900/30 transition-colors text-sm font-medium">
            <LogOut size={16} />Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ────────────────────────────────────────────────── */}
      <MobileNav view={view} onNav={navTo} />

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="lg:ml-64 min-h-screen pb-28 lg:pb-8">
        {/* Mobile header */}
        <header className="sticky top-0 bg-white/95 backdrop-blur border-b border-stone-100 px-4 py-3 flex items-center justify-between gap-3 lg:hidden z-30">
          <div>
            <h2 className="font-bold text-stone-800">{viewTitle[view]}</h2>
            <p className="text-stone-400 text-xs">{user.displayName || 'Staff'}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-stone-200 rounded-lg text-xs w-36 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <button onClick={handleSignOut} className="p-1.5 text-stone-400 hover:text-rose-500"><LogOut size={18} /></button>
          </div>
        </header>
        {/* Desktop header */}
        <header className="hidden lg:flex items-center justify-between px-8 pt-8 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-800">{viewTitle[view]}</h2>
            <p className="text-stone-500 text-sm mt-0.5 flex items-center gap-2">
              Manage your transport operations
              <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"/>Live sync
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="text" placeholder="Search LR No, Customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-stone-200 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <button onClick={() => navTo('add')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors">
              <Plus size={16} />New LR
            </button>
          </div>
        </header>

        <div className="px-4 lg:px-8 space-y-5">

          {/* ── LOADING ──────────────────────────────────────────────────────── */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          )}

          {/* ── DASHBOARD ────────────────────────────────────────────────────── */}
          {!loading && view === 'dashboard' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Total Bookings" value={stats.total} bg="bg-blue-50 text-blue-600" icon={<FileText size={18} />} />
                <StatCard label="Pending" value={stats.pending} bg="bg-amber-50 text-amber-600" icon={<Clock size={18} />} />
                <StatCard label="Total Freight" value={fmtCurrency(stats.totalFreight)} bg="bg-emerald-50 text-emerald-600" icon={<CreditCard size={18} />} />
                <StatCard label="Balance Due" value={fmtCurrency(stats.totalBalance)} bg="bg-rose-50 text-rose-600" icon={<AlertCircle size={18} />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-5">Quick Actions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'New LR', icon: <Plus size={20} />, color: 'bg-emerald-600', v: 'add' },
                      { label: 'Bookings', icon: <FileText size={20} />, color: 'bg-blue-600', v: 'bookings' },
                      { label: 'Enquiries', icon: <Calendar size={20} />, color: 'bg-purple-600', v: 'future-bookings' },
                      { label: 'Customers', icon: <Users size={20} />, color: 'bg-orange-500', v: 'customers' },
                      { label: 'Drivers', icon: <Truck size={20} />, color: 'bg-amber-600', v: 'drivers' },
                      { label: 'Reports', icon: <BarChart3 size={20} />, color: 'bg-stone-600', v: 'reports' },
                    ].map(qa => (
                      <button key={qa.label} onClick={() => navTo(qa.v as ViewType)}
                        className={cn('flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-white font-medium text-sm active:scale-95 hover:opacity-90 transition-all', qa.color)}>
                        {qa.icon}{qa.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Recent Enquiries</h3>
                  {futureBookings.length === 0 ? (
                    <p className="text-sm text-stone-400">No pending enquiries</p>
                  ) : (
                    <div className="space-y-3">
                      {futureBookings.slice(0, 5).map(fb => (
                        <div key={fb.id} className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{fb.customer_name}</p>
                            <p className="text-xs text-stone-400">{fb.from_location} → {fb.to_location}</p>
                          </div>
                          <button onClick={() => convertToBooking(fb)} className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg shrink-0 hover:bg-emerald-100 flex items-center gap-1">
                            Convert<ChevronRight size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 p-4 bg-stone-50 rounded-xl text-sm">
                    <p className="text-xs font-bold text-stone-400 uppercase mb-2">Bank Details</p>
                    <p className="font-medium">{BANK_DETAILS.bankName}</p>
                    <p className="text-xs text-stone-400">{BANK_DETAILS.accountNumber}</p>
                    <p className="text-xs text-stone-400">IFSC: {BANK_DETAILS.ifsc}</p>
                  </div>
                </div>
              </div>

              {consignments.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                    <h3 className="font-bold">Recent Bookings</h3>
                    <button onClick={() => setView('bookings')} className="text-sm text-emerald-600 font-medium">View all →</button>
                  </div>
                  <div className="divide-y divide-stone-50">
                    {consignments.slice(0, 5).map(c => (
                      <div key={c.id} className="px-5 py-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-mono font-bold text-emerald-700 text-sm">{c.consignment_no}</p>
                          <p className="text-xs text-stone-400">{c.from_location} → {c.to_location} · {fmtDate(c.date)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-sm">{fmtCurrency(c.freight_amount)}</p>
                          <StatusBadge status={c.payment_status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── ADD / EDIT ───────────────────────────────────────────────────── */}
          {!loading && view === 'add' && (
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="bg-emerald-900 p-6 text-white">
                  <h3 className="text-xl font-bold">{editingId ? 'Edit Consignment' : 'New Consignment Entry'}</h3>
                  <p className="text-emerald-400 text-sm mt-1">Fill in the details to generate a Lorry Receipt.</p>
                </div>
                <div className="p-5 lg:p-8 space-y-8">
                  <section>
                    <p className="text-xs font-bold text-stone-400 uppercase mb-4">Basic Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Input label="Consignment No" required value={formData.consignment_no} onChange={v => setFormData({ ...formData, consignment_no: v })} />
                      <Input label="Date" type="date" required value={formData.date} onChange={v => setFormData({ ...formData, date: v })} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input label="From" required value={formData.from_location} onChange={v => setFormData({ ...formData, from_location: v })} />
                        <Input label="To" required value={formData.to_location} onChange={v => setFormData({ ...formData, to_location: v })} />
                      </div>
                    </div>
                  </section>
                  <section>
                    <p className="text-xs font-bold text-stone-400 uppercase mb-4">Additional Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input label="Value of Goods Rs." value={formData.value_of_goods} onChange={v => setFormData({ ...formData, value_of_goods: v })} />
                      <Input label="Invoice No. & Date" value={formData.invoice_no_date} onChange={v => setFormData({ ...formData, invoice_no_date: v })} />
                      <Input label="Delivery At" value={formData.delivery_at} onChange={v => setFormData({ ...formData, delivery_at: v })} />
                    </div>
                  </section>
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold text-stone-400 uppercase mb-4">Consignor (Customer)</p>
                      <div className="space-y-4">
                        <Input label="Name" required value={formData.customer_name} onChange={v => setFormData({ ...formData, customer_name: v })} />
                        <Input label="Phone" value={formData.customer_phone} onChange={v => setFormData({ ...formData, customer_phone: v })} />
                        <Input label="GST No." value={formData.customer_gst} onChange={v => setFormData({ ...formData, customer_gst: v })} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-400 uppercase mb-4">Consignee</p>
                      <div className="space-y-4">
                        <Input label="Name" required value={formData.consignee_name} onChange={v => setFormData({ ...formData, consignee_name: v })} />
                        <Input label="Phone" value={formData.consignee_phone} onChange={v => setFormData({ ...formData, consignee_phone: v })} />
                        <Input label="GST No." value={formData.consignee_gst} onChange={v => setFormData({ ...formData, consignee_gst: v })} />
                      </div>
                    </div>
                  </section>
                  <section>
                    <p className="text-xs font-bold text-stone-400 uppercase mb-4">Goods & Vehicle Details</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <Input label="Articles Count" value={formData.articles_count} onChange={v => setFormData({ ...formData, articles_count: v })} />
                      <Input label="Nature of Goods" required value={formData.goods_description} onChange={v => setFormData({ ...formData, goods_description: v })} className="col-span-2" />
                      <Input label="Actual Weight" value={formData.weight} onChange={v => setFormData({ ...formData, weight: v })} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      <Input label="Charged Weight" value={formData.charged_weight} onChange={v => setFormData({ ...formData, charged_weight: v })} />
                      <Input label="Vehicle Number" required value={formData.vehicle_number} onChange={v => setFormData({ ...formData, vehicle_number: v })} />
                      <Input label="Vehicle Type" placeholder="e.g. 10 Wheel" value={formData.vehicle_type} onChange={v => setFormData({ ...formData, vehicle_type: v })} />
                      <Input label="Driver Name" value={formData.driver_name} onChange={v => setFormData({ ...formData, driver_name: v })} />
                    </div>
                  </section>
                  <section>
                    <p className="text-xs font-bold text-stone-400 uppercase mb-4">Freight & Charges</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <Input label="Freight Rate" type="number" required value={formData.freight_amount} onChange={v => setFormData({ ...formData, freight_amount: Number(v) })} />
                      <Input label="Handling" type="number" value={formData.handling_charges} onChange={v => setFormData({ ...formData, handling_charges: Number(v) })} />
                      <Input label="Halting" type="number" value={formData.halting_charges} onChange={v => setFormData({ ...formData, halting_charges: Number(v) })} />
                      <Input label="G.C. Charge" type="number" value={formData.gc_charges} onChange={v => setFormData({ ...formData, gc_charges: Number(v) })} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      <Input label="Advance Paid" type="number" value={formData.advance_paid} onChange={v => setFormData({ ...formData, advance_paid: Number(v) })} />
                      <SelectField label="Payment Status" value={formData.payment_status || 'Pending'} onChange={v => setFormData({ ...formData, payment_status: v as Consignment['payment_status'] })} options={['Pending', 'Partial', 'Paid']} />
                      <Input label="Payment Ref" value={formData.payment_ref} onChange={v => setFormData({ ...formData, payment_ref: v })} />
                      <Input label="Driver Commission" type="number" value={formData.commission} onChange={v => setFormData({ ...formData, commission: Number(v) })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="p-4 bg-emerald-50 rounded-xl">
                        <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Total Freight</p>
                        <p className="text-2xl font-bold text-emerald-700">{fmtCurrency(calcTotal(formData))}</p>
                      </div>
                      <div className="p-4 bg-rose-50 rounded-xl">
                        <p className="text-xs text-rose-600 font-bold uppercase mb-1">Balance Due</p>
                        <p className="text-2xl font-bold text-rose-700">{fmtCurrency(calcTotal(formData) - (Number(formData.advance_paid) || 0))}</p>
                      </div>
                    </div>
                  </section>
                </div>
                <div className="p-5 bg-stone-50 border-t border-stone-100 flex gap-3 justify-end">
                  <button type="button" onClick={() => setView('bookings')} className="px-5 py-2 text-stone-600 font-medium hover:bg-stone-100 rounded-xl">Cancel</button>
                  <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60">
                    {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={16} />}
                    {saving ? 'Saving...' : editingId ? 'Update Consignment' : 'Save & Generate LR'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── BOOKINGS ─────────────────────────────────────────────────────── */}
          {!loading && view === 'bookings' && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <h3 className="font-bold">All Consignments ({filteredConsignments.length})</h3>
                <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 text-sm font-medium">
                  <Download size={14} />Export CSV
                </button>
              </div>
              {filteredConsignments.length === 0 ? (
                <div className="p-16 text-center text-stone-400">
                  <FileText size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No bookings yet</p>
                  <button onClick={() => navTo('add')} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium">Create First LR</button>
                </div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="divide-y divide-stone-50 lg:hidden">
                    {filteredConsignments.map(c => (
                      <div key={c.id} className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div><p className="font-mono font-bold text-emerald-700">{c.consignment_no}</p><p className="text-xs text-stone-400">{fmtDate(c.date)}</p></div>
                          <div className="text-right"><p className="font-bold">{fmtCurrency(c.freight_amount)}</p><StatusBadge status={c.payment_status} /></div>
                        </div>
                        <p className="text-sm font-medium">{c.customer_name} → {c.consignee_name}</p>
                        <p className="text-xs text-stone-400">{c.from_location} → {c.to_location} · {c.vehicle_number}</p>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => handleEdit(c)} className="flex-1 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Edit2 size={12} />Edit</button>
                          <button onClick={() => generateLR(c)} className="flex-1 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Download size={12} />LR PDF</button>
                          <button onClick={() => setDeleteTarget({ col: COLS.consignments, id: c.id })} className="py-1.5 px-3 bg-rose-50 text-rose-600 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead><tr className="text-stone-400 text-xs uppercase tracking-wider border-b border-stone-100 bg-stone-50">
                        {['LR No / Date','Route','Parties','Vehicle','Payment','Actions'].map(h => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}
                      </tr></thead>
                      <tbody className="divide-y divide-stone-50">
                        {filteredConsignments.map(c => (
                          <tr key={c.id} className="text-sm hover:bg-stone-50">
                            <td className="px-5 py-4"><p className="font-mono font-bold text-emerald-700">{c.consignment_no}</p><p className="text-xs text-stone-400">{fmtDate(c.date)}</p></td>
                            <td className="px-5 py-4">{c.from_location} → {c.to_location}</td>
                            <td className="px-5 py-4"><p className="font-medium">{c.customer_name}</p><p className="text-xs text-stone-400">To: {c.consignee_name}</p></td>
                            <td className="px-5 py-4"><p className="font-medium">{c.vehicle_number}</p><p className="text-xs text-stone-400">{c.vehicle_type}</p></td>
                            <td className="px-5 py-4"><p className="font-bold">{fmtCurrency(c.freight_amount)}</p><StatusBadge status={c.payment_status} /></td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleEdit(c)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Edit"><Edit2 size={15} /></button>
                                <button onClick={() => generateLR(c)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Download LR PDF"><Download size={15} /></button>
                                <button onClick={() => setDeleteTarget({ col: COLS.consignments, id: c.id })} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100" title="Delete"><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── ENQUIRIES ────────────────────────────────────────────────────── */}
          {!loading && view === 'future-bookings' && (
            <>
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                <h3 className="font-bold text-lg mb-5">New Enquiry</h3>
                <form onSubmit={handleFutureSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input label="Expected Date" type="date" value={futureForm.expected_date} onChange={v => setFutureForm({ ...futureForm, expected_date: v })} />
                  <Input label="Customer Name" value={futureForm.customer_name} onChange={v => setFutureForm({ ...futureForm, customer_name: v })} />
                  <Input label="Phone" value={futureForm.phone} onChange={v => setFutureForm({ ...futureForm, phone: v })} />
                  <Input label="From" value={futureForm.from_location} onChange={v => setFutureForm({ ...futureForm, from_location: v })} />
                  <Input label="To" value={futureForm.to_location} onChange={v => setFutureForm({ ...futureForm, to_location: v })} />
                  <Input label="Est. Freight" type="number" value={futureForm.estimated_freight} onChange={v => setFutureForm({ ...futureForm, estimated_freight: Number(v) })} />
                  <Input label="Goods Description" value={futureForm.goods_description} onChange={v => setFutureForm({ ...futureForm, goods_description: v })} className="sm:col-span-2" />
                  <div className="flex items-end"><button type="submit" className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700">Add Enquiry</button></div>
                </form>
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-stone-100"><h3 className="font-bold">Active Enquiries ({futureBookings.length})</h3></div>
                {futureBookings.length === 0 ? (
                  <div className="p-12 text-center text-stone-400"><Calendar size={36} className="mx-auto mb-3 opacity-30" /><p className="font-medium">No enquiries yet</p></div>
                ) : (
                  <div className="divide-y divide-stone-50">
                    {futureBookings.map(fb => (
                      <div key={fb.id} className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold truncate">{fb.customer_name} <span className="font-normal text-stone-400 text-sm">· {fb.phone}</span></p>
                          <p className="text-sm text-stone-500">{fb.from_location} → {fb.to_location}</p>
                          <p className="text-xs text-stone-400">{fb.goods_description} · {fmtDate(fb.expected_date)}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => convertToBooking(fb)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100">Convert</button>
                          <button onClick={() => setDeleteTarget({ col: COLS.futureBookings, id: fb.id })} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── DRIVERS ──────────────────────────────────────────────────────── */}
          {!loading && view === 'drivers' && (
            <>
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                <h3 className="font-bold text-lg mb-5">Register New Driver</h3>
                <form onSubmit={handleDriverSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input label="Driver Name" value={driverForm.name} onChange={v => setDriverForm({ ...driverForm, name: v })} />
                  <Input label="Phone" value={driverForm.phone} onChange={v => setDriverForm({ ...driverForm, phone: v })} />
                  <Input label="Vehicle Number" value={driverForm.vehicle_number} onChange={v => setDriverForm({ ...driverForm, vehicle_number: v })} />
                  <Input label="DL Number" value={driverForm.dl_number} onChange={v => setDriverForm({ ...driverForm, dl_number: v })} />
                  <Input label="RC Number" value={driverForm.rc_number} onChange={v => setDriverForm({ ...driverForm, rc_number: v })} />
                  <Input label="Vehicle Type" value={driverForm.vehicle_type} onChange={v => setDriverForm({ ...driverForm, vehicle_type: v })} />
                  <Input label="Address" value={driverForm.address} onChange={v => setDriverForm({ ...driverForm, address: v })} className="sm:col-span-2" />
                  <div className="flex items-end"><button type="submit" className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700">Save Driver</button></div>
                </form>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {drivers.length === 0
                  ? <div className="col-span-3 p-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200"><Truck size={36} className="mx-auto mb-3 opacity-30" /><p className="font-medium">No drivers registered yet</p></div>
                  : drivers.map(d => (
                    <div key={d.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center"><Truck size={18} className="text-stone-500" /></div>
                          <div><h4 className="font-bold">{d.name}</h4><p className="text-xs text-stone-400">{d.phone}</p></div>
                        </div>
                        <button onClick={() => setDeleteTarget({ col: COLS.drivers, id: d.id })} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                      {[['Vehicle', d.vehicle_number],['Type', d.vehicle_type],['DL', d.dl_number],['RC', d.rc_number]].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm mb-1.5"><span className="text-stone-400">{k}:</span><span className="font-medium">{v || '—'}</span></div>
                      ))}
                    </div>
                  ))
                }
              </div>
            </>
          )}

          {/* ── CUSTOMERS ────────────────────────────────────────────────────── */}
          {!loading && view === 'customers' && (
            <>
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                <h3 className="font-bold text-lg mb-5">Add New Customer</h3>
                <form onSubmit={handleCustomerSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input label="Customer Name" value={customerForm.name} onChange={v => setCustomerForm({ ...customerForm, name: v })} />
                  <Input label="Phone" value={customerForm.phone} onChange={v => setCustomerForm({ ...customerForm, phone: v })} />
                  <Input label="GST No." value={customerForm.gst_no} onChange={v => setCustomerForm({ ...customerForm, gst_no: v })} />
                  <Input label="Address" value={customerForm.address} onChange={v => setCustomerForm({ ...customerForm, address: v })} className="sm:col-span-2" />
                  <Input label="Google Maps Link" value={customerForm.location_link} onChange={v => setCustomerForm({ ...customerForm, location_link: v })} />
                  <div className="sm:col-span-2 lg:col-span-1 flex items-end"><button type="submit" className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700">Save Customer</button></div>
                </form>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.length === 0
                  ? <div className="col-span-3 p-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200"><Users size={36} className="mx-auto mb-3 opacity-30" /><p className="font-medium">No customers yet</p></div>
                  : customers.map(c => (
                    <div key={c.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center"><Users size={18} className="text-emerald-600" /></div>
                          <div><h4 className="font-bold">{c.name}</h4><p className="text-xs text-stone-400">{c.phone}</p></div>
                        </div>
                        <div className="flex gap-1">
                          {c.location_link && <a href={c.location_link} target="_blank" rel="noreferrer" className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg"><MapPin size={14} /></a>}
                          <button onClick={() => setDeleteTarget({ col: COLS.customers, id: c.id })} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <p className="text-sm text-stone-600">{c.address}</p>
                      <p className="text-xs font-mono text-stone-400 mt-2">GST: {c.gst_no || 'N/A'}</p>
                    </div>
                  ))
                }
              </div>
            </>
          )}

          {/* ── LEDGER ───────────────────────────────────────────────────────── */}
          {!loading && view === 'ledger' && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-stone-100"><h3 className="font-bold">Driver Payment Ledger</h3></div>
              {consignments.length === 0
                ? <div className="p-12 text-center text-stone-400"><History size={36} className="mx-auto mb-3 opacity-30" /><p className="font-medium">No records yet</p></div>
                : <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="text-stone-400 text-xs uppercase tracking-wider border-b border-stone-100 bg-stone-50">
                      {['Driver / Vehicle','LR No','Route','Commission','Status'].map(h => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-stone-50">
                      {consignments.map(c => (
                        <tr key={c.id} className="text-sm hover:bg-stone-50">
                          <td className="px-5 py-4"><p className="font-bold">{c.driver_name || 'N/A'}</p><p className="text-xs text-stone-400">{c.vehicle_number}</p></td>
                          <td className="px-5 py-4 font-mono text-emerald-700">{c.consignment_no}</td>
                          <td className="px-5 py-4">{c.from_location} → {c.to_location}</td>
                          <td className="px-5 py-4 font-medium">{fmtCurrency(c.commission)}</td>
                          <td className="px-5 py-4"><StatusBadge status={c.driver_payment_status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            </div>
          )}

          {/* ── REPORTS ──────────────────────────────────────────────────────── */}
          {!loading && view === 'reports' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                  <h3 className="font-bold text-lg mb-5">Revenue Summary</h3>
                  <p className="text-4xl font-bold text-stone-800 mb-5">{fmtCurrency(stats.totalFreight)}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Collected</p>
                      <p className="text-xl font-bold text-emerald-700">{fmtCurrency(consignments.reduce((a,c)=>a+Number(c.advance_paid||0),0))}</p>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-xl">
                      <p className="text-xs text-rose-600 font-bold uppercase mb-1">Outstanding</p>
                      <p className="text-xl font-bold text-rose-700">{fmtCurrency(stats.totalBalance)}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <p className="text-xs text-amber-600 font-bold uppercase mb-1">Driver Commissions</p>
                    <p className="text-xl font-bold text-amber-700">{fmtCurrency(consignments.reduce((a,c)=>a+Number(c.commission||0),0))}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                  <h3 className="font-bold text-lg mb-5">Summary</h3>
                  <div className="space-y-3 mb-6">
                    {[
                      {l:'Total Bookings', v:consignments.length, c:'bg-blue-500'},
                      {l:'Paid', v:consignments.filter(c=>c.payment_status==='Paid').length, c:'bg-emerald-500'},
                      {l:'Pending', v:consignments.filter(c=>c.payment_status==='Pending').length, c:'bg-rose-500'},
                      {l:'Partial', v:consignments.filter(c=>c.payment_status==='Partial').length, c:'bg-amber-500'},
                      {l:'Customers', v:customers.length, c:'bg-purple-500'},
                      {l:'Drivers', v:drivers.length, c:'bg-orange-500'},
                    ].map(item=>(
                      <div key={item.l} className="flex items-center gap-3">
                        <div className={cn('w-2 h-2 rounded-full', item.c)} />
                        <span className="text-sm text-stone-600 flex-1">{item.l}</span>
                        <span className="font-bold text-stone-800">{item.v}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={exportCSV} className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 text-sm">
                    <Download size={15} />Export All to CSV
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="font-bold text-lg mb-5">Top Customers by Freight</h3>
                {(() => {
                  const map: Record<string,number> = {};
                  consignments.forEach(c => { map[c.customer_name] = (map[c.customer_name]||0) + Number(c.freight_amount||0); });
                  const top = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5);
                  const max = top[0]?.[1] || 1;
                  return top.length === 0
                    ? <p className="text-stone-400 text-sm">No data yet</p>
                    : <div className="space-y-3">{top.map(([name,val])=>(
                      <div key={name} className="flex items-center gap-4">
                        <span className="text-sm font-medium text-stone-600 w-36 truncate">{name}</span>
                        <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{width:`${(val/max)*100}%`}}/>
                        </div>
                        <span className="text-sm font-bold text-stone-700 w-28 text-right">{fmtCurrency(val)}</span>
                      </div>
                    ))}</div>;
                })()}
              </div>
            </>
          )}

        </div>
      </main>

      <style>{`
        @keyframes slide-in { from { transform: translateY(-16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.25s ease-out; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.8s linear infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
