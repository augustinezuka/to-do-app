// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LogOut,
  LogIn,
  User,
  Plus,
  Trash2,
  LayoutGrid,
  List,
  Edit2,
  X,
  Check,
  Moon,
  Sun,
  Users,
  UserPlus,
  GripVertical,
  CheckSquare,
  Zap,
  Clock,
  ArrowRight,
} from "lucide-react";

const createAuthToken = (username, userId) => {
  return btoa(
    JSON.stringify({
      sub: userId,
      username,
      email: `${username}@example.com`,
      exp: Date.now() + 3600000,
      iat: Date.now(),
    }),
  );
};

const hashPassword = (password) => {
  return btoa(password + "salt123");
};

const STORAGE_KEYS = {
  USERS: "kanban_users",
  SESSIONS: "kanban_sessions",
  BOARDS: "kanban_boards",
  SYNC: "kanban_sync",
  THEME: "kanban_theme",
};

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem(STORAGE_KEYS.SYNC, Date.now().toString());
  localStorage.removeItem(STORAGE_KEYS.SYNC);
  localStorage.setItem(STORAGE_KEYS.SYNC, Date.now().toString());
};

const loadFromStorage = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
};

const registerUser = (username, email, password) => {
  const users = loadFromStorage(STORAGE_KEYS.USERS, {});

  if (users[username]) {
    throw new Error("Username already exists");
  }

  const userId = `user-${Date.now()}`;
  users[username] = {
    id: userId,
    username,
    email,
    password: hashPassword(password),
    createdAt: Date.now(),
  };

  saveToStorage(STORAGE_KEYS.USERS, users);

  const boards = loadFromStorage(STORAGE_KEYS.BOARDS, {});
  boards[userId] = {
    columns: [
      { id: "col-1", title: "To Do", order: 0 },
      { id: "col-2", title: "In Progress", order: 1 },
      { id: "col-3", title: "Done", order: 2 },
    ],
    tasks: [],
  };
  saveToStorage(STORAGE_KEYS.BOARDS, boards);

  return users[username];
};

const authenticateUser = (username, password) => {
  const users = loadFromStorage(STORAGE_KEYS.USERS, {});
  const user = users[username];

  if (!user || user.password !== hashPassword(password)) {
    throw new Error("Invalid credentials");
  }

  return user;
};

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

