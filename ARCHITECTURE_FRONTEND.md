# Frontend Architecture Decision Document

**Project**: Interview Prep Tracker  
**Last Updated**: April 15, 2026  
**Status**: In Production

---

## 1. Overview

The frontend is a React-based single-page application (SPA) built with Redux Toolkit for state management and featuring a Kanban-style task board interface. It provides an intuitive UI for managing interview preparation tasks with real-time synchronization with the backend.

### Key Technology Stack
- **Framework**: React 19.2.5
- **State Management**: Redux Toolkit 2.11.2
- **UI Patterns**: Component-based architecture
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Testing**: React Testing Library 16.3.2

---

## 2. Architecture Decisions

### 2.1 React + Redux Toolkit Architecture

**Decision**: Use React with Redux Toolkit for state management

**Rationale**:
- **Predictable State**: Redux provides single source of truth
- **DevTools**: Redux DevTools for time-travel debugging
- **Scalability**: Handles complex state as app grows
- **Redux Toolkit**: Reduces boilerplate while maintaining Redux principles
- **Team Familiarity**: Industry standard for React apps

**Architecture Diagram**:
```
┌──────────────────────────────────────────────────────┐
│                React Components                      │
│  (TaskBoard, TaskCard, TaskForm, App)                │
└──────────────────┬───────────────────────────────────┘
                   │ useSelector/useDispatch
                   ▼
┌──────────────────────────────────────────────────────┐
│              Redux Store                             │
│  ┌──────────────────┐    ┌──────────────────┐       │
│  │  tasks slice     │    │  ui slice        │       │
│  │  - items         │    │  - isModalOpen   │       │
│  │  - loading       │    │  - editingTask   │       │
│  │  - error         │    │  - filters       │       │
│  │  - stats         │    └──────────────────┘       │
│  └──────────────────┘                               │
└──────────────────┬───────────────────────────────────┘
                   │ async thunks
                   ▼
┌──────────────────────────────────────────────────────┐
│              API Layer (taskAPI)                     │
│  - getAllTasks()                                     │
│  - createTask()                                      │
│  - updateTask()                                      │
│  - deleteTask()                                      │
└──────────────────┬───────────────────────────────────┘
                   │ fetch
                   ▼
            Backend API (Port 5000)
```

**Implementation**:
```javascript
// Store configuration (src/store/index.js)
const store = configureStore({
  reducer: {
    tasks: taskReducer,
    ui: uiReducer
  }
});

// Async thunks for async operations
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (filters = {}, { rejectWithValue }) => {
    // Handles loading/success/error states automatically
  }
);
```

**Trade-offs**:
- ✅ Centralized state management
- ✅ Easy to debug with DevTools
- ✅ Predictable data flow
- ⚠️ Boilerplate code (mitigated by Redux Toolkit)
- ⚠️ Learning curve for new developers

---

### 2.2 Component Structure

**Decision**: Organize UI into presentational and container components

**Rationale**:
- **Separation of Concerns**: Logic separated from presentation
- **Reusability**: Presentational components can be reused easily
- **Testability**: Pure components are easier to test
- **Maintainability**: Clear responsibilities

**Component Hierarchy**:
```
App (Container)
├── TaskBoard (Container)
│   ├── Column (Presentational)
│   │   └── TaskCard[] (Presentational)
├── TaskForm (Container)
└── Header (Presentational)
```

**File Organization**:
```
src/
├── components/
│   ├── TaskBoard.js         # Container - manages board state
│   ├── TaskBoard.css
│   ├── TaskCard.js          # Presentational - displays single task
│   ├── TaskCard.css
│   ├── TaskForm.js          # Container - form with validation
│   ├── TaskForm.css
│   └── TaskHeader.js        # Presentational - header UI
├── store/
│   ├── index.js             # Store configuration
│   └── slices/
│       ├── taskSlice.js     # Tasks state + thunks
│       └── uiSlice.js       # UI state (modals, filters)
├── api/
│   └── taskAPI.js           # API service layer
├── App.js                   # Root component
└── index.js                 # React DOM rendering
```

