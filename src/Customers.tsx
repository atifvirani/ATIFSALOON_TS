import { useState, useEffect } from 'react';
import { Search, User, Phone, Star, Plus } from 'lucide-react';
const { ipcRenderer } = window.require('electron');

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  
  // New Customer Form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    const data = await ipcRenderer.invoke('get-data', 'customers');
    setCustomers(data.reverse());
  }

  async function addCustomer() {
    if (!newName || !newPhone) return alert("Fill all details");
    await ipcRenderer.invoke('add-data', {
      tableName: 'customers',
      item: { name: newName, phone: newPhone, type: 'Regular', visits: 0 }
    });
    setNewName('');
    setNewPhone('');
    setShowAdd(false);
    loadCustomers();
  }

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#D4AF37]">Customer Database</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-500"
        >
          <Plus size={18}/> Add New
        </button>
      </div>

      {/* ADD NEW FORM (Hidden by default) */}
      {showAdd && (
        <div className="bg-[#2C2C2C] p-4 rounded-lg border border-gray-700 mb-6 flex gap-4 items-end animate-in fade-in slide-in-from-top-4">
          <div className="flex-1">
            <label className="text-xs text-gray-400">Name</label>
            <input className="w-full bg-[#1a1a1a] p-2 rounded text-white border border-gray-600" value={newName} onChange={e => setNewName(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-400">Phone</label>
            <input className="w-full bg-[#1a1a1a] p-2 rounded text-white border border-gray-600" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
          </div>
          <button onClick={addCustomer} className="bg-green-600 text-white px-6 py-2 rounded font-bold">Save</button>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-500" size={18} />
        <input 
          type="text" 
          placeholder="Search Client Name or Phone..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#2C2C2C] text-white pl-10 p-3 rounded-lg outline-none focus:border-[#D4AF37] border border-transparent"
        />
      </div>

      {/* CUSTOMER LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
        {filtered.map((c) => (
          <div key={c.id} className="bg-[#2C2C2C] p-4 rounded-lg border border-gray-700 flex justify-between items-center hover:border-[#D4AF37] transition group">
            <div className="flex items-center gap-4">
              <div className="bg-[#1a1a1a] p-3 rounded-full text-gray-400 group-hover:text-[#D4AF37]">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{c.name}</h3>
                <p className="text-gray-400 text-sm flex items-center gap-1"><Phone size={12}/> {c.phone}</p>
              </div>
            </div>
            {c.type === 'VIP' && <Star className="text-yellow-500 fill-yellow-500" size={20} />}
          </div>
        ))}
      </div>
    </div>
  );
}
