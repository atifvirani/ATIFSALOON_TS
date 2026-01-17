import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSONFilePreset } from 'lowdb/node';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Setup Database with ALL Tables
const defaultData = { 
  settings: { 
    shopName: 'TS Saloon', 
    address: 'Cuttack, Odisha',
    gstin: '',
    phone: '',
    theme: 'gold' 
  },
  services: [],
  categories: ['Hair', 'Skin', 'Aesthetics', 'Products'],
  bills: [],
  customers: [],
  staff: [],      
  inventory: [],  
  coupons: [],    
  consents: [], 
  formulas: []  
};

let db;

async function initDB() {
  const dbPath = path.join(app.getPath('userData'), 'luxe_db.json');
  db = await JSONFilePreset(dbPath, defaultData);
  console.log("📂 Database loaded at:", dbPath);
}

// 2. Create Window
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false
  });

  const devUrl = 'http://localhost:5173';
  win.loadURL(devUrl).catch(() => {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  });

  win.once('ready-to-show', () => win.show());
}

app.whenReady().then(async () => {
  await initDB();
  createWindow();

  // --- MASTER API HANDLERS ---
  
  // 1. GET ANY DATA (This fixes your empty screen!)
  ipcMain.handle('get-data', (e, tableName) => {
    return db.data[tableName] || [];
  });

  // 2. ADD DATA
  ipcMain.handle('add-data', async (e, { tableName, item }) => {
    const newItem = { ...item, id: Date.now(), createdAt: new Date() };
    if (!db.data[tableName]) db.data[tableName] = []; // Safety check
    db.data[tableName].push(newItem);
    await db.write();
    return db.data[tableName];
  });

  // 3. DELETE DATA
  ipcMain.handle('delete-data', async (e, { tableName, id }) => {
    db.data[tableName] = db.data[tableName].filter(i => i.id !== id);
    await db.write();
    return db.data[tableName];
  });

  // 4. OLD HANDLER SUPPORT (Keeps Settings page working if it uses the old way)
  ipcMain.handle('get-services', () => db.data.services);
  ipcMain.handle('add-service', async (e, item) => {
    db.data.services.push({ ...item, id: Date.now() });
    await db.write();
    return db.data.services;
  });

  // 5. SAVE BILL
  ipcMain.handle('save-bill', async (e, billData) => {
    const newBill = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...billData
    };
    db.data.bills.push(newBill);
    await db.write();
    return { success: true, billId: newBill.id };
  });

  // 6. DASHBOARD STATS
  ipcMain.handle('get-stats', () => {
    const totalRevenue = db.data.bills.reduce((sum, bill) => sum + bill.total, 0);
    return {
      revenue: totalRevenue,
      appointments: db.data.bills.length,
      activeChairs: 0 
    };
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});