**Trade-offs**:
- ✅ Clear component roles
- ✅ Better code organization
- ⚠️ More files to manage
- ⚠️ Can feel over-engineered for small apps

---

### 2.3 State Management: Tasks vs UI State

**Decision**: Split Redux store into `tasks` (data) and `ui` (UI state) slices

**Rationale**:
- **Separation**: Data state separate from presentation state
- **Reusability**: UI state doesn't affect data logic
- **Scalability**: Easy to add new slices as app grows
- **Clarity**: Clear what state is persisted vs ephemeral

**Task Slice** (Data State):
```javascript
{
  tasks: {
    items: [],           // Array of task objects from backend
    stats: null,         // Aggregated statistics
    loading: false,      // Loading state for API calls
    error: null,         // Error messages
    taskCounter: 1       // Client-side task numbering
  }
}
```

**UI Slice** (Presentation State):
```javascript
{
  ui: {
    isModalOpen: false,    // Modal dialog visibility
    editingTask: null,     // Currently editing task (if any)
    selectedFilters: [],   // Active filter selections
    sortBy: 'createdAt'    // Current sort column
  }
}
```

**Alternative Considered**: Single flat state
- Rejected: Mixes concerns, harder to trace what state affects UI vs data

**Trade-offs**:
- ✅ Clear separation of concerns
- ✅ Easier to find and modify specific state
- ⚠️ More slices to manage
- ⚠️ May be overkill for very simple apps

---

### 2.4 Async Data Fetching with Thunks

**Decision**: Use Redux Toolkit's `createAsyncThunk` for API calls

**Rationale**:
- **Built-in Lifecycle**: Automatically creates pending/fulfilled/rejected actions
- **Error Handling**: Consistent error state management
- **Loading States**: UI can show spinners while loading
- **Caching**: Redux store acts as cache for data

**Implementation**:
```javascript
// Define async thunk
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',  // Action name
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getAllTasks(filters);
      if (response.success) {
        return response.data;  // Payload on success
      }
      return rejectWithValue(response.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Handle in reducer
.addCase(fetchTasks.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(fetchTasks.fulfilled, (state, action) => {
  state.loading = false;
  state.items = action.payload;
})
.addCase(fetchTasks.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})
```

**Component Usage**:
```javascript
function App() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(state => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());  // Trigger thunk
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <TaskBoard tasks={items} />;
}
```

**Trade-offs**:
- ✅ Centralized API logic
- ✅ Consistent error/loading state
- ✅ Reusable across components
- ⚠️ Some initial complexity
- ⚠️ Debugging async flows takes practice

---

### 2.5 API Service Layer

**Decision**: Create abstraction layer (`taskAPI.js`) for backend communication

**Rationale**:
- **Centralized**: All API calls in one place
- **Maintainable**: Easy to update API endpoints
- **Mockable**: Can mock API for testing
- **Consistent**: Standardized error handling
- **Flexibility**: Can add retry logic, caching later

**Implementation**:
```javascript
const API_BASE_URL = 
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const taskAPI = {
  getAllTasks: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.priority) params.append('priority', filters.priority);
    
    const response = await fetch(
      `${API_BASE_URL}/tasks?${params}`
    );
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  },

  createTask: async (taskData) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) throw new Error('Failed to create');
    return response.json();
  },

  updateTask: async (id, taskData) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) throw new Error('Failed to update');
    return response.json();
  },

  deleteTask: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete');
    return response.json();
  }
};
```

**Environment Configuration**:
```
# .env
REACT_APP_API_BASE_URL=http://localhost:5000/api

# .env.production
REACT_APP_API_BASE_URL=https://api.production.com/api
```

**Trade-offs**:
- ✅ Single source of truth for API endpoints
- ✅ Easy to swap backends
- ✅ Testable in isolation
- ⚠️ One more abstraction layer
- ⚠️ Fetch errors need specific handling

---

### 2.6 Modal and Form Management

**Decision**: Use Redux `ui` slice to manage modal visibility and edit state

**Rationale**:
- **Global Access**: Modal can be toggled from any component
- **Edit State**: Tracks which task is being edited
- **Consistency**: Single source for UI state
- **Debugging**: Easy to inspect in Redux DevTools

