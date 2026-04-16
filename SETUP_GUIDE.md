# Interview Prep Tracker - Complete Setup Guide

## Project Structure

```
Jira-lite/
├── frontend/          # React frontend (port 3001)
│   ├── src/
│   │   ├── api/       # API service (NEW)
│   │   └── ...
│   ├── .env          # Frontend env (NEW)
│   └── package.json
│
└── backend/          # Node.js backend (port 5000)
    ├── config/       # Database config
    ├── models/       # Sequelize models
    ├── controllers/  # Business logic
    ├── routes/       # API routes
    ├── server.js     # Main server file
    ├── .env          # Backend env
    ├── package.json
    └── README.md     # Backend setup guide
```

## Step 1: Install PostgreSQL

### Windows
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer (use default settings)
3. Set password for `postgres` user (remember this!)
4. Default port: 5432
5. Verify: Open PowerShell and run `psql --version`

### Mac
```bash
brew install postgresql@15
brew services start postgresql@15
psql --version
```

### Linux (Ubuntu)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
psql --version
```

## Step 2: Create Database

```powershell
# Windows/PowerShell
psql -U postgres -c "CREATE DATABASE interview_prep_tracker;"

# Verify
psql -U postgres -l
```

## Step 3: Setup Backend

```powershell
# Navigate to backend folder
cd c:\Users\h\Documents\Jira-lite\backend

# Install dependencies
npm install

# Update .env with your PostgreSQL password
# Edit .env and change:
# DB_PASSWORD=your_postgres_password
```

## Step 4: Setup Frontend

```powershell
# Navigate to frontend folder
cd c:\Users\h\Documents\Jira-lite\frontend

# Install dependencies (if not already done)
npm install

# Frontend .env is already configured
```

## Step 5: Start Backend Server

```powershell
cd backend

# Development mode (with auto-reload)
npm run dev

# OR Production mode
npm start
```

You should see:
```
✓ Database connection established
✓ Database models synced
✓ Server running on http://localhost:5000
```

## Step 6: Start Frontend Server

In a new terminal:

```powershell
cd frontend

# Start in development mode
npm start
```

Frontend will open at: http://localhost:3001

## Step 7: Test Integration

1. **Test Backend Health:**
   ```
   GET http://localhost:5000/health
   ```

2. **Create a Task via Frontend:**
   - Click "+ Add Task"
   - Fill in task details
   - Click "Create Task"
   - Data is now saved in PostgreSQL!

3. **View Data in Database:**
   ```powershell
   psql -U postgres -d interview_prep_tracker -c "SELECT * FROM tasks;"
   ```

## API Endpoints Reference

Base URL: `http://localhost:5000/api`

### Tasks
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/tasks` | Get all tasks (with filters) |
| GET | `/tasks/:id` | Get single task |
| POST | `/tasks` | Create new task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| GET | `/tasks/stats` | Get statistics |

### Query Parameters
```
GET /tasks?category=React%20Deep%20Dive&priority=High&status=To%20Do&search=hooks
```

## Troubleshooting

### ❌ "Port 5000 already in use"
```powershell
# Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### ❌ "connect ECONNREFUSED"
PostgreSQL is not running:
```powershell
# Start PostgreSQL
pg_ctl start

# Or check if service is running
Get-Service postgresql*
```

### ❌ "database does not exist"
Create it:
```powershell
psql -U postgres -c "CREATE DATABASE interview_prep_tracker;"
```

### ❌ "password authentication failed"
1. Check password in backend `.env` matches PostgreSQL
2. Reset PostgreSQL password:
   ```powershell
   psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'new_password';"
   ```

### ❌ Frontend can't connect to backend
1. Verify backend is running on port 5000
2. Check `frontend/.env` has correct API URL
3. Restart frontend: stop and `npm start` again

## Environment Variables

### Backend (.env)
```
PORT=5000                                 # Backend port
DB_HOST=localhost                         # Database host
DB_PORT=5432                              # Database port
DB_NAME=interview_prep_tracker            # Database name
DB_USER=postgres                          # Database user
DB_PASSWORD=postgres                      # Database password (UPDATE THIS)
NODE_ENV=development                      # Environment
```

### Frontend (.env)
```
REACT_APP_API_BASE_URL=http://localhost:5000/api  # Backend API URL
```

## Features Implemented

✅ **Frontend (React)**
- Drag-and-drop Kanban board
- Debounced search
- Category & priority filtering
- Task CRUD operations
- Story points calculator
- Responsive design

✅ **Backend (Node.js + Express)**
- RESTful API endpoints
- PostgreSQL database with Sequelize ORM
- Task filtering & search
- Statistics calculation
- Error handling
- CORS enabled

## Next Steps

1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 3001
3. ✅ Data persisting to PostgreSQL
4. **Optional:** Add user authentication
5. **Optional:** Deploy to production
6. **Optional:** Add more features (deadlines, comments, etc.)

## Quick Commands

```powershell
# Start PostgreSQL
pg_ctl start

# Stop PostgreSQL
pg_ctl stop

# Connect to database
psql -U postgres -d interview_prep_tracker

# Check tables
\dt

# Exit psql
\q

# Backend dev server with auto-reload
cd backend && npm run dev

# Frontend dev server
cd frontend && npm start

# View backend logs
# (already showing in terminal where npm run dev is running)
```

## Database Schema

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  task_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM(...) DEFAULT 'Coding Patterns',
  priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  status ENUM('To Do', 'In Progress', 'Done') DEFAULT 'To Do',
  story_points INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Success! 🎉

Your Interview Prep Tracker is now fully functional with:
- **Frontend:** React with drag-and-drop
- **Backend:** Node.js + Express API
- **Database:** PostgreSQL with Sequelize ORM

Start building! 🚀