const createSession = (userId, username) => {
  const sessions = loadFromStorage(STORAGE_KEYS.SESSIONS, []);
  const token = createAuthToken(username, userId);

  const session = {
    id: `session-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    userId,
    username,
    token,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };

  sessions.push(session);
  saveToStorage(STORAGE_KEYS.SESSIONS, sessions);

  return session;
};

const getAllSessions = () => {
  return loadFromStorage(STORAGE_KEYS.SESSIONS, []);
};

const getSessionById = (sessionId) => {
  const sessions = getAllSessions();
  return sessions.find((s) => s.id === sessionId);
};

const deleteSession = (sessionId) => {
  const sessions = getAllSessions();
  saveToStorage(
    STORAGE_KEYS.SESSIONS,
    sessions.filter((s) => s.id !== sessionId),
  );
};

const deleteAllSessions = () => {
  saveToStorage(STORAGE_KEYS.SESSIONS, []);
};

// ============================================================================
// BOARD DATA MANAGEMENT
// ============================================================================

const getUserBoard = (userId) => {
  const boards = loadFromStorage(STORAGE_KEYS.BOARDS, {});
  if (!boards[userId]) {
    boards[userId] = {
      columns: [
        { id: "col-1", title: "To Do", order: 0 },
        { id: "col-2", title: "In Progress", order: 1 },
        { id: "col-3", title: "Done", order: 2 },
      ],
      tasks: [],
    };
    saveToStorage(STORAGE_KEYS.BOARDS, boards);
  }
  return boards[userId];
};

const saveUserBoard = (userId, board) => {
  const boards = loadFromStorage(STORAGE_KEYS.BOARDS, {});
  boards[userId] = board;
  saveToStorage(STORAGE_KEYS.BOARDS, boards);
};

const createColumn = (userId, title) => {
  const board = getUserBoard(userId);
  const newColumn = {
    id: `col-${Date.now()}`,
    title,
    order: board.columns.length,
  };
  board.columns.push(newColumn);
  saveUserBoard(userId, board);
  return newColumn;
};

const updateColumn = (userId, columnId, updates) => {
  const board = getUserBoard(userId);
  const column = board.columns.find((c) => c.id === columnId);
  if (column) {
    Object.assign(column, updates);
    saveUserBoard(userId, board);
  }
};

const deleteColumn = (userId, columnId) => {
  const board = getUserBoard(userId);
  board.columns = board.columns.filter((c) => c.id !== columnId);
  board.tasks = board.tasks.filter((t) => t.columnId !== columnId);
  saveUserBoard(userId, board);
};

const createTask = (
  userId,
  columnId,
  title,
  description = "",
  priority = "medium",
) => {
  const board = getUserBoard(userId);
  const newTask = {
    id: `task-${Date.now()}`,
    columnId,
    title,
    description,
    priority,
    createdAt: Date.now(),
    order: board.tasks.filter((t) => t.columnId === columnId).length,
  };
  board.tasks.push(newTask);
  saveUserBoard(userId, board);
  return newTask;
};

const updateTask = (userId, taskId, updates) => {
  const board = getUserBoard(userId);
  const task = board.tasks.find((t) => t.id === taskId);
  if (task) {
    Object.assign(task, updates);
    saveUserBoard(userId, board);
  }
};

const deleteTask = (userId, taskId) => {
  const board = getUserBoard(userId);
  board.tasks = board.tasks.filter((t) => t.id !== taskId);
  saveUserBoard(userId, board);
};

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

const getTheme = () => {
  return loadFromStorage(STORAGE_KEYS.THEME, "light");
};

const setTheme = (theme) => {
  saveToStorage(STORAGE_KEYS.THEME, theme);
};

// ============================================================================
// PRIORITY BADGE COMPONENT
// ============================================================================

const PriorityBadge = ({ priority, theme }) => {
  const colors = {
    high:
      theme === "dark"
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-700 border-red-200",
    medium:
      theme === "dark"
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-700 border-yellow-200",
    low:
      theme === "dark"
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-100 text-blue-700 border-blue-200",
  };

  const icons = {
    high: <Zap className="w-3 h-3" />,
    medium: <Clock className="w-3 h-3" />,
    low: <CheckSquare className="w-3 h-3" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${colors[priority]}`}
    >
      {icons[priority]}
      {priority}
    </span>
  );
};

// ============================================================================
// LANDING PAGE COMPONENT
// ============================================================================

