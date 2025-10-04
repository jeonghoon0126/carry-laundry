# 🚀 Quick Start Guide - Carry Laundry Development

## ✅ Complete Setup Checklist

### 1. **Start Development Server (Mac Terminal)**
```bash
# Option A: Use the startup script (recommended)
cd ~/carry-laundry
./start-dev.sh

# Option B: Manual start
cd ~/carry-laundry
npm run dev
```

### 2. **Open Your App in Browser**
- **Primary:** http://localhost:3000
- **Fallback:** http://localhost:3001 or http://localhost:3002
- **Alternative:** http://127.0.0.1:3000

### 3. **Verify Everything Works**
- [ ] ✅ Page loads without errors
- [ ] ✅ Page loads without errors
- [ ] ✅ No console errors (F12 → Console)
- [ ] ✅ Hot-reload works (edit file in Cursor → see changes in browser)

### 4. **Development Workflow**
- **Terminal:** Keep open for `npm run dev`
- **Cursor:** Use for editing (hot-reload automatic)
- **Browser:** Auto-refreshes on file changes
- **Stop:** Press `Ctrl+C` in terminal when done

## 🔧 Troubleshooting

### Port Issues
```bash
# Kill port 3000 if busy
lsof -ti:3000 | xargs kill -9

# Use different port
npm run dev -- -p 3001
```

### Hot-Reload Not Working
1. Save file in Cursor (`Cmd+S`)
2. Check terminal for errors
3. Restart server (`Ctrl+C` then `npm run dev`)

### Browser Can't Connect
1. Check terminal for error messages
2. Try different port (3001, 3002)
3. Clear browser cache
4. Check firewall settings

## 📝 Important Notes

- **❌ Don't use Cursor's terminal for `npm run dev`**
- **✅ Use Mac Terminal for running commands**
- **✅ Use Cursor for editing only**
- **✅ Hot-reload works automatically**
- **✅ Keep terminal visible for error messages**

## 🆘 Quick Fixes

### If Server Won't Start:
```bash
rm -rf .next
npm run dev
```

### If Browser Shows Errors:
1. Check terminal output
2. Try different port
3. Clear browser cache
4. Restart development server

### If Hot-Reload Stops:
1. Save file again (`Cmd+S`)
2. Check for syntax errors
3. Restart server if needed

---

**🎯 Goal:** Stable development with Mac Terminal + Cursor editing + automatic hot-reload
