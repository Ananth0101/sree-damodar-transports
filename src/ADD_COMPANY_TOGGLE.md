# 🔧 How to Add Company Toggle to Your App

## Quick Fix - Add These Changes to App.tsx

### 1. Add import for CompanyType at top (line 13):
```typescript
import { Consignment, Driver, Customer, FutureBooking, BANK_DETAILS, COMPANY_INFO, CompanyType, cn } from './types';
```

### 2. Add company state after line 221 (inside App function):
```typescript
const [activeCompany, setActiveCompany] = useState<CompanyType>('transports');
```

### 3. Update the defaultForm (around line 233) to include company:
```typescript
const defaultForm: Partial<Consignment> = {
  company: activeCompany,  // ADD THIS LINE
  date: new Date().toISOString().split('T')[0],
  payment_status: 'Pending', driver_payment_status: 'Pending',
  freight_amount: 0, advance_paid: 0, balance_amount: 0,
  commission: 0, handling_charges: 0, halting_charges: 0, gc_charges: 0,
};
```

### 4. Filter consignments by company (around line 309):
```typescript
const filteredConsignments = consignments.filter(c =>
  c.company === activeCompany &&  // ADD THIS LINE
  (!searchTerm ||
  (c.consignment_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (c.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (c.vehicle_number || '').toLowerCase().includes(searchTerm.toLowerCase()))
);
```

### 5. Filter future bookings by company (around line 315):
```typescript
const filteredFutureBookings = futureBookings.filter(fb =>
  fb.company === activeCompany &&  // ADD THIS LINE
  (!searchTerm || fb.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
);
```

### 6. Update stats to filter by company (around line 316):
```typescript
const stats = {
  total: consignments.filter(c => c.company === activeCompany).length,  // UPDATE THIS
  pending: consignments.filter(c => c.company === activeCompany && c.payment_status === 'Pending').length,  // UPDATE THIS
  totalFreight: consignments.filter(c => c.company === activeCompany).reduce((a, c) => a + Number(c.freight_amount || 0), 0),  // UPDATE THIS
  totalBalance: consignments.filter(c => c.company === activeCompany).reduce((a, c) => a + Number(c.balance_amount || 0), 0),  // UPDATE THIS
};
```

### 7. Add Company Toggle Component AFTER the Toast component (around line 110):
```typescript
// Company Toggle Component
function CompanyToggle({ active, onChange }: { active: CompanyType; onChange: (c: CompanyType) => void }) {
  const info = COMPANY_INFO[active];
  const otherCompany = active === 'transports' ? 'traders' : 'transports';
  const otherInfo = COMPANY_INFO[otherCompany];
  
  return (
    <div className="relative inline-block">
      <button
        onClick={() => onChange(otherCompany)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all"
        style={{
          borderColor: info.color,
          backgroundColor: `${info.color}15`,
        }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: info.color }}
        />
        <span className="font-bold text-sm" style={{ color: info.color }}>
          {info.name}
        </span>
        <ChevronRight size={16} style={{ color: info.color }} />
      </button>
      <div className="absolute top-full left-0 mt-1 text-xs text-stone-500">
        Click to switch to {otherInfo.name}
      </div>
    </div>
  );
}
```

### 8. Update Desktop Sidebar header (line 472-474):
```typescript
<div className="flex items-center gap-3 mb-8 shrink-0">
  <img src="/icon.svg" alt="SDT" className="w-10 h-10 rounded-lg" />
  <div>
    <h1 className="font-bold text-lg leading-tight">
      {COMPANY_INFO[activeCompany].shortName}
    </h1>
    <p className="text-xs text-emerald-400">{activeCompany.toUpperCase()}</p>
  </div>
</div>
```

### 9. Add Company Toggle to Desktop Header (after line 526, inside desktop header):
```typescript
<header className="hidden lg:flex items-center justify-between px-8 pt-8 pb-4">
  <div className="flex items-center gap-6">
    <div>
      <h2 className="text-2xl font-bold text-stone-800">{viewTitle[view]}</h2>
      <p className="text-stone-500 text-sm mt-0.5 flex items-center gap-2">
        Manage your transport operations
      </p>
    </div>
    <CompanyToggle active={activeCompany} onChange={setActiveCompany} />  {/* ADD THIS */}
  </div>
```

