import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Scissors, Pencil, X, Save } from 'lucide-react';
const { ipcRenderer } = window.require('electron');

export default function Settings() {
  const [services, setServices] = useState<any[]>([]);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Hair');
  const [editId, setEditId] = useState<number | null>(null); // Track which item we are editing

  useEffect(() => { loadServices(); }, []);

  async function loadServices() {
    const data = await ipcRenderer.invoke('get-data', 'services');
    setServices(data || []);
  }

  // --- EDIT LOGIC ---
  const startEdit = (s: any) => {
    setName(s.name);
    setPrice(s.price);
    setCategory(s.category || 'Hair');
    setEditId(s.id);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setName('');
    setPrice('');
    setCategory('Hair');
    setEditId(null);
  };

  async function handleSave() {
    if (!name || !price) return;

    if (editId) {
      // UPDATE EXISTING
      await ipcRenderer.invoke('update-data', {
        tableName: 'services',
        id: editId,
        updates: { name, price: parseInt(price), category }
      });
    } else {
      // ADD NEW
      await ipcRenderer.invoke('add-data', {
        tableName: 'services',
        item: { name, price: parseInt(price), category }
      });
    }
    
    cancelEdit(); // Reset form
    loadServices(); // Refresh list
  }

  async function deleteService(id: number) {
    if(!confirm("Are you sure you want to delete this service?")) return;
    await ipcRenderer.invoke('delete-data', { tableName: 'services', id });
    loadServices();
  }

  return (
    <div className="p-6 pb-20">
      <h2 className="text-3xl font-bold mb-6 text-[#D4AF37]">Service Menu</h2>

      {/* EDITOR BAR (Adapts to Add or Edit) */}
      <div className={`p-6 rounded-xl border mb-8 flex gap-4 items-end shadow-lg transition-colors ${editId ? 'bg-yellow-900/20 border-[#D4AF37]' : 'bg-[#2C2C2C] border-gray-700'}`}>
        <div className="flex-1">
          <label className="block text-gray-400 text-xs font-bold uppercase mb-2">
            {editId ? "Editing Service Name" : "New Service Name"}
          </label>
          <input className="w-full bg-[#1a1a1a] text-white p-3 rounded-lg border border-gray-600 focus:border-[#D4AF37] outline-none" 
            placeholder="e.g. Keratin Treatment" value={name} onChange={(e) => setName(e.target.value)} 
          />
        </div>
        
        <div className="w-48">
          <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Category</label>
          <select className="w-full bg-[#1a1a1a] text-white p-3 rounded-lg border border-gray-600 focus:border-[#D4AF37] outline-none"
            value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Hair</option>
            <option>Skin</option>
            <option>Makeup</option>
            <option>Aesthetics</option>
            <option>Products</option>
          </select>
        </div>

        <div className="w-32">
          <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Price (₹)</label>
          <input type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} 
            className="w-full bg-[#1a1a1a] text-white p-3 rounded-lg border border-gray-600 focus:border-[#D4AF37] outline-none" 
          />
        </div>

        <div className="flex gap-2">
          {editId && (
            <button onClick={cancelEdit} className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition" title="Cancel">
              <X size={20} />
            </button>
          )}
          <button onClick={handleSave} className={`${editId ? 'bg-[#D4AF37] text-black' : 'bg-[#D4AF37] text-black'} font-bold p-3 px-6 rounded-lg hover:bg-yellow-500 transition flex items-center gap-2`}>
            {editId ? <><Save size={20}/> Update</> : <><Plus size={20}/> Add</>}
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s.id} className={`p-4 rounded-lg border flex justify-between items-center group transition ${editId === s.id ? 'border-[#D4AF37] bg-yellow-900/10' : 'bg-[#2C2C2C] border-gray-700'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${s.category === 'Hair' ? 'bg-blue-900 text-blue-300' : s.category === 'Skin' ? 'bg-pink-900 text-pink-300' : 'bg-gray-800 text-gray-300'}`}>
                {s.category === 'Hair' ? <Scissors size={18} /> : <Tag size={18} />}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{s.name}</h3>
                <div className="flex gap-2 text-xs mt-1">
                   <span className="text-[#D4AF37] font-bold">₹ {s.price}</span>
                   <span className="text-gray-500 bg-[#1a1a1a] px-2 rounded">{s.category || 'General'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button onClick={() => startEdit(s)} className="text-blue-400 hover:text-blue-300 p-2"><Pencil size={18} /></button>
              <button onClick={() => deleteService(s.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}