**Implementation**:
```javascript
// UI Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isModalOpen: false,
    editingTask: null
  },
  reducers: {
    openModal: (state) => {
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
    },
    setEditingTask: (state, action) => {
      state.editingTask = action.payload;
    },
    clearEditingTask: (state) => {
      state.editingTask = null;
    }
  }
});

// Usage in component
const { isModalOpen, editingTask } = useSelector(state => state.ui);
const dispatch = useDispatch();

const handleEdit = (task) => {
  dispatch(setEditingTask(task));
  dispatch(openModal());
};
```

**Trade-offs**:
- ✅ Easy to manage complex UI state
- ✅ Persists during component unmount
- ⚠️ Redux DevTools shows UI state changes (may be verbose)

---

### 2.7 Optimistic Updates (Future)

**Current State**: Updates wait for backend response

**Recommended Enhancement**: Implement optimistic updates
```javascript
// Update UI immediately, revert if server error
const handleUpdateStatus = (id, newStatus) => {
  // 1. Update Redux immediately
  dispatch(optimisticUpdate({ id, status: newStatus }));
  
  // 2. Call backend
  updateTask(id, { status: newStatus })
    .then(response => {
      // Success - no action needed
    })
    .catch(error => {
      // Revert on failure
      dispatch(revertUpdate(id));
    });
};
```

---

### 2.8 Component Lifecycle: Fetch Tasks on Mount

**Decision**: Fetch all tasks when App component mounts

```javascript
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTasks());  // Fetch on mount
  }, [dispatch]);

  // Rest of component...
}
```

**Rationale**:
- Ensures data loads when app starts
- Single request, not per-route
- Cache in Redux prevents re-fetching on navigation

**Alternative Considered**: Route-based data fetching
- Not implemented: Single page app with no routing

**Future Enhancement**: React Router integration
```javascript
// When using React Router
useEffect(() => {
  dispatch(fetchTasks(filters));
}, [dispatch, filters, location.search]);
```

**Trade-offs**:
- ✅ Automatic data loading
- ✅ Simple implementation
- ⚠️ Loads all tasks upfront (consider pagination)

---

### 2.9 Props vs Redux: When to Use Each

**Decision**: Clear guidelines on props vs Redux state

**Use Redux When**:
- ❌ Data needed by multiple components
- ❌ Data persists across navigation
- ❌ Data accessed frequently (caching benefit)
- ❌ UI state (modals, filters)

**Use Props When**:
- ✅ Data only used by one component
- ✅ Component-specific local state
- ✅ Temporary UI state (hover, focus, local input)
- ✅ Derived/computed data

**Example**:
```javascript
// Redux: Global task data
const tasks = useSelector(state => state.tasks.items);

// Props: Component-specific data
<TaskCard 
  task={task}                          // Task data from Redux
  isHovered={isHovered}                // Local state (props)
  onHover={setIsHovered}              // Local handler (props)
/>

// Local state: Form input
const [title, setTitle] = useState('');  // Component state
```

**Trade-offs**:
- ✅ Keeps Redux focused on important state
- ✅ Reduces performance overhead
- ⚠️ Developers must understand when to use which
- ⚠️ State can end up in wrong place

---

## 3. Component Architecture Details

### TaskBoard Component
Manages the Kanban board layout and column state.

```javascript
// src/components/TaskBoard.js
export default function TaskBoard({ tasks = [] }) {
  const [draggedTask, setDraggedTask] = useState(null);

  // Group tasks by status
  const columnGroups = {
    'To Do': tasks.filter(t => t.status === 'To Do'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Done': tasks.filter(t => t.status === 'Done')
  };

  return (
    <div className="board">
      {['To Do', 'In Progress', 'Done'].map(status => (
        <Column 
          key={status}
          status={status}
          tasks={columnGroups[status]}
        />
      ))}
    </div>
  );
}
```

### TaskCard Component
Presentational component for individual task cards.