### 10. Add Company Toggle to Mobile Header (after line 511, inside mobile header):
```typescript
<header className="sticky top-0 bg-white/95 backdrop-blur border-b border-stone-100 px-4 py-3 flex items-center justify-between gap-3 lg:hidden z-30">
  <div className="flex-1 min-w-0">
    <h2 className="font-bold text-stone-800">{viewTitle[view]}</h2>
    <CompanyToggle active={activeCompany} onChange={setActiveCompany} />  {/* ADD THIS */}
  </div>
  <div className="flex items-center gap-2">
    ...
```

### 11. Update Form to Include Company Field:
Find the form submission (around line 345) and ensure company is saved:
```typescript
const data = { 
  ...formData, 
  company: activeCompany,  // ADD THIS
  balance_amount: balance 
};
```

### 12. Update Theme Colors Based on Company:
Replace the static emerald colors in the sidebar (line 471) with dynamic colors:
```typescript
<aside 
  className="fixed left-0 top-0 h-full w-64 text-white p-6 hidden lg:flex flex-col z-40 overflow-y-auto"
  style={{ backgroundColor: COMPANY_INFO[activeCompany].color }}
>
```

---

## ⚡ Or Use This Complete Component

If manual edits are difficult, here's the complete CompanyToggle component and where to place it:

**Place this RIGHT AFTER the Toast component (around line 110):**

```typescript
// ─── Company Toggle ────────────────────────────────────────────────────────
function CompanyToggle({ active, onChange }: { active: CompanyType; onChange: (c: CompanyType) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const info = COMPANY_INFO[active];
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all hover:shadow-md"
        style={{
          borderColor: info.color,
          backgroundColor: `${info.color}10`,
        }}
      >
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: info.color }} />
        <span className="font-bold text-xs" style={{ color: info.color }}>
          {active === 'transports' ? 'Transports' : 'Traders'}
        </span>
        <ChevronRight 
          size={14} 
          style={{ 
            color: info.color,
            transform: showMenu ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }} 
        />
      </button>
      
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-stone-200 py-2 min-w-[200px] z-50">
            {(['transports', 'traders'] as CompanyType[]).map((company) => {
              const companyInfo = COMPANY_INFO[company];
              return (
                <button
                  key={company}
                  onClick={() => {
                    onChange(company);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-stone-50 flex items-center gap-3 transition-colors"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: companyInfo.color }}
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: companyInfo.color }}>
                      {companyInfo.name}
                    </p>
                    <p className="text-xs text-stone-400">{companyInfo.address.substring(0, 40)}...</p>
                  </div>
                  {company === active && (
                    <Check size={16} style={{ color: companyInfo.color }} />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
```

---

## 🎨 Dynamic Theme Colors

To make the sidebar change color based on company, update line 471:

**Before:**
```typescript
<aside className="fixed left-0 top-0 h-full w-64 bg-emerald-900 text-white...">
```

**After:**
```typescript
<aside 
  className="fixed left-0 top-0 h-full w-64 text-white p-6 hidden lg:flex flex-col z-40 overflow-y-auto"
  style={{ backgroundColor: COMPANY_INFO[activeCompany].color }}
>
```

---

## ✅ Testing Checklist

After making these changes:

1. [ ] Company toggle appears in top-right of desktop
2. [ ] Company toggle appears in mobile header
3. [ ] Clicking toggle switches between Transports (green) and Traders (blue)
4. [ ] Sidebar color changes when switching
5. [ ] Only current company's bookings show
6. [ ] Creating new booking saves correct company
7. [ ] Stats update when switching companies
8. [ ] Future bookings filter by company

---

## 🚀 Quick Deploy

After making changes:
```bash
git add src/App.tsx
git commit -m "Add company toggle"
git push
```

Wait 5-10 minutes for Render to deploy, then test!
