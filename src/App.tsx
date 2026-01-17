import { useState, useEffect } from 'react';
import { LayoutDashboard, Scissors, Users, Settings, LogOut, FileText, TrendingDown, TrendingUp, PlusCircle } from 'lucide-react';
import SettingsPage from './Settings';
import BillingPage from './Billing';
import InvoicesPage from './Invoices';
import CustomersPage from './Customers';
import StaffPage from './Staff';

const { ipcRenderer } = window.require('electron');

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ revenue: 0, expenses: 0, profit: 0, appointments: 0 });
  
  // Expense Form State
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  useEffect(() => {
    if (activeTab === 'dashboard') loadStats();
  }, [activeTab]);

  async function loadStats() {
    const data = await ipcRenderer.invoke('get-stats');
    setStats(data);
  }

  async function addExpense() {
    if (!expenseName || !expenseAmount) return;
    await ipcRenderer.invoke('add-data', {
      tableName: 'expenses',
      item: { name: expenseName, amount: parseInt(expenseAmount), type: 'Expense' }
    });
    setExpenseName('');
    setExpenseAmount('');
    loadStats(); // Refresh numbers
  }

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-[#2C2C2C] border-r border-gray-700 flex flex-col">
        <div className="p-6 text-center border-b border-gray-700">
          <h1 className="text-2xl font-bold text-[#D4AF37]">TS Saloon</h1>
          <p className="text-xs text-gray-400">Management OS v1.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon={<LayoutDashboard />} text="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Scissors />} text="Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
          <SidebarItem icon={<FileText />} text="History" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
          <SidebarItem icon={<Users />} text="Customers" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
          <SidebarItem icon={<Users />} text="Staff" active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} />
          <SidebarItem icon={<Settings />} text="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button className="flex items-center space-x-3 w-full p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden bg-[#1a1a1a]">
        
        {activeTab === 'settings' ? (
          <SettingsPage />
        ) : activeTab === 'billing' ? (
          <BillingPage />
        ) : activeTab === 'invoices' ? (
          <InvoicesPage />
        ) : activeTab === 'customers' ? (
          <CustomersPage />
        ) : activeTab === 'staff' ? (
          <StaffPage />
        ) : (
          
          /* --- DASHBOARD --- */
          <div className="p-8 h-full overflow-auto">
            <header className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold capitalize text-white">Business Overview</h2>
              <div className="bg-[#D4AF37] text-black px-4 py-2 rounded-full font-bold shadow-lg">
                Server: OFFLINE 🔴
              </div>
            </header>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card title="Total Revenue" value={`₹ ${stats.revenue}`} icon={<TrendingUp className="text-green-500"/>} />
              <Card title="Expenses" value={`₹ ${stats.expenses}`} icon={<TrendingDown className="text-red-500"/>} />
              <div className={`p-6 rounded-xl border border-gray-700 ${stats.profit >= 0 ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
                 <h3 className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Net Profit</h3>
                 <p className={`text-3xl font-bold ${stats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹ {stats.profit}</p>
              </div>
            </div>

            {/* QUICK EXPENSE ADDER */}
            <div className="bg-[#2C2C2C] p-6 rounded-xl border border-gray-700 max-w-2xl">
              <h3 className="text-xl font-bold text-[#D4AF37] mb-4 flex items-center gap-2">
                <PlusCircle size={20}/> Quick Expense Log
              </h3>
              <div className="flex gap-4">
                <input 
                  className="flex-1 bg-[#1a1a1a] text-white p-3 rounded-lg border border-gray-600 focus:border-red-500 outline-none"
                  placeholder="Item (e.g. Tea, Cleaner, Lunch)"
                  value={expenseName}
                  onChange={e => setExpenseName(e.target.value)}
                />
                <input 
                  className="w-32 bg-[#1a1a1a] text-white p-3 rounded-lg border border-gray-600 focus:border-red-500 outline-none"
                  placeholder="Amount"
                  type="number"
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                />
                <button 
                  onClick={addExpense}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition"
                >
                  Add
                </button>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

function SidebarItem({ icon, text, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center space-x-3 w-full p-3 rounded-lg transition ${active ? 'bg-[#D4AF37] text-black font-bold shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
      {icon} <span>{text}</span>
    </button>
  );
}

function Card({ title, value, icon }: any) {
  return (
    <div className="bg-[#2C2C2C] p-6 rounded-xl border border-gray-700 flex justify-between items-start">
      <div>
        <h3 className="text-gray-400 text-sm mb-2 uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-[#D4AF37]">{value}</p>
      </div>
      {icon}
    </div>
  );
}
  );
}

export default App;