```javascript
// src/components/TaskCard.js
export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="task-card">
      <div className="task-header">
        <span className="task-id">{task.taskId}</span>
        <h3>{task.title}</h3>
      </div>
      <div className="task-meta">
        <span className={`priority ${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
        <span className="story-points">{task.storyPoints}pts</span>
      </div>
      <div className="task-actions">
        <button onClick={() => onEdit(task)}>Edit</button>
        <button onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </div>
  );
}
```

### TaskForm Component
Container component for task creation/editing.

```javascript
// src/components/TaskForm.js
export default function TaskForm() {
  const dispatch = useDispatch();
  const { editingTask } = useSelector(state => state.ui);
  
  const [formData, setFormData] = useState(
    editingTask || { title: '', category: '', priority: 'Medium' }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingTask) {
      await dispatch(updateTask({ id: editingTask.id, data: formData }));
    } else {
      await dispatch(createTask(formData));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      {/* More form fields */}
    </form>
  );
}
```

---

## 4. Performance Optimization

### 4.1 Code Splitting
```javascript
const TaskBoard = lazy(() => import('./components/TaskBoard'));
const TaskForm = lazy(() => import('./components/TaskForm'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TaskBoard />
    </Suspense>
  );
}
```

### 4.2 Memoization
```javascript
// Prevent re-renders of TaskCard when parent re-renders
export default memo(TaskCard, (prev, next) => {
  return prev.task.id === next.task.id &&
         prev.task.status === next.task.status;
});
```

### 4.3 Selector Memoization
```javascript
// Create memoized selector to prevent unnecessary re-renders
export const selectTodoTasks = state => 
  state.tasks.items.filter(t => t.status === 'To Do');

// Usage
const todoTasks = useSelector(selectTodoTasks);
```

### 4.4 Virtual Scrolling (Future)
For large task lists (1000+ tasks):
```bash
npm install react-window
```

```javascript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={tasks.length}
  itemSize={100}
