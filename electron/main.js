const { app, BrowserWindow, Menu, shell, dialog } = require("electron");
const path = require("path");
const http = require("http");

let mainWindow = null;
const DEFAULT_URL = process.env.APP_URL || process.env.SERVER_URL || "http://localhost:3010";

function checkServerHealth(url, timeoutMs = 2000) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const req = http.request(
        {
          hostname: parsed.hostname,
          port: parsed.port || 80,
          path: "/api/health",
          method: "GET",
          timeout: timeoutMs,
        },
        (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 400);
        }
      );
      req.on("error", () => resolve(false));
      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    } catch {
      resolve(false);
    }
  });
}

function getIconPath() {
  if (process.platform === "win32") {
    return path.join(__dirname, "../public/icons/icon.ico");
  }
  return path.join(__dirname, "../public/icons/icon.png");
}

function createMenu() {
  const isMac = process.platform === "darwin";

  const template = [
    ...(isMac
      ? [
          {
            label: "GTMTS",
            submenu: [
              { role: "about", label: "เกี่ยวกับ GTMTS" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide", label: "ซ่อนหน้าต่าง" },
              { role: "hideOthers", label: "ซ่อนแอปอื่น" },
              { role: "unhide", label: "แสดงทั้งหมด" },
              { type: "separator" },
              { role: "quit", label: "ออกจากระบบ" },
            ],
          },
        ]
      : []),
    {
      label: "ระบบ (System)",
      submenu: [
        {
          label: "เชื่อมต่อเซิร์ฟเวอร์ใหม่ (Reconnect)",
          accelerator: "CmdOrCtrl+Shift+R",
          click: () => {
            if (mainWindow) {
              loadAppUrl(mainWindow, DEFAULT_URL);
            }
          },
        },
        {
          label: "เปลี่ยน URL เซิร์ฟเวอร์...",
          click: async () => {
            const { response, inputValue } = await dialog.showMessageBox(mainWindow, {
              type: "question",
              buttons: ["ตกลง", "ยกเลิก"],
              defaultId: 0,
              title: "ตั้งค่าการเชื่อมต่อเซิร์ฟเวอร์",
              message: `URL ปัจจุบัน: ${DEFAULT_URL}\n\nต้องการเปลี่ยนที่อยู่เซิร์ฟเวอร์ใหม่หรือไม่?`,
              detail: "หากต้องการเปลี่ยน กรุณาระบุผ่านคำสั่งเริ่มแอปด้วย SERVER_URL=http://your-server-ip:3010",
            });
          },
        },
        { type: "separator" },
        isMac ? { role: "close", label: "ปิดหน้าต่าง" } : { role: "quit", label: "ออกจากโปรแกรม" },
      ],
    },
    {
      label: "แก้ไข (Edit)",
      submenu: [
        { role: "undo", label: "เลิกทำ (Undo)" },
        { role: "redo", label: "ทำซ้ำ (Redo)" },
        { type: "separator" },
        { role: "cut", label: "ตัด (Cut)" },
        { role: "copy", label: "คัดลอก (Copy)" },
        { role: "paste", label: "วาง (Paste)" },
        { role: "selectAll", label: "เลือกทั้งหมด (Select All)" },
      ],
    },
    {
      label: "มุมมอง (View)",
      submenu: [
        { role: "reload", label: "รีโหลดหน้าจอ (Reload)", accelerator: "CmdOrCtrl+R" },
        { role: "forceReload", label: "โหลดใหม่แบบล้างแคช (Force Reload)", accelerator: "CmdOrCtrl+Shift+R" },
        { type: "separator" },
        { role: "resetZoom", label: "ขนาดปกติ (Reset Zoom)" },
        { role: "zoomIn", label: "ขยาย (Zoom In)" },
        { role: "zoomOut", label: "ย่อ (Zoom Out)" },
        { type: "separator" },
        { role: "togglefullscreen", label: "เต็มหน้าจอ (Toggle Fullscreen)", accelerator: "F11" },
      ],
    },
    {
      label: "ช่วยเหลือ (Help)",
      submenu: [
        {
          label: "เปิด Developer Tools",
          accelerator: "F12",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          },
        },
        { type: "separator" },
        {
          label: "เกี่ยวกับ GTMTS",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "เกี่ยวกับ GTMTS",
              message: "GTMTS - ระบบบริหารจัดการองค์กร",
              detail:
                "ภาควิชาภาษาต่างประเทศ คณะมนุษยศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย\n\nเวอร์ชัน Desktop Application 1.0.0 (Windows & macOS)\nPowered by Next.js & Electron",
              buttons: ["ตกลง"],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function showWaitingScreen(win, targetUrl) {
  const loadingHtml = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <title>กำลังเชื่อมต่อ GTMTS...</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Sarabun", "Segoe UI", Roboto, sans-serif; }
        body {
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          color: #1e293b;
        }
        .card {
          background: #ffffff;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
          border: 1px solid #e2e8f0;
          text-align: center;
          max-width: 460px;
          width: 90%;
        }
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #fecdd3;
          border-top-color: #e11d48;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        h2 { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
        p { font-size: 13px; color: #64748b; margin-bottom: 20px; line-height: 1.5; }
        .url-badge {
          display: inline-block;
          background: #f1f5f9;
          padding: 6px 14px;
          border-radius: 9999px;
          font-family: monospace;
          font-size: 12px;
          color: #475569;
          margin-bottom: 24px;
          word-break: break-all;
        }
        .btn {
          display: inline-block;
          background: #e11d48;
          color: white;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: background 0.2s;
        }
        .btn:hover { background: #be123c; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="spinner"></div>
        <h2>กำลังเชื่อมต่อระบบ GTMTS</h2>
        <p>กรุณารอสักครู่ ระบบกำลังเริ่มทำงานหรือเชื่อมต่อไปยังเซิร์ฟเวอร์</p>
        <div class="url-badge">${targetUrl}</div>
        <div>
          <button class="btn" onclick="location.reload()">ลองเชื่อมต่ออีกครั้ง</button>
        </div>
      </div>
    </body>
    </html>
  `;
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHtml)}`);
}

async function loadAppUrl(win, targetUrl) {
  showWaitingScreen(win, targetUrl);

  let attempts = 0;
  const maxAttempts = 30;

  const tryConnect = async () => {
    attempts++;
    const isHealthy = await checkServerHealth(targetUrl);
    if (isHealthy) {
      win.loadURL(targetUrl);
      return;
    }

    if (attempts < maxAttempts) {
      setTimeout(tryConnect, 1000);
    } else {
      // Direct attempt even if health check failed (fallback)
      win.loadURL(targetUrl).catch(() => {
        showWaitingScreen(win, targetUrl);
      });
    }
  };

  tryConnect();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "GTMTS - ระบบบริหารจัดการองค์กร",
    icon: getIconPath(),
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  createMenu();

  loadAppUrl(mainWindow, DEFAULT_URL);

  // Open external links in user's default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      try {
        const appDomain = new URL(DEFAULT_URL).hostname;
        const targetDomain = new URL(url).hostname;
        if (targetDomain !== appDomain) {
          shell.openExternal(url);
          return { action: "deny" };
        }
      } catch {
        // Fallback
      }
    }
    return { action: "allow" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
