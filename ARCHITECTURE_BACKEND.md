# Backend Architecture Decision Document

**Project**: Interview Prep Tracker  
**Last Updated**: April 15, 2026  
**Status**: In Production

---

## 1. Overview

The backend is a RESTful API service built with Node.js and Express, providing data persistence and business logic for the Interview Prep Tracker application. It follows the MVC (Model-View-Controller) pattern with clear separation of concerns.

### Key Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL
- **ORM**: Sequelize 6.35.2
- **Middleware**: CORS, body-parser, dotenv

---

## 2. Architecture Decisions

### 2.1 MVC Pattern Architecture

**Decision**: Implement Model-View-Controller pattern

**Rationale**:
- Provides clear separation of concerns
- Makes code maintainable and testable
- Scales well as the application grows
- Industry-standard pattern for backend services

**Implementation**:
```
backend/
├── models/          # Data models (Sequelize ORM)
├── controllers/     # Business logic and request handling
├── routes/          # HTTP endpoint definitions
├── config/          # Configuration files
└── middleware/      # Custom middleware (future)
```

**Trade-offs**:
- ✅ Better code organization
- ✅ Easier to test individual components
- ✅ Clear responsibilities
- ⚠️ More boilerplate code initially

---

### 2.2 ORM: Sequelize vs Raw SQL

**Decision**: Use Sequelize ORM for database interactions

**Rationale**:
- **Type Safety**: Enforced schemas prevent invalid data
- **Migration Support**: Database versioning and rollback capabilities
- **Query Builder**: Type-safe query construction
- **Validation**: Built-in model validation
- **Consistency**: Automatic timestamps and data formatting

**Configuration**:
```javascript
// Model definition with validations
const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  taskId: { type: DataTypes.STRING, unique: true, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  category: { type: DataTypes.ENUM(...), defaultValue: 'Coding Patterns' },
  priority: { type: DataTypes.ENUM('Low', 'Medium', 'High') },
  status: { type: DataTypes.ENUM('To Do', 'In Progress', 'Done') },
  storyPoints: { type: DataTypes.INTEGER, min: 1, max: 100 }
});
```

**Alternative Considered**: Raw SQL queries
- Rejected: Less safe, harder to maintain, no automatic migration support

**Trade-offs**:
- ✅ Abstraction over SQL dialect differences
- ✅ Automatic schema validation
- ⚠️ Performance overhead for simple queries
- ⚠️ Learning curve for complex queries

---

### 2.3 Database: PostgreSQL

**Decision**: Use PostgreSQL as the primary database

**Rationale**:
- **ACID Compliance**: Transactions ensure data integrity
- **ENUM Types**: Native support for status/priority enums
- **JSON Support**: Future extensibility for complex data
- **Reliability**: Production-grade open-source database
- **Scalability**: Handles millions of records efficiently

**Data Model**:
- **Primary Key**: Auto-incrementing integer (internal)
- **Business Key**: `taskId` (unique, human-readable: "IP-001", "IP-002")
- **Timestamps**: Automatic `createdAt` and `updatedAt`
- **Enumerations**: Fixed-value columns with ENUM constraints

**Configuration**:
```javascript
// Database config supports multiple environments
development: {
  dialect: "postgres",
  logging: console.log,  // SQL query logging for debugging
  define: {
    timestamps: true,
    underscored: true    // Convert camelCase to snake_case
  }
},
production: {
  dialect: "postgres",
  logging: false,        // Disable verbose logging
  define: { timestamps: true }
}
```

**Trade-offs**:
- ✅ ACID guarantees for data consistency
- ✅ Mature ecosystem and tooling
- ✅ Lower resource requirements than MongoDB
- ⚠️ Requires database setup
- ⚠️ Scaling writes requires careful partitioning strategy

---

### 2.4 RESTful API Design

**Decision**: Implement RESTful API with standard HTTP methods

**Rationale**:
- **Industry Standard**: Familiar to frontend developers
- **Stateless**: Each request contains all needed information
- **Cacheable**: HTTP caching mechanisms can improve performance
- **Scalable**: Easy to distribute across multiple servers

**API Endpoints**:
```
GET    /api/tasks              # Fetch all tasks (with optional filters)
GET    /api/tasks/:id          # Fetch single task
GET    /api/tasks/stats        # Fetch aggregate statistics
POST   /api/tasks              # Create new task
PUT    /api/tasks/:id          # Update task
DELETE /api/tasks/:id          # Delete task
GET    /health                 # Health check
```

