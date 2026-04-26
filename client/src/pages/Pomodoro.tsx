import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, CheckCircle, Circle, Sparkles, SkipForward, Coffee, RefreshCw, Plus } from "lucide-react";

type Task = {
  text: string;
  completed: boolean;
  priority?: string;
  subject?: string;
};

type PomodoroTask = {
  id: string;
  text: string;
  studyTime: number;
  breakTime: number;
  completed: boolean;
  priority: string;
  order: number;
};

// Sonido para notificaciones
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 880;
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log("Web Audio no soportado");
  }
};

// Notificación del navegador
const showBrowserNotification = (title: string, body: string) => {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.svg" });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
};

export default function Pomodoro() {
  const [tasks, setTasks] = useState<PomodoroTask[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"study" | "break">("study");
  const [allTasksCompleted, setAllTasksCompleted] = useState(false);

  // Guardar estado en localStorage
  const savePomodoroState = () => {
    const state = {
      tasks,
      currentTaskIndex,
      timeLeft,
      isActive,
      mode,
      allTasksCompleted,
    };
    localStorage.setItem("pomodoroState", JSON.stringify(state));
  };

  // Cargar estado guardado
  const loadPomodoroState = (): boolean => {
    const saved = localStorage.getItem("pomodoroState");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.tasks && state.tasks.length > 0) {
          setTasks(state.tasks);
          setCurrentTaskIndex(state.currentTaskIndex);
          setTimeLeft(state.timeLeft);
          setIsActive(false);
          setMode(state.mode);
          setAllTasksCompleted(state.allTasksCompleted);
          return true;
        }
      } catch (e) {
        console.error("Error loading pomodoro state", e);
      }
    }
    return false;
  };

  // Marcar tarea en Tasks
  const markTaskCompletedInTasks = (taskText: string) => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const allTasks = JSON.parse(savedTasks);
      const taskIndex = allTasks.findIndex((t: Task) => t.text === taskText);
      if (taskIndex !== -1 && !allTasks[taskIndex].completed) {
        allTasks[taskIndex].completed = true;
        localStorage.setItem("tasks", JSON.stringify(allTasks));
        window.dispatchEvent(new Event("tasksUpdated"));
      }
    }
  };

  // Completar tarea actual
  const completeCurrentTask = () => {
    if (tasks.length === 0 || currentTaskIndex >= tasks.length) return;
    
    const currentTask = tasks[currentTaskIndex];
    if (currentTask.completed) return;
    
    const updatedTasks = [...tasks];
    updatedTasks[currentTaskIndex].completed = true;
    setTasks(updatedTasks);
    markTaskCompletedInTasks(currentTask.text);
    
    // Buscar siguiente tarea no completada
    const nextPendingIndex = updatedTasks.findIndex((t, idx) => !t.completed && idx > currentTaskIndex);
    if (nextPendingIndex !== -1) {
      setCurrentTaskIndex(nextPendingIndex);
      setMode("study");
      setTimeLeft(tasks[nextPendingIndex].studyTime);
      setIsActive(false);
      savePomodoroState();
    } else {
      const anyPending = updatedTasks.some(t => !t.completed);
      if (anyPending) {
        const firstPending = updatedTasks.findIndex(t => !t.completed);
        if (firstPending !== -1) {
          setCurrentTaskIndex(firstPending);
          setMode("study");
          setTimeLeft(tasks[firstPending].studyTime);
          setIsActive(false);
          savePomodoroState();
        }
      } else {
        setAllTasksCompleted(true);
        setTasks([]);
        localStorage.removeItem("pomodoroState");
      }
    }
  };

  // Agregar más tiempo
  const addMoreTime = () => {
    if (mode === "study" && tasks.length > 0) {
      setTimeLeft(prev => prev + 5 * 60);
      savePomodoroState();
    }
  };

  // Reiniciar tiempo de tarea actual
  const resetCurrentTaskTimer = () => {
    if (mode === "study" && tasks.length > 0) {
      setTimeLeft(tasks[currentTaskIndex].studyTime);
      setIsActive(false);
      savePomodoroState();
    }
  };

  // Saltar a descanso
  const skipToBreak = () => {
    if (mode === "study" && tasks.length > 0) {
      setIsActive(false);
      setMode("break");
      setTimeLeft(tasks[currentTaskIndex].breakTime);
      savePomodoroState();
    }
  };

  // Saltar descanso
  const skipBreak = () => {
    if (mode === "break" && tasks.length > 0) {
      setIsActive(false);
      const nextIndex = currentTaskIndex + 1;
      if (nextIndex < tasks.length) {
        setCurrentTaskIndex(nextIndex);
        setMode("study");
        setTimeLeft(tasks[nextIndex].studyTime);
        savePomodoroState();
      } else {
        const anyPending = tasks.some(t => !t.completed);
        if (anyPending) {
          const nextPending = tasks.findIndex((t, idx) => !t.completed && idx > currentTaskIndex);
          if (nextPending !== -1) {
            setCurrentTaskIndex(nextPending);
            setMode("study");
            setTimeLeft(tasks[nextPending].studyTime);
            savePomodoroState();
          } else {
            setAllTasksCompleted(true);
            setTasks([]);
            localStorage.removeItem("pomodoroState");
          }
        } else {
          setAllTasksCompleted(true);
          setTasks([]);
          localStorage.removeItem("pomodoroState");
        }
      }
    }
  };

  // Cargar plan desde localStorage
  const loadPlanFromStorage = () => {
    const savedPlan = localStorage.getItem("studyPlan");
    const savedTasks = localStorage.getItem("tasks");
    
    if (savedPlan && savedTasks) {
      try {
        const plan = JSON.parse(savedPlan);
        const currentTasks = JSON.parse(savedTasks);
        const pendingCurrentTasks = currentTasks.filter((t: Task) => !t.completed);
        
        if (plan.plan && plan.plan.length > 0 && pendingCurrentTasks.length > 0) {
          const pendingPlanTasks = plan.plan.filter((p: any) => 
            pendingCurrentTasks.some((t: Task) => t.text === p.task)
          );
          
          if (pendingPlanTasks.length > 0) {
            const pomodoroTasks: PomodoroTask[] = pendingPlanTasks.map((p: any, idx: number) => ({
              id: `${p.task}-${Date.now()}-${idx}`,
              text: p.task,
              studyTime: p.studySeconds || 25 * 60,
              breakTime: p.breakSeconds || 5 * 60,
              completed: false,
              priority: p.priority,
              order: p.order || idx,
            }));
            
            // ✅ CORREGIDO: orden seguro con valor por defecto
            pomodoroTasks.sort((a, b) => (a.order || 0) - (b.order || 0));
            
            setTasks(pomodoroTasks);
            setAllTasksCompleted(false);
            setCurrentTaskIndex(0);
            setMode("study");
            setIsActive(false);
            if (pomodoroTasks.length > 0) {
              setTimeLeft(pomodoroTasks[0].studyTime);
            }
            
            return true;
          }
        }
      } catch (e) {
        console.error("Error loading plan", e);
      }
    }
    return false;
  };

  // Cargar tareas normales
  const loadTasksFromLocalStorage = () => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const allTasks = JSON.parse(savedTasks);
      const pendingTasks = allTasks.filter((t: Task) => !t.completed);
      
      if (pendingTasks.length === 0) {
        setTasks([]);
        setAllTasksCompleted(true);
        return;
      }
      
      const pomodoroTasks = pendingTasks.map((t: Task, idx: number) => ({
        id: `${t.text}-${Date.now()}-${idx}`,
        text: t.text,
        studyTime: t.priority === "alta" ? 45 * 60 : t.priority === "baja" ? 20 * 60 : 30 * 60,
        breakTime: t.priority === "alta" ? 10 * 60 : 8 * 60,
        completed: false,
        priority: t.priority || "media",
        order: idx,
      }));
      
      setTasks(pomodoroTasks);
      setAllTasksCompleted(false);
      setCurrentTaskIndex(0);
      setMode("study");
      setIsActive(false);
      if (pomodoroTasks.length > 0) {
        setTimeLeft(pomodoroTasks[0].studyTime);
      }
    }
  };

  // Inicializar
  useEffect(() => {
    const planLoaded = loadPlanFromStorage();
    if (!planLoaded) {
      loadTasksFromLocalStorage();
    }
    
    const handleUpdate = () => {
      const planLoadedRefresh = loadPlanFromStorage();
      if (!planLoadedRefresh) {
        loadTasksFromLocalStorage();
      }
    };
    
    window.addEventListener("tasksUpdated", handleUpdate);
    window.addEventListener("planUpdate", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    
    return () => {
      window.removeEventListener("tasksUpdated", handleUpdate);
      window.removeEventListener("planUpdate", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // 🔥 Recargar plan cuando la pestaña se vuelve visible
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        const saved = localStorage.getItem("studyPlan");
        if (saved && !allTasksCompleted) {
          const plan = JSON.parse(saved);
          if (plan.plan?.length) {
            const loaded = plan.plan.map((p: any, idx: number) => ({
              id: `${p.task}-${idx}`,
              text: p.task,
              studyTime: p.studySeconds || 25 * 60,
              breakTime: p.breakSeconds || 5 * 60,
              completed: false,
              priority: p.priority,
              order: p.order || idx,
            }));
            // ✅ CORREGIDO
            
              setTasks(loaded);
            if (loaded.length) setTimeLeft(loaded[0].studyTime);
            setCurrentTaskIndex(0);
            setMode("study");
            setIsActive(false);
            setAllTasksCompleted(false);
          }
        }
      }
    };
    
    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);
    
    return () => {
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [allTasksCompleted]);

  // Temporizador principal
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isActive && timeLeft > 0 && tasks.length > 0 && !allTasksCompleted) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, tasks.length, allTasksCompleted]);

  // Manejar fin de estudio o descanso
  useEffect(() => {
    if (tasks.length === 0) return;
    if (timeLeft === 0 && !allTasksCompleted) {
      if (mode === "study") {
        playNotificationSound();
        showBrowserNotification("¡Tiempo de estudio completado!", `Has completado "${tasks[currentTaskIndex]?.text}". Tómate un descanso.`);
        completeCurrentTask();
      } else if (mode === "break") {
        playNotificationSound();
        showBrowserNotification("¡Descanso terminado!", "Es hora de volver al estudio.");
        skipBreak();
      }
    }
  }, [timeLeft, mode, tasks.length, allTasksCompleted, currentTaskIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercent = () => {
    if (tasks.length === 0 || currentTaskIndex >= tasks.length) return 0;
    const currentTask = tasks[currentTaskIndex];
    const total = mode === "study" ? currentTask.studyTime : currentTask.breakTime;
    if (total === 0) return 0;
    return ((total - timeLeft) / total) * 100;
  };

  if (allTasksCompleted) {
    return (
      <div className="text-white space-y-6 p-4">
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-8 text-center border border-green-500/30">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">🎉 ¡Felicidades!</h2>
          <p className="text-white/70 mb-6">Has completado todas tus tareas pendientes.</p>
          <button
            onClick={() => {
              setAllTasksCompleted(false);
              loadTasksFromLocalStorage();
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-xl text-white font-medium flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
            Reiniciar Tareas
          </button>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-white space-y-6 p-4">
        <div className="bg-white/10 rounded-2xl p-8 text-center">
          <p className="text-white/60">No hay tareas pendientes</p>
          <button
            onClick={() => window.location.href = "/tasks"}
            className="mt-4 bg-purple-500 px-4 py-2 rounded-lg text-sm"
          >
            Ir a Tareas
          </button>
        </div>
      </div>
    );
  }

  const currentTask = tasks[currentTaskIndex];
  const completedCount = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercent = getProgressPercent();
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="text-white space-y-6 p-4">
      <div className="text-center">
        <p className="text-xs text-white/50 mb-1">
          {mode === "study" ? "📚 ESTUDIANDO" : "☕ DESCANSO"}
        </p>
        <h2 className="text-lg font-semibold px-4">{currentTask.text}</h2>
        <div className="flex justify-center gap-2 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            currentTask.priority === "alta" ? "bg-red-500/30 text-red-300" : 
            currentTask.priority === "baja" ? "bg-green-500/30 text-green-300" : 
            "bg-yellow-500/30 text-yellow-300"
          }`}>
            {currentTask.priority === "alta" ? "🔴 Prioridad Alta" : 
             currentTask.priority === "baja" ? "🟢 Prioridad Baja" : 
             "🟡 Prioridad Media"}
          </span>
          <span className="text-xs text-white/40">
            Tarea {currentTaskIndex + 1} de {totalTasks}
          </span>
        </div>
      </div>

      <div className="flex justify-center py-4">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="128" cy="128" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
            <circle cx="128" cy="128" r={radius} stroke="url(#gradient)" strokeWidth="12" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-300" />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-mono font-bold tracking-wider">{formatTime(timeLeft)}</span>
            <span className="text-xs text-white/50 mt-2">
              {mode === "study" ? "tiempo restante" : "descanso"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white/10 rounded-full h-1.5 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-full transition-all duration-300" style={{ width: `${(completedCount / totalTasks) * 100}%` }} />
      </div>
      <p className="text-center text-xs text-white/40">Progreso: {completedCount} de {totalTasks} tareas completadas</p>

      <div className="flex justify-center gap-3 flex-wrap">
        {mode === "study" ? (
          <>
            <button onClick={() => setIsActive(!isActive)} className={`p-3 rounded-full ${isActive ? "bg-yellow-500" : "bg-green-500"}`}>
              {isActive ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button onClick={addMoreTime} className="p-3 rounded-full bg-blue-500"><Plus size={24} /></button>
            <button onClick={resetCurrentTaskTimer} className="p-3 rounded-full bg-yellow-500"><RotateCcw size={24} /></button>
            <button onClick={skipToBreak} className="p-3 rounded-full bg-purple-500"><Coffee size={24} /></button>
          </>
        ) : (
          <button onClick={skipBreak} className="p-3 rounded-full bg-green-500 flex items-center gap-2">
            <SkipForward size={24} /> Saltar descanso
          </button>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs text-white/40 mb-2">📋 Tu plan de estudio:</p>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {tasks.map((task, idx) => (
            <div key={task.id} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${idx === currentTaskIndex && !task.completed && mode === "study" ? "bg-purple-500/20" : ""} ${task.completed ? "opacity-60" : ""}`}>
              <span className="text-white/40 w-5 text-center">{task.order + 1}</span>
              {idx === currentTaskIndex && !task.completed && mode === "study" ? (
                <span className="text-purple-400 text-xs animate-pulse">▶</span>
              ) : task.completed ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-white/30" />
              )}
              <span className={`flex-1 truncate ${task.completed ? "line-through text-white/40" : "text-white/80"}`}>{task.text}</span>
              <div className="flex gap-2 text-white/30 text-[10px]">
                <span>📚{Math.floor(task.studyTime / 60)}min</span>
                <span>☕{Math.floor(task.breakTime / 60)}min</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}