import { useState, useEffect } from 'react';
import { User, Trash, CheckCircle, Printer, Search, CreditCard, Banknote } from 'lucide-react';
const { ipcRenderer } = window.require('electron');

export default function Billing() {
  const [services, setServices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  
  // CATEGORY STATE
  const [categories, setCategories] = useState<string[]>(['All', 'Hair', 'Skin', 'Aesthetics', 'Products']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Smart Search
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Checkout Data
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  
  const [isReturning, setIsReturning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setServices(await ipcRenderer.invoke('get-data', 'services'));
    setCustomers(await ipcRenderer.invoke('get-data', 'customers'));
    setStaffList(await ipcRenderer.invoke('get-data', 'staff'));
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    if (!customerName) return alert("Enter customer name!");
    if (!selectedStaff) return alert("Who did this job? Select Staff!");

    const total = cart.reduce((sum, i) => sum + i.price, 0);

    // Save Bill with ALL Metadata
    await ipcRenderer.invoke('save-bill', {
      customerName,
      customerPhone,
      items: cart,
      total,
      staff: selectedStaff,
      paymentMode: paymentMode,
    });

    // Auto-CRM Update
    const existing = customers.find(c => c.phone === customerPhone);
    if (!existing) {
       await ipcRenderer.invoke('add-data', {
         tableName: 'customers',
         item: { name: customerName, phone: customerPhone, type: 'Regular', visits: 1 }
       });
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setSearchTerm('');
      setSelectedStaff('');
      setIsReturning(false);
      loadData();
    }, 2000);
  };

  // ... (Search Logic Same as Before) ...
  const handleSearch = (e: any) => {
    const val = e.target.value;
    setSearchTerm(val);
    setShowDropdown(val.length > 0);
    setCustomerName(val); 
  };
  const selectCustomer = (c: any) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setSearchTerm(c.name);
    setIsReturning(true);
    setShowDropdown(false);
  };
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm));

  // --- NEW: FILTER SERVICES BY CATEGORY ---
  const filteredServices = services.filter(s => {
    if (selectedCategory === 'All') return true;
    return s.category === selectedCategory;
  });

  return (
    <div className="flex h-full gap-6 p-6 overflow-hidden">
      {/* LEFT: MENU */}
      <div className="flex-1 bg-[#2C2C2C] rounded-xl p-6 border border-gray-700 overflow-auto">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-2xl font-bold text-[#D4AF37]">Services</h2>
           {/* CATEGORY TABS (Now Functional!) */}
           <div className="flex gap-2 text-sm">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full transition ${selectedCategory === cat ? 'bg-[#D4AF37] text-black font-bold' : 'bg-[#1a1a1a] text-gray-400 border border-gray-600'}`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredServices.map((s) => (
            <button key={s.id} onClick={() => setCart([...cart, s])} className="bg-[#1a1a1a] p-4 rounded-lg hover:border-[#D4AF37] border border-transparent transition text-left group">
              <h3 className="font-bold text-white group-hover:text-[#D4AF37]">{s.name}</h3>
              <p className="text-gray-400">₹ {s.price}</p>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: CART */}
      <div className="w-96 bg-[#1a1a1a] rounded-xl border border-gray-700 flex flex-col">
        {/* CUSTOMER SEARCH */}
        <div className="p-6 border-b border-gray-700 bg-[#252525] rounded-t-xl relative">
          <div className="relative z-10">
            <input className="w-full bg-[#1a1a1a] p-3 pl-10 rounded border border-gray-600 text-white focus:border-[#D4AF37] outline-none" placeholder="Search Customer..." value={searchTerm} onChange={handleSearch} onFocus={() => setShowDropdown(searchTerm.length > 0)} onBlur={() => setTimeout(() => setShowDropdown(false), 200)} />
            <Search className="absolute left-3 top-3 text-gray-500" size={16}/>
            {showDropdown && filteredCustomers.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-[#333] border border-gray-600 rounded-b-lg shadow-xl max-h-60 overflow-auto mt-1">
                {filteredCustomers.map(c => (
                  <div key={c.id} onClick={() => selectCustomer(c)} className="p-3 hover:bg-[#D4AF37] hover:text-black cursor-pointer text-white border-b border-gray-700">
                    <div className="font-bold">{c.name}</div>
                    <div className="text-xs opacity-70">{c.phone}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CART LIST */}
        <div className="flex-1 p-4 overflow-auto">
          {cart.map((item, idx) => (
             <div key={idx} className="flex justify-between items-center mb-3 text-sm border-b border-gray-800 pb-2">
                <span className="text-gray-300">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-white">₹{item.price}</span>
                  <button onClick={() => { const n = [...cart]; n.splice(idx, 1); setCart(n); }} className="text-red-400"><Trash size={14}/></button>
                </div>
              </div>
          ))}
        </div>

        {/* --- NEW CHECKOUT CONTROLS --- */}
        <div className="p-6 bg-[#252525] border-t border-gray-700 rounded-b-xl space-y-4">
          
          {/* STAFF SELECTOR */}
          <div>
            <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Attended By</label>
            <select 
              value={selectedStaff} 
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full bg-[#1a1a1a] text-white p-2 rounded border border-gray-600 focus:border-[#D4AF37] outline-none"
            >
              <option value="">-- Select Stylist --</option>
              {staffList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          {/* PAYMENT MODE */}
          <div>
            <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Payment Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setPaymentMode('Cash')}
                className={`p-2 rounded text-sm font-bold flex items-center justify-center gap-2 border ${paymentMode === 'Cash' ? 'bg-green-800 border-green-500 text-white' : 'bg-[#1a1a1a] border-gray-600 text-gray-400'}`}
              >
                <Banknote size={16}/> Cash
              </button>
              <button 
                onClick={() => setPaymentMode('UPI')}
                className={`p-2 rounded text-sm font-bold flex items-center justify-center gap-2 border ${paymentMode === 'UPI' ? 'bg-blue-800 border-blue-500 text-white' : 'bg-[#1a1a1a] border-gray-600 text-gray-400'}`}
              >
                <CreditCard size={16}/> UPI / Online
              </button>
            </div>
          </div>

          {/* TOTAL & PAY */}
          <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-gray-700">
            <span>Total</span><span className="text-[#D4AF37]">₹ {cart.reduce((a,b)=>a+b.price,0)}</span>
          </div>
          <button onClick={handleCheckout} className="w-full bg-[#D4AF37] text-black p-4 rounded-lg font-bold hover:bg-yellow-500 transition flex justify-center items-center gap-2">
            {showSuccess ? <CheckCircle /> : <Printer size={20} />} 
            {showSuccess ? "Success!" : "Checkout"}
          </button>
        </div>

      </div>
    </div>
  );
}