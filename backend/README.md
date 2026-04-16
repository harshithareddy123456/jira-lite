# Interview Prep Tracker Backend

## Setup Instructions

### 1. Install PostgreSQL

#### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is 5432
5. Verify installation:
   ```powershell
   psql --version
   ```

#### Mac:
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu):
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

After PostgreSQL is installed, create the database:

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE interview_prep_tracker;

# Verify
\l

# Exit
\q
```

Or use this command directly:
```powershell
psql -U postgres -c "CREATE DATABASE interview_prep_tracker;"
```

### 3. Configure Backend

Update `.env` file with your PostgreSQL credentials:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=interview_prep_tracker
DB_USER=postgres
DB_PASSWORD=your_postgres_password
NODE_ENV=development
```

### 4. Install Dependencies

```powershell
cd backend
npm install
```

### 5. Start Backend Server

**Development (with auto-reload):**
```powershell
npm run dev
```

**Production:**
```powershell
npm start
```

Server will start on: http://localhost:5000

### 6. Test Backend

Check server health:
```
GET http://localhost:5000/health
```

Expected response:
```json
{ "status": "Server is running" }
```

## API Endpoints

### Tasks

- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats` - Get task statistics

### Query Parameters

- `category` - Filter by category
- `priority` - Filter by priority (Low, Medium, High)
- `status` - Filter by status (To Do, In Progress, Done)
- `search` - Search by title or description

## Example Requests

### Create Task
```json
POST /api/tasks
{
  "taskId": "IP-001",
  "title": "Learn React Hooks",
  "description": "Deep dive into React Hooks",
  "category": "React Deep Dive",
  "priority": "High",
  "status": "To Do",
  "storyPoints": 3
}
```

### Update Task
```json
PUT /api/tasks/1
{
  "status": "In Progress",
  "storyPoints": 3
}
```

### Get Tasks with Filters
```
GET /api/tasks?category=React%20Deep%20Dive&priority=High&status=To%20Do
```

## Database Schema

### Tasks Table
- `id` (INTEGER, Primary Key)
- `taskId` (STRING, Unique)
- `title` (STRING)
- `description` (TEXT)
- `category` (ENUM)
- `priority` (ENUM: Low, Medium, High)
- `status` (ENUM: To Do, In Progress, Done)
- `storyPoints` (INTEGER)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

## Troubleshooting

**Error: "connect ECONNREFUSED"**
- PostgreSQL is not running. Start it:
  - Windows: Check Services or use `pg_ctl start`
  - Mac: `brew services start postgresql@15`
  - Linux: `sudo systemctl start postgresql`

**Error: "database "interview_prep_tracker" does not exist"**
- Create the database using the commands above

**Error: "password authentication failed"**
- Check the password in `.env` matches your PostgreSQL `postgres` user password

## Next Steps

1. Connect frontend to this backend
2. Update API base URL in frontend `.env`
3. Test CRUD operations
