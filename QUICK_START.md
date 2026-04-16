# 🚀 Interview Prep Tracker - Quick Start Guide

## What's New ✨

Your application now has a **full-stack setup** with Node.js backend and PostgreSQL database!

### Infrastructure
- ✅ **Frontend**: React (Port 3001)
- ✅ **Backend**: Node.js + Express (Port 5000)
- ✅ **Database**: PostgreSQL with Sequelize ORM
- ✅ **API**: RESTful endpoints with CORS enabled

---

## 🔧 Installation & Setup (5 minutes)

### Step 1: Install PostgreSQL

**Windows:**
1. Download: https://www.postgresql.org/download/windows/
2. Run installer (accept defaults)
3. Remember the `postgres` password you set
4. Verify: Open PowerShell → `psql --version`

**Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt-get update && sudo apt-get install postgresql
sudo systemctl start postgresql
```

### Step 2: Create Database

```powershell
psql -U postgres -c "CREATE DATABASE interview_prep_tracker;"
```

### Step 3: Install Backend Dependencies

```powershell
cd c:\Users\h\Documents\Jira-lite\backend
npm install
```

### Step 4: Configure Backend

Edit `backend/.env` and update:
```
DB_PASSWORD=your_postgres_password
```

### Step 5: Start Backend Server

```powershell
cd backend
npm run dev
```

Expected output:
```
✓ Database connection established
✓ Database models synced
✓ Server running on http://localhost:5000
```

### Step 6: Start Frontend (in new terminal)

```powershell
cd frontend
npm start
```

Frontend opens at: http://localhost:3001

---

## 📝 How to Use

1. **Create Task**: Click "+ Add Task" in the header
2. **Add Details**: Fill in title, category, priority, story points
3. **Save**: Task is **automatically saved to PostgreSQL**
4. **Drag**: Move cards between To Do → In Progress → Done
5. **Edit**: Click pencil icon to edit
6. **Delete**: Click X icon to remove

**All changes persist in the database!** 🎉

---

## 🧪 Test Integration

### Test 1: Create via Frontend
1. Click "+ Add Task"
2. Add a task with 5 story points
3. Task should appear on board

### Test 2: Verify in Database
```powershell
psql -U postgres -d interview_prep_tracker -c "SELECT * FROM tasks;"
```

### Test 3: Backend Health Check
```
GET http://localhost:5000/health
```

Response should be:
```json
{ "status": "Server is running" }
```

---

## 📚 API Endpoints

Base URL: `http://localhost:5000/api/tasks`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Get all tasks |
| GET | `/:id` | Get single task |
| POST | `/` | Create task |
| PUT | `/:id` | Update task |
| DELETE | `/:id` | Delete task |
| GET | `/stats` | Get statistics |

### Example: Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "IP-001",
    "title": "Learn Node.js",
    "category": "NodeJS and ExpressJS",
    "priority": "High",
    "status": "To Do",
    "storyPoints": 3
  }'
```

---

## 🐛 Troubleshooting

### ❌ Backend won't start
```powershell
# Make sure PostgreSQL is running
pg_ctl start

# Check if port 5000 is in use
netstat -ano | findstr :5000
```

### ❌ Frontend can't connect to backend
1. Verify backend is running on port 5000
2. Check frontend `.env` has: `REACT_APP_API_BASE_URL=http://localhost:5000/api`
3. Restart frontend: `npm start`

### ❌ Database error
```powershell
# Recreate database
psql -U postgres -c "DROP DATABASE interview_prep_tracker;"
psql -U postgres -c "CREATE DATABASE interview_prep_tracker;"
```

### ❌ Tasks not saving
1. Check browser console for errors
2. Check backend terminal for errors
3. Verify database connection in backend logs

---

## 📂 Project Structure

```
Jira-lite/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── taskAPI.js         (API service)
│   │   ├── components/
│   │   └── App.js                 (Updated with backend)
│   ├── .env                       (API URL config)
│   └── package.json
│
└── backend/
    ├── config/
    │   ├── database.js             (DB config)
    │   └── sequelize.js            (Sequelize init)
    ├── models/
    │   └── Task.js                 (Task model)
    ├── controllers/
    │   └── taskController.js       (CRUD logic)
    ├── routes/
    │   └── tasks.js                (API routes)
    ├── server.js                   (Express server)
    ├── .env                        (DB credentials)
    └── package.json
```

---

## 🎯 Key Features

### Frontend
- ✅ React hooks & state management
- ✅ Drag-and-drop Kanban board
- ✅ Debounced search
- ✅ Category & priority filters
- ✅ Real-time stats calculation

### Backend
- ✅ RESTful API with Express
- ✅ PostgreSQL with Sequelize ORM
- ✅ CRUD operations
- ✅ Query filtering & search
- ✅ Error handling & validation
- ✅ CORS enabled

### Database
- ✅ Task storage with all fields
- ✅ Automatic timestamps
- ✅ Data validation rules
- ✅ Persistent storage

---

## 🚀 Next Steps

1. ✅ Backend running
2. ✅ Frontend connected
3. ✅ Data persisting
4. **Optional Features:**
   - Add user authentication (JWT)
   - Add task comments/notes
   - Add deadlines & reminders
   - Export tasks to CSV
   - Dark mode
   - Mobile app

---

## 💡 Tips

- Keep backend terminal visible to see real-time logs
- Use browser DevTools → Network tab to debug API calls
- Check backend `.env` matches your PostgreSQL setup
- Use `npm run dev` for auto-reload during development
- Tasks are auto-saved when you drag or update

---

## 📞 Support

If you encounter issues:

1. Check the error message in browser console or backend terminal
2. Verify PostgreSQL is running: `pg_ctl status`
3. Check logs file: `backend/server.log`
4. Review complete setup guide: `SETUP_GUIDE.md`

---

## ✅ You're All Set! 🎉

Your Interview Prep Tracker is now **fully functional** with:
- 📱 **React Frontend** with drag-and-drop
- 🖥️ **Node.js Backend** with REST API
- 🗄️ **PostgreSQL Database** for persistence

**Happy tracking! 🚀**