const LandingPage = ({ onGetStarted, theme, toggleTheme }) => {
  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-slate-900" : "bg-white"}`}
    >
      {/* Header */}
      <header
        className={`border-b ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === "dark" ? "bg-indigo-500" : "bg-indigo-600"}`}
            >
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <h1
              className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}
            >
              FlowBoard
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={
              theme === "dark"
                ? "text-slate-400 hover:text-slate-300"
                : "text-slate-600 hover:text-slate-900"
            }
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2
          className={`text-5xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-slate-900"}`}
        >
          Organize Your Work,
          <br />
          Boost Your Productivity
        </h2>
        <p
          className={`text-xl mb-8 max-w-2xl mx-auto ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}
        >
          A simple, powerful kanban board to manage tasks, prioritize work, and
          collaborate with your team.
        </p>
        <Button
          size="lg"
          onClick={onGetStarted}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg"
        >
          Get Started Free
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8">
        <div
          className={`p-6 rounded-lg border ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
        >
          <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center mb-4">
            <GripVertical className="w-6 h-6 text-white" />
          </div>
          <h3
            className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}
          >
            Drag & Drop
          </h3>
          <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
            Easily move tasks between columns with intuitive drag and drop
            interface.
          </p>
        </div>

        <div
          className={`p-6 rounded-lg border ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
        >
          <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3
            className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}
          >
            Priority Tags
          </h3>
          <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
            Mark tasks with priority levels to focus on what matters most.
          </p>
        </div>

        <div
          className={`p-6 rounded-lg border ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
        >
          <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3
            className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}
          >
            Multi-Session
          </h3>
          <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
            Switch between multiple accounts seamlessly in the same browser.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function KanbanBoard() {
  const [showLanding, setShowLanding] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [authMode, setAuthMode] = useState("login");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState("kanban");
  const [theme, setThemeState] = useState("light");

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [editingColumn, setEditingColumn] = useState(null);
  const [editColumnTitle, setEditColumnTitle] = useState("");

  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    const savedTheme = getTheme();
    setThemeState(savedTheme);
    setAllSessions(getAllSessions());

    const sessions = getAllSessions();
    if (sessions.length > 0) {
      setShowLanding(false);
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (currentSessionId) {
      const session = getSessionById(currentSessionId);
      if (session) {
        const board = getUserBoard(session.userId);
        setColumns(board.columns);
        setTasks(board.tasks);
      }
    }
  }, [currentSessionId]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEYS.SYNC) {
        const sessions = getAllSessions();
        setAllSessions(sessions);

        if (currentSessionId) {
          const currentSession = sessions.find(
            (s) => s.id === currentSessionId,
          );
          if (!currentSession) {
            setCurrentSessionId(null);
            setColumns([]);
            setTasks([]);
          } else {
            const board = getUserBoard(currentSession.userId);
            setColumns(board.columns);
            setTasks(board.tasks);
          }
        }

        const savedTheme = getTheme();
        setThemeState(savedTheme);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [currentSessionId]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  const handleSignup = async () => {
    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const user = registerUser(username, email, password);
      const session = createSession(user.id, username);
      setCurrentSessionId(session.id);
      setAllSessions(getAllSessions());
      setShowLanding(false);

      const board = getUserBoard(user.id);
      setColumns(board.columns);
      setTasks(board.tasks);

      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const user = authenticateUser(username, password);
      const session = createSession(user.id, username);
      setCurrentSessionId(session.id);
      setAllSessions(getAllSessions());
      setShowLanding(false);

      const board = getUserBoard(user.id);
      setColumns(board.columns);
      setTasks(board.tasks);

      setUsername("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    deleteSession(currentSessionId);
    setCurrentSessionId(null);
    setColumns([]);
    setTasks([]);
    setAllSessions(getAllSessions());

    if (getAllSessions().length === 0) {
      setShowLanding(true);
    }
  };

  const handleLogoutAll = () => {
    deleteAllSessions();
    setCurrentSessionId(null);
    setColumns([]);
    setTasks([]);
    setAllSessions([]);
    setShowLanding(true);
  };

  const handleSwitchSession = (sessionId) => {
    setCurrentSessionId(sessionId);
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    const session = getSessionById(currentSessionId);
    createColumn(session.userId, newColumnTitle);
    const board = getUserBoard(session.userId);
    setColumns([...board.columns]);
    setNewColumnTitle("");
    setShowAddColumn(false);
  };

  const handleEditColumn = (columnId) => {
    if (!editColumnTitle.trim()) return;
    const session = getSessionById(currentSessionId);
    updateColumn(session.userId, columnId, { title: editColumnTitle });
    const board = getUserBoard(session.userId);
    setColumns([...board.columns]);
    setEditingColumn(null);
    setEditColumnTitle("");
  };

  const handleDeleteColumn = (columnId) => {
    const session = getSessionById(currentSessionId);
    deleteColumn(session.userId, columnId);
    const board = getUserBoard(session.userId);
    setColumns([...board.columns]);
    setTasks([...board.tasks]);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskColumn) return;
    const session = getSessionById(currentSessionId);
    createTask(
      session.userId,
      newTaskColumn,
      newTaskTitle,
      newTaskDesc,
      newTaskPriority,
    );
    const board = getUserBoard(session.userId);
    setTasks([...board.tasks]);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskPriority("medium");
    setNewTaskColumn(null);
  };

  const handleDeleteTask = (taskId) => {
    const session = getSessionById(currentSessionId);
    deleteTask(session.userId, taskId);
    const board = getUserBoard(session.userId);
    setTasks([...board.tasks]);
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (draggedTask && draggedTask.columnId !== columnId) {
      const session = getSessionById(currentSessionId);
      updateTask(session.userId, draggedTask.id, { columnId });
      const board = getUserBoard(session.userId);
      setTasks([...board.tasks]);
    }
    setDraggedTask(null);
  };

  if (showLanding) {
    return (
      <LandingPage
        onGetStarted={() => setShowLanding(false)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  if (!currentSessionId) {
    return (
      <div
        className={`min-h-screen ${theme === "dark" ? "bg-slate-900" : "bg-slate-50"}`}
      >
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-4xl space-y-4">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => setShowLanding(true)}
                className={
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }
              >
                ← Back to Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card
                className={
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                }
              >
                <CardHeader>
                  <CardTitle
                    className={`flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}
                  >
                    {authMode === "login" ? (
                      <LogIn className="w-5 h-5" />
                    ) : (
                      <UserPlus className="w-5 h-5" />
                    )}
                    {authMode === "login" ? "Login" : "Sign Up"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (authMode === "login" ? handleLogin() : handleSignup())
                    }
                    className={
                      theme === "dark"
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "border-slate-300"
                    }
                  />
                  {authMode === "signup" && (
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={
                        theme === "dark"
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "border-slate-300"
                      }
                    />
                  )}
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (authMode === "login" ? handleLogin() : handleSignup())
                    }
                    className={
                      theme === "dark"
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "border-slate-300"
                    }
                  />
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button
                    onClick={authMode === "login" ? handleLogin : handleSignup}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {loading
                      ? "Processing..."
                      : authMode === "login"
                        ? "Login"
                        : "Sign Up"}
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full ${theme === "dark" ? "text-slate-400 hover:text-slate-300" : "text-slate-600 hover:text-slate-900"}`}
                    onClick={() => {
                      setAuthMode(authMode === "login" ? "signup" : "login");
                      setError("");
                    }}
                  >
                    {authMode === "login"
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Login"}
                  </Button>
                </CardContent>
              </Card>

              <Card
                className={
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                }
              >
                <CardHeader>
                  <CardTitle
                    className={`flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}
                  >
                    <Users className="w-5 h-5" />
                    Active Sessions ({allSessions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {allSessions.length === 0 ? (
                    <div
                      className={`text-center py-8 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}
                    >
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No active sessions</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {allSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            theme === "dark"
                              ? "border-slate-700 hover:bg-slate-700"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                          onClick={() => handleSwitchSession(session.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                className={`font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`}
                              >
                                {session.username}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(session.id);
                                setAllSessions(getAllSessions());
                              }}
                              className="hover:bg-red-500/10 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSession = getSessionById(currentSessionId);

  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-slate-900" : "bg-slate-50"}`}
    >
      <div
        className={`border-b ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
      >
        <div className=" px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1
              className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}
            >
              FlowBoard
            </h1>
            <div
              className={`flex items-center gap-2 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}
            >
              <User className="w-4 h-4" />
              <span>{currentSession?.username}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className={theme === "dark" ? "text-slate-400" : "text-slate-600"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className={
                viewMode === "kanban" ? "bg-indigo-600 hover:bg-indigo-700" : ""
              }
            >
              <LayoutGrid className="w-4 h-4 mr-1" />
              Kanban
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={
                viewMode === "list" ? "bg-indigo-600 hover:bg-indigo-700" : ""
              }
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
            {allSessions.length > 1 && (
              <Button variant="outline" size="sm" onClick={handleLogoutAll}>
                <LogOut className="w-4 h-4 mr-1" />
                Logout All
              </Button>
            )}
          </div>
        </div>

        {allSessions.length > 1 && (
          <div className="max-w-7xl mx-auto px-4 pb-3">
            <div className="flex gap-2 overflow-x-auto">
              {allSessions.map((session) => (
                <Button
                  key={session.id}
                  variant={
                    session.id === currentSessionId ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleSwitchSession(session.id)}
                  className={
                    session.id === currentSessionId
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : ""
                  }
                >
                  <User className="w-3 h-3 mr-1" />
                  {session.username}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className=" p-4">
        {viewMode === "kanban" ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <Card
                  className={
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200"
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      {editingColumn === column.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editColumnTitle}
                            onChange={(e) => setEditColumnTitle(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleEditColumn(column.id)
                            }
                            autoFocus
                            className={`h-8 ${theme === "dark" ? "bg-slate-700 border-slate-600" : "border-slate-300"}`}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditColumn(column.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingColumn(null);
                              setEditColumnTitle("");
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <CardTitle
                            className={`text-lg ${theme === "dark" ? "text-white" : "text-slate-900"}`}
                          >
                            {column.title}
                          </CardTitle>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingColumn(column.id);
                                setEditColumnTitle(column.title);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteColumn(column.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {tasks
                      .filter((t) => t.columnId === column.id)
                      .map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          className={`p-3 rounded-lg border cursor-move transition-all ${
                            theme === "dark"
                              ? "bg-slate-700 border-slate-600 hover:bg-slate-650 hover:border-slate-500"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h4
                                className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-slate-900"}`}
                              >
                                {task.title}
                              </h4>
                            </div>
                            <div className="flex gap-1">
                              <GripVertical
                                className={`w-4 h-4 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteTask(task.id)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          {task.description && (
                            <p
                              className={`text-xs mb-2 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}
                            >
                              {task.description}
                            </p>
                          )}
                          <PriorityBadge
                            priority={task.priority}
                            theme={theme}
                          />
                        </div>
                      ))}

                    {newTaskColumn === column.id ? (
                      <div
                        className={`p-3 rounded-lg border ${theme === "dark" ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"}`}
                      >
                        <div className="space-y-2">
                          <Input
                            placeholder="Task title"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className={`h-8 ${theme === "dark" ? "bg-slate-600 border-slate-500" : "border-slate-300"}`}
                          />
                          <Textarea
                            placeholder="Description (optional)"
                            value={newTaskDesc}
                            onChange={(e) => setNewTaskDesc(e.target.value)}
                            className={`min-h-[60px] ${theme === "dark" ? "bg-slate-600 border-slate-500" : "border-slate-300"}`}
                          />
                          <select
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value)}
                            className={`w-full p-2 text-sm border rounded-md ${theme === "dark" ? "bg-slate-600 border-slate-500 text-white" : "border-slate-300 bg-white"}`}
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                          </select>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleAddTask}
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setNewTaskColumn(null);
                                setNewTaskTitle("");
                                setNewTaskDesc("");
                                setNewTaskPriority("medium");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setNewTaskColumn(column.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Task
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}

            {showAddColumn ? (
              <div className="flex-shrink-0 w-80">
                <Card
                  className={`p-4 space-y-2 ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
                >
                  <Input
                    placeholder="Column title"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddColumn()}
                    autoFocus
                    className={
                      theme === "dark"
                        ? "bg-slate-700 border-slate-600"
                        : "border-slate-300"
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddColumn}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddColumn(false);
                        setNewColumnTitle("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              <Button
                variant="outline"
                className="flex-shrink-0 w-80 h-32"
                onClick={() => setShowAddColumn(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Column
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {columns.map((column) => (
              <Card
                key={column.id}
                className={
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle
                      className={
                        theme === "dark" ? "text-white" : "text-slate-900"
                      }
                    >
                      {column.title}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNewTaskColumn(column.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Task
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteColumn(column.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {tasks
                    .filter((t) => t.columnId === column.id)
                    .map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-start justify-between p-3 border rounded-lg ${
                          theme === "dark"
                            ? "border-slate-700 bg-slate-700/50"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <h4
                              className={`font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`}
                            >
                              {task.title}
                            </h4>
                            <PriorityBadge
                              priority={task.priority}
                              theme={theme}
                            />
                          </div>
                          {task.description && (
                            <p
                              className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}
                            >
                              {task.description}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