**Request/Response Pattern**:
```javascript
// Success Response
{
  success: true,
  data: {...},
  count: 1
}

// Error Response
{
  success: false,
  message: "Human-readable error message",
  error: "Error details (development only)"
}
```

**Filtering Support**:
- Query Parameters: `?category=JavaScript&priority=High&status=To%20Do`
- Search: `?search=keyword` (searches title and description)

**Trade-offs**:
- ✅ Simple and predictable
- ✅ Works well with standard HTTP tools
- ⚠️ Chattier protocol (multiple requests for related data)
- ⚠️ Over-fetching/under-fetching (consider GraphQL for future)

---

### 2.5 Error Handling Strategy

**Decision**: Implement centralized error handling with consistent response format

**Implementation**:
```javascript
// Global error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" 
      ? err.message 
      : undefined  // Hide errors in production
  });
});

// Per-endpoint error handling
try {
  const tasks = await Task.findAll();
  res.json({ success: true, data: tasks });
} catch (error) {
  res.status(500).json({
    success: false,
    message: "Error fetching tasks",
    error: error.message
  });
}
```

**HTTP Status Codes**:
- `200 OK`: Successful GET/PUT/DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Invalid input data
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server-side failure

**Trade-offs**:
- ✅ Consistent error format for frontend
- ✅ Environment-aware error disclosure
- ⚠️ Logs needed for production debugging

---

### 2.6 Middleware and CORS

**Decision**: Enable CORS with Express middleware

**Configuration**:
```javascript
app.use(cors());                              // Allow all origins (development)
app.use(bodyParser.json());                   // Parse JSON bodies
app.use(bodyParser.urlencoded({ 
  extended: true                              // Support nested objects
}));
```

**Production Considerations**:
```javascript
// Should be updated for production:
app.use(cors({
  origin: process.env.FRONTEND_URL,          // Whitelist specific domains
  credentials: true                           // Allow cookies
}));
```

**Trade-offs**:
- ✅ Allows frontend to communicate across origins
- ⚠️ Security risk if not properly restricted in production

---

### 2.7 Environment Configuration

**Decision**: Use `.env` file with `dotenv` for configuration management

**Variables**:
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=interview_prep_tracker
DB_USER=postgres
DB_PASSWORD=your_password
```

**Rationale**:
- Separates secrets from code
- Different configurations per environment
- Single source of truth for settings
- Never commit `.env` to version control

**Trade-offs**:
- ✅ Security best practice
- ✅ Easy to manage across environments
- ⚠️ Requires manual setup on each server
- ⚠️ Consider secrets management tools (AWS Secrets Manager, HashiCorp Vault) for production

---

### 2.8 Database Sync Strategy

**Decision**: Auto-sync Sequelize models on server startup with `alter: true`

```javascript
await sequelize.sync({ alter: true });
```

**Rationale**:
- Automatically creates/updates tables on model changes
- No manual migration needed during development
- Ensures database schema stays in sync with code

**Production Warning** ⚠️:
- `alter: true` can cause data loss in production
- Should use explicit migrations instead:
  ```bash
  sequelize-cli db:migrate
  sequelize-cli db:migrate:undo
  ```

**Trade-offs**:
- ✅ Fast development iteration
- ✅ Less boilerplate for MVP
- ⚠️ Risky for production data
- ⚠️ Should implement migrations as app grows

---

### 2.9 Graceful Shutdown

**Decision**: Handle SIGINT signal for clean process termination

```javascript
process.on("SIGINT", async () => {
  console.log("\n✓ Shutting down gracefully...");
  await sequelize.close();
  process.exit(0);
});
```

**Benefits**:
- Closes database connections properly
- Prevents connection leaks
- Allows clean restart
- Prevents corrupted data

---

## 3. Performance Considerations

### Database Indexing
- Primary Key (`id`) is auto-indexed
- `taskId` has unique constraint (implicit index)
- Consider future indexes on:
  - `status` (for filtering tasks by status)
  - `category` (for filtering by category)
  - `priority` (for sorting by priority)

```sql
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

### Query Optimization
- Current implementation loads all tasks into memory
- Future optimization: Implement pagination for large datasets
  ```javascript
  const { limit = 10, offset = 0 } = req.query;
  const tasks = await Task.findAll({ 
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });
  ```

