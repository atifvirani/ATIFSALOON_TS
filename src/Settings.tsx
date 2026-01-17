import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
const { ipcRenderer } = window.require('electron'); // Communicate with Main Process

export default function Settings() {
  const [services, setServices] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Hair');

  useEffect(() => { loadServices(); }, []);

  async function loadServices() {
    const data = await ipcRenderer.invoke('get-data', 'services');
    setServices(data);
  }

  async function addService() {
    if (!newName || !newPrice) return;
    await ipcRenderer.invoke('add-data', {
      tableName: 'services',
      item: { 
        name: newName, 
        price: parseInt(newPrice),
        category: newCategory
      } 
    });
    setNewName('');
    setNewPrice('');
    loadServices();
  }

  async function deleteService(id: number) {
    await ipcRenderer.invoke('delete-data', { tableName: 'services', id });
    loadServices();
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-[#D4AF37]">Service Menu</h2>

      {/* ADD NEW SERVICE BOX */}
      <div className="bg-[#2C2C2C] p-6 rounded-xl border border-gray-700 mb-8 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-gray-400 text-sm mb-2">Service Name</label>
          <input className="w-full bg-[#1a1a1a] text-white p-3 rounded-lg border border-gray-600 focus:border-[#D4AF37] outline-none" placeholder="e.g. Mens Haircut" value={newName} onChange={(e) => setNewName(e.target.value)} />
        </div>
        
        {/* NEW CATEGORY SELECTOR */}
        <div className="w-48">
          <label className="block text-gray-400 text-sm mb-2">Category</label>
          <select 
            className="w-full bg-[#1a1a1a] text-white p-3 rounded-lg border border-gray-600 focus:border-[#D4AF37] outline-none"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          >
            <option>Hair</option>
            <option>Skin</option>
            <option>Aesthetics</option>
            <option>Products</option>
          </select>
        </div>

        <div className="w-48">
          <label className="block text-gray-400 text-sm mb-2">Price (₹)</label>
          <input type="number" placeholder="500" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full bg-[#1a1a1a] text-white p-3 rounded-lg border border-gray-600 focus:border-[#D4AF37] outline-none" />
        </div>
        <button 
          onClick={addService}
          className="bg-[#D4AF37] text-black font-bold p-3 px-6 rounded-lg hover:bg-yellow-500 transition flex items-center gap-2"
        >
          <Plus size={20} /> Add
        </button>
      </div>

      {/* LIST OF SERVICES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s.id} className="bg-[#2C2C2C] p-4 rounded-lg border border-gray-700 flex justify-between items-center group">
            <div className="flex items-center gap-3">
              <div className="bg-[#1a1a1a] p-2 rounded-full text-[#D4AF37]">
                <Tag size={16} />
              </div>
              <div>
                <h3 className="font-bold text-white">{s.name}</h3>
                <div className="flex gap-2 text-xs">
                   <span className="text-[#D4AF37]">₹ {s.price}</span>
                   <span className="text-gray-500">• {s.category || 'General'}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => deleteService(s.id)}
              className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}