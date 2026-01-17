import { useState, useEffect } from 'react';
import { Search, Calendar, User, FileText, X, Printer } from 'lucide-react';
const { ipcRenderer } = window.require('electron');

export default function Invoices() {
  const [bills, setBills] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState<any>(null);

  useEffect(() => { loadBills(); }, []);

  async function loadBills() {
    const data = await ipcRenderer.invoke('get-data', 'bills');
    setBills(data.reverse());
  }

  const filteredBills = bills.filter(b => 
    b.customerName.toLowerCase().includes(search.toLowerCase()) ||
    b.customerPhone.includes(search)
  );

  return (
    <div className="p-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#D4AF37]">Invoice History</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#2C2C2C] text-white pl-10 p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]"
          />
        </div>
      </div>

      <div className="bg-[#2C2C2C] p-4 rounded-t-lg flex font-bold text-gray-400">
        <div className="w-1/4">Date</div>
        <div className="w-1/4">Customer</div>
        <div className="w-1/4">Services</div>
        <div className="w-1/4 text-right">Amount</div>
      </div>
      <div className="flex-1 overflow-auto bg-[#1a1a1a] border border-gray-700 rounded-b-lg">
        {filteredBills.map((bill) => (
          <div 
            key={bill.id} 
            onClick={() => setSelectedBill(bill)}
            className="p-4 border-b border-gray-800 flex hover:bg-[#252525] transition items-center cursor-pointer"
          >
            <div className="w-1/4 flex items-center gap-2 text-sm text-gray-300">
              <Calendar size={14} className="text-[#D4AF37]" /> {new Date(bill.date).toLocaleDateString()}
            </div>
            <div className="w-1/4 font-medium text-white flex items-center gap-2">
              <User size={14} /> {bill.customerName}
            </div>
            <div className="w-1/4 text-sm text-gray-400">{bill.items.length} Items</div>
            <div className="w-1/4 text-right font-bold text-[#D4AF37]">₹ {bill.total}</div>
          </div>
        ))}
      </div>

      {selectedBill && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-10">
          <div className="bg-[#2C2C2C] w-full max-w-2xl rounded-xl shadow-2xl border border-[#D4AF37] flex flex-col max-h-full">
            
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-[#252525] rounded-t-xl">
              <div>
                <h3 className="text-xl font-bold text-[#D4AF37]">Invoice Details</h3>
                <p className="text-sm text-gray-400">ID: #{selectedBill.id}</p>
              </div>
              <button onClick={() => setSelectedBill(null)} className="text-gray-400 hover:text-white"><X size={24}/></button>
            </div>

            <div className="p-8 overflow-auto flex-1">
              <div className="flex justify-between mb-8 text-sm">
                <div>
                  <p className="text-gray-500 uppercase text-xs font-bold">Customer</p>
                  <p className="text-xl font-bold text-white">{selectedBill.customerName}</p>
                  <p className="text-gray-400">{selectedBill.customerPhone}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 uppercase text-xs font-bold">Date</p>
                  <p className="text-white">{new Date(selectedBill.date).toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <table className="w-full text-left">
                  <thead className="text-gray-500 text-xs uppercase border-b border-gray-700">
                    <tr><th className="pb-2">Service</th><th className="pb-2 text-right">Price</th></tr>
                  </thead>
                  <tbody className="text-white">
                    {selectedBill.items.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-800">
                        <td className="py-3">{item.name}</td>
                        <td className="py-3 text-right">₹ {item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 bg-[#252525] rounded-b-xl border-t border-gray-700 flex justify-between items-center">
              <div className="text-2xl font-bold text-white">Total: <span className="text-[#D4AF37]">₹ {selectedBill.total}</span></div>
              <button className="bg-[#D4AF37] text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-500">
                <Printer size={18} /> Print PDF
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}