### Connection Pooling
- Sequelize maintains default connection pool
- Configuration for production:
  ```javascript
  pool: {
    max: 5,           // Max connections
    min: 0,           // Min connections
    idle: 10000       // Close after 10s idle
  }
  ```

---

## 4. Security Considerations

### Input Validation
- ✅ Implemented: Model-level ENUM validation
- ✅ Implemented: Required field checks
- ⚠️ TODO: Add input sanitization library (e.g., `express-validator`)

### SQL Injection
- ✅ Safe: Sequelize uses parameterized queries
- ✅ Safe: No raw SQL queries in current code

### Authentication
- ⚠️ TODO: Add JWT authentication
- ⚠️ TODO: Implement role-based access control (RBAC)

### CORS
- ⚠️ TODO: Restrict in production to specific origin
- ⚠️ TODO: Add CSRF protection if supporting cookies

### Password Security
- ⚠️ TODO: Never commit `.env` with real passwords
- ⚠️ TODO: Use environment-specific secrets in production

---

## 5. Scalability Strategy

### Current State (Single Instance)
- Works well for small teams
- All data in single PostgreSQL instance
- No distributed caching

### Future Scaling Options

**Phase 1: Caching Layer**
```javascript
// Add Redis for session/query caching
const redis = require('redis');
const client = redis.createClient();

// Cache task list
const cacheKey = `tasks:${JSON.stringify(filters)}`;
```

**Phase 2: Horizontal Scaling**
- Deploy multiple instances behind load balancer
- Use RDS for managed PostgreSQL
- Implement session store (Redis or ElastiCache)

**Phase 3: Microservices**
- Separate services for different domains
- API Gateway for routing
- Message queue (RabbitMQ/SQS) for async operations

---

## 6. Monitoring and Observability

### Current Logging
- Console logs for development
- SQL query logging in development mode

### Production Recommendations
```javascript
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Metrics to Track
- API response times
- Error rates and types
- Database query performance
- Active connections
- Memory and CPU usage

---

## 7. Testing Strategy

### Unit Tests
```bash
npm install --save-dev jest supertest
```

Example test:
```javascript
describe('Task Controller', () => {
  test('should create task with valid data', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        taskId: 'IP-999',
        title: 'Test Task',
        storyPoints: 5
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
```

### Integration Tests
- Test API endpoints with real/test database
- Test CORS, error handling, edge cases

### E2E Tests
- Test complete user workflows
- Data persists correctly
- API integrates properly with database

---

## 8. Deployment Architecture

### Production Environment
```
┌─────────────────────────────────────────────┐
│      Load Balancer (AWS ALB)                │
│         Port 443 (HTTPS)                    │
└────────────────────┬────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    │ Node-1 │  │ Node-2 │  │ Node-3 │
    │ Port 5000  │ Port 5000  │ Port 5000
    └────────────┼────────────┘
        ┌────────┴────────┐
        ▼                 ▼
   ┌──────────────────────────────────┐
   │   PostgreSQL (AWS RDS)           │
   │   Multi-AZ, Automated Backups    │
   └──────────────────────────────────┘
```

### CI/CD Pipeline
```yaml
stages:
  - test         # Run unit/integration tests
  - build        # Create Docker image
  - deploy       # Push to production
```

---

## 9. Future Improvements

### Short Term (Next Sprint)
- [ ] Add input validation middleware
- [ ] Implement database migrations
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Unit tests for controllers

### Medium Term (1-2 Months)
- [ ] Authentication (JWT)
- [ ] Rate limiting
- [ ] Caching layer (Redis)
- [ ] Comprehensive logging (Winston)

### Long Term (Quarter+)
- [ ] GraphQL API alternative
- [ ] Real-time updates (WebSockets)
- [ ] Audit logging
- [ ] Analytics events
- [ ] Multi-tenant support

---

## 10. Conclusion

The backend architecture prioritizes **simplicity**, **maintainability**, and **rapid development** while maintaining good separation of concerns. The MVC pattern with Sequelize ORM provides a solid foundation for scaling as the application grows.

**Key Strengths**:
- Clear, organized code structure
- Safe database interactions with ORM
- Flexible filtering system
- Consistent error handling

**Key Risks to Mitigate**:
- Add authentication before public deployment
- Implement proper logging for production
- Use explicit migrations instead of auto-sync
- Restrict CORS to specific domains

---

**Document Version**: 1.0  
**Next Review Date**: Q2 2026
