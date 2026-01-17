import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSONFilePreset } from 'lowdb/node';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Setup Database
const defaultData = { 
  settings: { shopName: 'TS Saloon', theme: 'gold' },
  services: [],
  categories: ['Hair', 'Skin', 'Makeup', 'Aesthetics', 'Products'],
  bills: [],
  customers: [],
  staff: [],      
  inventory: [],
  expenses: [],
  coupons: []
};

let db;

async function initDB() {
  const dbPath = path.join(app.getPath('userData'), 'luxe_db.json');
  db = await JSONFilePreset(dbPath, defaultData);
  console.log("📂 Database loaded at:", dbPath);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800,
    backgroundColor: '#1a1a1a',
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    show: false
  });
  
  const devUrl = 'http://localhost:5173';
  win.loadURL(devUrl).catch(() => win.loadFile(path.join(__dirname, 'dist/index.html')));
  win.once('ready-to-show', () => win.show());

  // Fix for WhatsApp opening in new window instead of browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

app.whenReady().then(async () => {
  await initDB();
  createWindow();

  // --- API HANDLERS ---
  
  // 1. GET
  ipcMain.handle('get-data', (e, tableName) => db.data[tableName] || []);
  
  // 2. ADD
  ipcMain.handle('add-data', async (e, { tableName, item }) => {
    const newItem = { ...item, id: Date.now(), date: new Date().toISOString() };
    if (!db.data[tableName]) db.data[tableName] = [];
    db.data[tableName].push(newItem);
    await db.write();
    return db.data[tableName];
  });

  // 3. DELETE
  ipcMain.handle('delete-data', async (e, { tableName, id }) => {
    db.data[tableName] = db.data[tableName].filter(i => i.id !== id);
    await db.write();
    return db.data[tableName];
  });

  // 4. UPDATE (NEW FEATURE!)
  ipcMain.handle('update-data', async (e, { tableName, id, updates }) => {
    const list = db.data[tableName];
    const index = list.findIndex(i => i.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      await db.write();
    }
    return list;
  });

  // 5. SAVE BILL (Smart CRM)
  ipcMain.handle('save-bill', async (e, billData) => {
    const newBill = { id: Date.now(), date: new Date().toISOString(), ...billData };
    db.data.bills.push(newBill);

    // Auto-update Customer Visits
    const customerIndex = db.data.customers.findIndex(c => c.phone === billData.customerPhone);
    if (customerIndex !== -1) {
      db.data.customers[customerIndex].visits = (db.data.customers[customerIndex].visits || 0) + 1;
    }

    await db.write();
    return { success: true };
  });

  // 6. DASHBOARD STATS
  ipcMain.handle('get-stats', () => {
    const revenue = db.data.bills.reduce((sum, bill) => sum + bill.total, 0);
    const expenses = db.data.expenses.reduce((sum, exp) => sum + parseInt(exp.amount), 0);
    return {
      revenue,
      expenses,
      profit: revenue - expenses,
      appointments: db.data.bills.length
    };
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});