import { useState, useEffect } from 'react';
import { User, Plus, Trash2 } from 'lucide-react';
const { ipcRenderer } = window.require('electron');

export default function Staff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Stylist');

  useEffect(() => { loadStaff(); }, []);

  async function loadStaff() {
    const data = await ipcRenderer.invoke('get-data', 'staff');
    setStaff(data);
  }

  async function addStaff() {
    if (!newName) return;
    await ipcRenderer.invoke('add-data', {
      tableName: 'staff',
      item: { name: newName, role: newRole, active: true }
    });
    setNewName('');
    loadStaff();
  }

  async function deleteStaff(id: number) {
    await ipcRenderer.invoke('delete-data', { tableName: 'staff', id });
    loadStaff();
  }

  return (
    <div className="p-6 h-full">
      <h2 className="text-3xl font-bold text-[#D4AF37] mb-6">Staff Management</h2>
      
      {/* ADD STAFF */}
      <div className="bg-[#2C2C2C] p-4 rounded-lg flex gap-4 items-end mb-8 border border-gray-700">
        <div className="flex-1">
          <label className="text-xs text-gray-400">Name</label>
          <input className="w-full bg-[#1a1a1a] p-2 rounded text-white border border-gray-600" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Rahul" />
        </div>
        <div className="w-48">
          <label className="text-xs text-gray-400">Role</label>
          <select className="w-full bg-[#1a1a1a] p-2 rounded text-white border border-gray-600" value={newRole} onChange={e => setNewRole(e.target.value)}>
            <option>Stylist</option>
            <option>Doctor</option>
            <option>Assistant</option>
            <option>Receptionist</option>
          </select>
        </div>
        <button onClick={addStaff} className="bg-[#D4AF37] text-black px-6 py-2 rounded font-bold hover:bg-yellow-500 flex items-center gap-2"><Plus size={18}/> Add</button>
      </div>

      {/* STAFF LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {staff.map((s) => (
          <div key={s.id} className="bg-[#2C2C2C] p-4 rounded-lg border border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-[#1a1a1a] p-2 rounded-full text-gray-400"><User /></div>
              <div>
                <h3 className="font-bold text-white">{s.name}</h3>
                <p className="text-xs text-[#D4AF37]">{s.role}</p>
              </div>
            </div>
            <button onClick={() => deleteStaff(s.id)} className="text-red-400 hover:text-red-200"><Trash2 size={18}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}
