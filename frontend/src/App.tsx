import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import TaskBoard from "./components/TaskBoard";
import TaskForm from "./components/TaskForm";
import { fetchTasks } from "./store/slices/taskSlice";
import { openModal } from "./store/slices/uiSlice";
import { RootState, AppDispatch } from "./store";
import "./App.css";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.tasks);
  const { isModalOpen } = useSelector((state: RootState) => state.ui);

  // Fetch all tasks from backend on component mount
  useEffect(() => {
    dispatch(fetchTasks({}));
  }, [dispatch]);

  return (
    <div className="App">
      <header className="app-header">
        <h1>Interview Prep Tracker</h1>
        <button className="btn-primary" onClick={() => dispatch(openModal())}>
          + Add Task
        </button>
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {loading && <div className="loading-spinner">Loading tasks...</div>}

      {isModalOpen && <TaskForm />}

      <TaskBoard />
    </div>
  );
}

export default App;
