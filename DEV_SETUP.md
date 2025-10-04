# Development Setup Guide

## 🚀 Starting Development Server (Mac Terminal Only)

### Step 1: Open Mac Terminal
- Press `Cmd + Space` → type "Terminal" → Enter
- Or use `Cmd + T` in Finder

### Step 2: Navigate to Project
```bash
cd ~/carry-laundry
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Access Your App
After running `npm run dev`, you'll see output like:
```
✓ Ready in 2.3s
- Local:        http://localhost:3000
- Network:      http://192.168.1.100:3000
```

**Open your browser and go to:**
- **Primary URL:** http://localhost:3000
- **Alternative ports:** If 3000 is busy, Next.js will automatically use 3001, 3002, etc.

## 🔧 Troubleshooting

### Port Already in Use
If you get "port already in use" error:

```bash
# Kill any process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Multiple Port Options
```bash
# Try different ports if needed
npm run dev -- -p 3001  # Port 3001
npm run dev -- -p 3002  # Port 3002
npm run dev -- -p 8080  # Port 8080
```

## ✅ Browser Accessibility Checklist

### Quick Verification Steps:
1. **Open browser** (Chrome, Safari, Firefox)
2. **Navigate to:** http://localhost:3000
3. **Check for:**
   - ✅ Page loads without errors
   - ✅ No "This site can't be reached" message
   - ✅ Page loads without errors
   - ✅ Hot-reload works (edit a file in Cursor, see changes in browser)
   - ✅ Console shows no critical errors (F12 → Console tab)

### Alternative URLs to Try:
- http://localhost:3000
- http://localhost:3001
- http://localhost:3002
- http://127.0.0.1:3000

## 🔄 Development Workflow

### Recommended Setup:
1. **Keep Terminal open** in a separate window/tab
2. **Use Cursor for editing** - it will detect file changes
3. **Browser auto-refresh** - Next.js handles hot-reload automatically
4. **Stop server:** Press `Ctrl+C` in terminal when done

### Hot-Reload Verification:
1. Make a small change in Cursor (e.g., edit text in a component)
2. Save the file (`Cmd+S`)
3. Check browser - it should automatically refresh
4. If not working, check terminal for any error messages

## 🚫 What NOT to Do

- ❌ Don't use Cursor's built-in terminal for `npm run dev`
- ❌ Don't run multiple dev servers simultaneously
- ❌ Don't close the terminal window while developing
- ❌ Don't use `npm start` for development (use `npm run dev`)

## 🆘 Quick Fixes

### If Server Won't Start:
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### If Browser Shows "Can't Connect":
1. Check terminal for error messages
2. Verify you're using the correct port (3000, 3001, etc.)
3. Try refreshing the browser
4. Check if firewall is blocking the connection

### If Hot-Reload Stops Working:
1. Save the file again (`Cmd+S`)
2. Check terminal for any error messages
3. Restart the dev server (`Ctrl+C` then `npm run dev`)

## 📝 Notes

- **Cursor is for editing only** - use Mac Terminal for running commands
- **Hot-reload works automatically** - no need to manually refresh browser
- **Keep terminal visible** - you'll see compilation errors and warnings there
- **Port 3000 is default** - Next.js will find the next available port if busy