>
  {({ index, style }) => (
    <div style={style}>
      <TaskCard task={tasks[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## 5. Testing Strategy

### Unit Tests (Component)
```javascript
import { render, screen } from '@testing-library/react';
import TaskCard from './TaskCard';

describe('TaskCard', () => {
  test('renders task title', () => {
    const task = { id: 1, title: 'Test Task', taskId: 'IP-001' };
    render(<TaskCard task={task} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

### Integration Tests (Redux + Components)
```javascript
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';

test('app displays loaded tasks', async () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  
  await waitFor(() => {
    expect(screen.getByText(/Interview Prep Tracker/i)).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright/Cypress)
```javascript
// cypress/e2e/task-management.cy.js
describe('Task Management', () => {
  it('should create a new task', () => {
    cy.visit('http://localhost:3001');
    cy.contains('Add Task').click();
    cy.get('input[name="title"]').type('Learn React');
    cy.contains('Save').click();
    cy.contains('Learn React').should('be.visible');
  });
});
```

---

## 6. Styling Architecture

### CSS Strategy
- **Component-scoped CSS**: Each component has accompanying `.css` file
- **BEM Naming**: Block Element Modifier pattern
- **Mobile-first**: Start with mobile, scale up

**Example** (`TaskCard.css`):
```css
.task-card {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 12px;
  margin-bottom: 8px;
  cursor: grab;
  transition: box-shadow 0.2s;
}

.task-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.task-card__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.task-card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}
```

### Future Enhancement: CSS-in-JS
```bash
npm install styled-components
```

```javascript
import styled from 'styled-components';

const StyledTaskCard = styled.div`
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;
```

---

## 7. Build and Deployment

### Development
```bash
npm start          # Start dev server (port 3001)
npm test           # Run tests
npm run eject      # Expose webpack config (irreversible!)
```

### Production Build
```bash
npm run build      # Create optimized bundle
```

Output structure:
```
build/
├── static/
│   ├── js/        # Code-split chunks
│   ├── css/       # Minified styles
│   └── media/     # Optimized images
├── index.html     # Single entry point
└── manifest.json
```

### Deployment Options

**Option 1: Static Hosting (Recommended)**
- AWS S3 + CloudFront
- Vercel
- Netlify
- GitHub Pages

**Option 2: Node Server**
```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(3000);
```

---

## 8. Security Considerations

### 8.1 Input Validation
- ✅ Client-side validation in TaskForm
- ⚠️ Server-side validation (backend responsibility)
- ⚠️ Would implement: XSS prevention for user-generated content

### 8.2 HTTPS/SSL
- ✅ Ensure API calls use HTTPS in production
- Environment config:
  ```env
  REACT_APP_API_BASE_URL=https://api.example.com/api
  ```

### 8.3 API Key Management
- ⚠️ If needed, use environment variables:
  ```env
  REACT_APP_API_KEY=secret_key_here
  ```
- ⚠️ Never commit API keys to repository

### 8.4 Dependencies
```bash
npm audit              # Check for vulnerabilities
npm update             # Update packages safely
npm install npm-check-updates  # Check for updates
```

---

## 9. Browser Support

**Create React App default support**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Polyfills for older browsers**:
```bash
npm install @babel/polyfill
```

---

## 10. Accessibility (A11y)

### WCAG 2.1 AA Compliance
```javascript
// Semantic HTML
<button onClick={handleClick} aria-label="Add new task">
  + Add Task
</button>

// ARIA attributes
<div role="status" aria-live="polite" aria-atomic="true">
  {successMessage}
</div>

// Keyboard navigation
<div onKeyDown={(e) => {
  if (e.key === 'Escape') handleClose();
}}>
  {/* Content */}
</div>
```

---

## 11. Future Improvements

### Short Term (Next Sprint)
- [ ] Add error boundary component
- [ ] Implement loading skeletons
- [ ] Add form validation with feedback
- [ ] Unit tests for reducers
- [ ] Add task filtering UI

### Medium Term (1-2 Months)
- [ ] Implement pagination
- [ ] Add sorting options
- [ ] Task search functionality
- [ ] Drag-and-drop improvements
- [ ] Data export feature

### Long Term (Quarter+)
- [ ] Real-time updates (WebSockets)
- [ ] Offline support (Service Workers)
- [ ] PWA capabilities
- [ ] Multi-user collaboration
- [ ] Analytics tracking
- [ ] Dark mode support

---

## 12. Architecture Patterns Summary

| Pattern | Used? | Location | Rationale |
|---------|-------|----------|-----------|
| Container/Presentational | ✅ Yes | App, TaskBoard, TaskForm | Separation of concerns |
| Redux | ✅ Yes | store/slices/ | Global state management |
| Thunks | ✅ Yes | taskSlice.js | Async operations |
| API Service Layer | ✅ Yes | api/taskAPI.js | Centralized API calls |
| Higher-Order Components | ⚠️ No | - | Hooks preferred |
| Render Props | ⚠️ No | - | Hooks preferred |
| Context API | ⚠️ No | - | Redux used instead |
| Local State (useState) | ✅ Yes | Components | UI state |

---

## 13. Debugging Tips

### Redux DevTools
```javascript
// Inspect all state changes
1. Install Redux DevTools browser extension
2. Time-travel debug actions
3. Export/import state snapshots
4. Monitor performance
```

### Chrome DevTools
```
1. Elements: Inspect component structure
2. Network: Monitor API calls
3. Console: Check errors and warnings
4. Performance: Profile render performance
5. Application: View local storage/session storage
```

### React DevTools
```
1. Components: View component hierarchy
2. Profiler: Identify slow components
3. See which props are causing re-renders
```

---

## 14. Conclusion

The frontend architecture prioritizes **scalability**, **maintainability**, and **developer experience** through proven React patterns and Redux state management. The separation of concerns between components, state management, and API layer ensures the codebase remains organized as features are added.

**Key Strengths**:
- Clear component structure
- Centralized state management
- API abstraction layer
- Business logic separated from UI
- Easy to test and debug

**Key Risks to Mitigate**:
- Redux can feel like overkill for learning projects
- Performance considerations with large task lists
- Need for proper error boundaries
- Accessibility compliance

**Next Steps**:
1. Add error boundary for crash handling
2. Implement loading states with skeletons
3. Add form validation feedback
4. Write comprehensive unit tests
5. Monitor bundle size

---

**Document Version**: 1.0  
**Next Review Date**: Q2 2026
