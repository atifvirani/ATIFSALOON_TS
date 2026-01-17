import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
const { ipcRenderer } = window.require('electron'); // Communicate with Main Process

export default function Settings() {
  const [services, setServices] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Load services when page opens
  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    const data = await ipcRenderer.invoke('get-services');
    setServices(data);
  }

  async function addService() {
    if (!newName || !newPrice) return;
    const updated = await ipcRenderer.invoke('add-service', { 
      name: newName, 
      price: parseInt(newPrice) 
    });
    setServices(updated);
    setNewName('');
    setNewPrice('');
  }

  async function deleteService(id: number) {
    const updated = await ipcRenderer.invoke('delete-service', id);
    setServices(updated);
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-[#D4AF37]">Service Menu</h2>

      {/* ADD NEW SERVICE BOX */}
      <div className="bg-[#2C2C2C] p-6 rounded-xl border border-gray-700 mb-8 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-gray-400 text-sm mb-2">Service Name</label>
          <input 
            type="text" 
            placeholder="e.g. Mens Haircut"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-[#1a1a1a] text-white p-3 rounded-lg border border-gray-600 focus:border-[#D4AF37] outline-none"
          />
        </div>
        <div className="w-48">
          <label className="block text-gray-400 text-sm mb-2">Price (₹)</label>
          <input 
            type="number" 
            placeholder="500"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="w-full bg-[#1a1a1a] text-white p-3 rounded-lg border border-gray-600 focus:border-[#D4AF37] outline-none"
          />
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
                <p className="text-[#D4AF37]">₹ {s.price}</p>
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