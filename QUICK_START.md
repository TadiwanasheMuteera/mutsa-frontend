# ⚡ Quick Start Guide

## 📥 Installation (5 minutes)

### 1. Navigate to Project Directory
```bash
cd /c/Users/Administrator/Desktop/Assignments/MUTAWASHE/FRONT-END
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages:
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- React Query
- Zustand
- React Hook Form
- And more...

### 3. Verify Installation
```bash
npm run build
```

Should complete without errors.

---

## 🚀 Running the Application

### Development Mode (Recommended)
```bash
npm run dev
```

This will:
- Start dev server at `http://localhost:3000`
- Open browser automatically
- Enable hot module reloading (HMR)
- Show build errors in console

### Production Build
```bash
npm run build
npm run preview
```

---

## ✅ Pre-flight Checklist

Before starting the dev server, ensure:

- [ ] Node.js 16+ is installed (`node --version`)
- [ ] npm is up to date (`npm --version`)
- [ ] Flask backend is running at `http://172.16.10.71:5000`
- [ ] Backend database is initialized
- [ ] `.env` file has correct `VITE_API_URL`

---

## 🔧 Configuration

### Update Backend URL (if needed)

Edit `.env`:
```env
VITE_API_URL=http://your-backend-url:5000
```

### Change Port

Edit `vite.config.js`:
```js
server: {
  port: 3000,  // Change this
  open: true
}
```

---

## 🧭 First Steps After Installation

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Login with Demo Account
- Email: `demo@forensics.com`
- Password: `password123`

### 3. Explore the Dashboard
- View statistics
- Browse cases
- Check evidence

### 4. Test Create Features
- Create a new case
- Register evidence
- Add custody records

---

## 📁 Project Structure Quick Reference

```
src/
├── api/              ← Backend API calls
├── components/       ← Reusable UI components
│   ├── layout/       ← Layout components (Sidebar, Navbar)
│   └── ui/           ← UI components (Badge, Modal, etc.)
├── pages/            ← Full page components (one per route)
├── store/            ← Zustand auth store
├── App.jsx           ← Main app + routing
└── main.jsx          ← Entry point
```

---

## 🎨 Styling with Tailwind

All styling uses Tailwind CSS classes. Examples:

```jsx
// Colors
className="text-primary"      // Navy blue (#1E3A5F)
className="text-accent"       // Bright blue (#2563EB)
className="bg-white"          // White
className="text-green-600"    // Green

// Spacing
className="p-6"               // Padding 1.5rem
className="mb-4"              // Margin-bottom 1rem
className="gap-2"             // Gap 0.5rem

// Responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
```

Tailwind reference: https://tailwindcss.com/docs

---

## 🐛 Common Issues & Solutions

### Issue: Module not found errors
**Solution:**
```bash
rm node_modules package-lock.json
npm install
```

### Issue: API connection errors
**Solution:**
- Check Flask backend is running on port 5000
- Verify `.env` has correct `VITE_API_URL`
- Check browser console for errors

### Issue: Hot reload not working
**Solution:**
```bash
# Kill dev server and restart
npm run dev
```

### Issue: Port 3000 already in use
**Solution:**
```bash
# Change port in vite.config.js or kill process using port 3000
```

---

## 📱 Cross-Browser Testing

The app is built to work on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

Test responsiveness:
1. Open DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Test on different screen sizes

---

## 🔐 Authentication Flow

1. User goes to `/login`
2. Enters email & password
3. Backend returns JWT token
4. Token stored in Zustand store and localStorage
5. Axios adds token to all API requests
6. If 401 response → auto logout & redirect to login

---

## 📝 Making Changes

### Adding a New API Call

Edit `src/api/newModule.js`:
```js
import axiosInstance from './axios'

export const newAPI = {
  getAllItems: async () => {
    const response = await axiosInstance.get('/items')
    return response.data
  },
}
```

### Creating a New Component

Create `src/components/ui/NewComponent.jsx`:
```jsx
export default function NewComponent({ prop1, prop2 }) {
  return <div className="p-4">Component</div>
}
```

### Creating a New Page

Create `src/pages/NewPage.jsx`:
```jsx
import Layout from '../components/layout/Layout'

export default function NewPage() {
  return (
    <Layout>
      <div className="p-6">Page content</div>
    </Layout>
  )
}
```

Then add route in `src/App.jsx`:
```jsx
<Route path="/newpage" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
```

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Creates optimized build in `dist/` folder.

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
1. Push to GitHub
2. Connect to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

### Deploy to Server
```bash
npm run build
# Copy dist/ folder to your server
# Serve with your web server (Nginx, Apache, etc.)
```

---

## 📊 Performance Tips

1. **Lazy Load Routes** (future optimization)
```jsx
const Page = lazy(() => import('./pages/Page'))
```

2. **Memoize Components**
```jsx
export default memo(Component)
```

3. **Use React Developer Tools**
- Check render times
- Identify unnecessary re-renders

4. **Monitor Bundle Size**
```bash
npm run build
# Check dist/ folder size
```

---

## 📚 Useful Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Router**: https://reactrouter.com/
- **React Query**: https://tanstack.com/query/latest
- **Zustand**: https://github.com/pmndrs/zustand
- **React Hook Form**: https://react-hook-form.com/
- **Axios**: https://axios-http.com/
- **Vite**: https://vitejs.dev/

---

## 🚨 Important Files to Know

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app + routes |
| `src/components/layout/Layout.jsx` | Main page layout |
| `src/store/authStore.js` | Auth state |
| `src/api/axios.js` | API interceptors |
| `.env` | Environment config |
| `package.json` | Dependencies |

---

## ❓ Getting Help

1. **Check Documentation**: README.md, API_ENDPOINTS.md
2. **Check Console**: Browser DevTools (F12)
3. **Check Network**: Network tab in DevTools
4. **Check Backend**: Verify Flask backend endpoints

---

## ✨ You're All Set!

Everything is configured and ready to go:
- ✅ Dev server configured
- ✅ Routing set up
- ✅ API integration ready
- ✅ Auth flow implemented
- ✅ Styling ready
- ✅ Components built

**Start developing:** `npm run dev`

---

Happy coding! 🎉


