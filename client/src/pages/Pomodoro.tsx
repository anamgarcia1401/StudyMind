import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, SkipForward, CheckCircle, Sparkles, Zap } from "lucide-react";

type PomodoroTask = {
  text: string;
  studyTime: number;
  breakTime: number;
  completed: boolean;
};

export default function Pomodoro() {
  const [tasks, setTasks] = useState<PomodoroTask[]>([]);
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(0);
  const [mode, setMode] = useState<"study" | "break">("study");
  const [active, setActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Versión simplificada de sonido (solo si el usuario interactúa)
  const playSound = () => {
    if (!audioEnabled) return;
    try {
      const audio = new Audio();
      audio.src = "data:audio/wav;base64,U3RlYWx0aCBzb3VuZCBub3QgYXZhaWxhYmxl";
      audio.play().catch(() => {});
    } catch (e) {
      console.log("Audio no soportado");
    }
  };

  const loadPlan = () => {
    try {
      const plan = localStorage.getItem("studyPlan");
      console.log("Plan:", plan);
      
      if (!plan) {
        setTasks([]);
        return;
      }

      const parsed = JSON.parse(plan);
      if (!parsed.plan || parsed.plan.length === 0) {
        setTasks([]);
        return;
      }

      const savedTasks = localStorage.getItem("tasks");
      const completedTasksTexts = savedTasks ? 
        JSON.parse(savedTasks).filter((t: any) => t.completed === true).map((t: any) => t.text) : [];

      const newTasks: PomodoroTask[] = [];
      for (let i = 0; i < parsed.plan.length; i++) {
        const p = parsed.plan[i];
        newTasks.push({
          text: p.task,
          studyTime: p.studySeconds || 25 * 60,
          breakTime: p.breakSeconds || 5 * 60,
          completed: completedTasksTexts.includes(p.task) || false
        });
      }

      setTasks(newTasks);
      
      let firstPendingIndex = newTasks.findIndex(t => !t.completed);
      if (firstPendingIndex !== -1) {
        setIndex(firstPendingIndex);
        setMode("study");
        setTime(newTasks[firstPendingIndex].studyTime);
        setCompleted(false);
        setError(null);
      } else if (newTasks.length > 0) {
        setCompleted(true);
      }
    } catch (e) {
      console.error("Error:", e);
      setError("Error al cargar el plan");
      setTasks([]);
    }
  };

  useEffect(() => {
    loadPlan();

    const handlePlanUpdate = () => loadPlan();
    const handleTasksUpdate = () => {
      const savedTasks = localStorage.getItem("tasks");
      if (savedTasks) {
        const completedTasksTexts = JSON.parse(savedTasks)
          .filter((t: any) => t.completed === true)
          .map((t: any) => t.text);
        
        setTasks(prev => prev.map(task => ({
          ...task,
          completed: completedTasksTexts.includes(task.text)
        })));
      }
    };

    window.addEventListener("planUpdate", handlePlanUpdate);
    window.addEventListener("tasksUpdated", handleTasksUpdate);
    window.addEventListener("storage", loadPlan);

    return () => {
      window.removeEventListener("planUpdate", handlePlanUpdate);
      window.removeEventListener("tasksUpdated", handleTasksUpdate);
      window.removeEventListener("storage", loadPlan);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    if (time <= 0) return;

    const interval = setInterval(() => {
      setTime(t => {
        if (demoMode) {
          return Math.max(0, t - 10);
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, time, demoMode]);

  useEffect(() => {
    if (time > 0) return;
    if (tasks.length === 0) return;

    if (mode === "study") {
      playSound();
      completeCurrentTask();
    } else {
      playSound();
      goToNextTask();
    }
  }, [time, mode, tasks.length]);

  const completeCurrentTask = () => {
    const currentTask = tasks[index];
    if (!currentTask) return;
    
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = true;
    setTasks(updatedTasks);

    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const allTasks = JSON.parse(savedTasks);
      const taskToComplete = allTasks.find((t: any) => t.text === currentTask.text);
      if (taskToComplete && !taskToComplete.completed) {
        taskToComplete.completed = true;
        localStorage.setItem("tasks", JSON.stringify(allTasks));
        window.dispatchEvent(new Event("tasksUpdated"));
      }
    }

    setMode("break");
    setTime(currentTask.breakTime);
    setActive(false);
  };

  const goToNextTask = () => {
    const nextIndex = index + 1;
    
    if (nextIndex >= tasks.length) {
      setTasks([]);
      setCompleted(true);
      return;
    }

    setIndex(nextIndex);
    setMode("study");
    setTime(tasks[nextIndex].studyTime);
    setActive(false);
  };

  const skipBreak = () => {
    if (mode === "break") {
      goToNextTask();
    }
  };

  const resetCurrentTask = () => {
    if (mode === "study" && tasks[index]) {
      setTime(tasks[index].studyTime);
      setActive(false);
    }
  };

  const addMoreTime = () => {
    if (mode === "study") {
      setTime(prev => prev + 5 * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Activar audio con cualquier clic (para móviles)
  const handleAnyClick = () => {
    setAudioEnabled(true);
  };

  if (error) {
    return (
      <div className="text-white p-8 text-center" onClick={handleAnyClick}>
        <p className="text-red-400">{error}</p>
        <button onClick={() => window.location.href = "/tasks"} className="mt-4 bg-purple-500 px-4 py-2 rounded-lg">
          Ir a Tareas
        </button>
      </div>
    );
  }

  if (completed || (tasks.length > 0 && tasks.every(t => t.completed === true))) {
    return (
      <div className="text-white p-8 text-center space-y-4" onClick={handleAnyClick}>
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-xl font-bold">🎉 ¡Felicidades!</h2>
        <p className="text-gray-400">Has completado todas las tareas de tu plan de estudio.</p>
        <button onClick={() => window.location.href = "/tasks"} className="bg-purple-500 px-4 py-2 rounded-lg">
          Volver a Tareas
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-white p-8 text-center" onClick={handleAnyClick}>
        <p className="text-gray-400">No hay un plan de estudio generado.</p>
        <p className="text-sm text-gray-500 mt-2">Ve a Tareas y genera un plan con IA.</p>
        <button onClick={() => window.location.href = "/tasks"} className="mt-4 bg-purple-500 px-4 py-2 rounded-lg">
          Ir a Tareas
        </button>
      </div>
    );
  }

  const currentTask = tasks[index];
  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => t.completed === true).length;
  const progressPercent = totalTasks ? (completedCount / totalTasks) * 100 : 0;

  if (!currentTask) {
    return (
      <div className="text-white p-8 text-center" onClick={handleAnyClick}>
        <p className="text-gray-400">Error: No hay tarea seleccionada</p>
        <button onClick={() => window.location.href = "/tasks"} className="mt-4 bg-purple-500 px-4 py-2 rounded-lg">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="text-white p-4 space-y-6 text-center" onClick={handleAnyClick}>
      
      <div className="flex justify-between gap-2">
        <button onClick={(e) => { e.stopPropagation(); setAudioEnabled(!audioEnabled); }} className={`text-xs px-2 py-1 rounded-full ${audioEnabled ? 'bg-green-500/50' : 'bg-red-500/50'}`}>
          {audioEnabled ? "🔊 Sonido ON" : "🔇 Sonido OFF"}
        </button>
        <button onClick={(e) => { e.stopPropagation(); setDemoMode(!demoMode); }} className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${demoMode ? 'bg-yellow-500/70 text-black' : 'bg-gray-600/50'}`}>
          <Zap size={14} />
          {demoMode ? "⚡ Demo ON" : "Demo OFF"}
        </button>
      </div>

      <div>
        <p className="text-xs text-gray-400">{mode === "study" ? "📚 ESTUDIANDO" : "☕ DESCANSO"}</p>
        <h2 className="text-lg font-semibold mt-1">{currentTask.text}</h2>
        <div className="flex justify-center gap-2 mt-2">
          <span className="text-xs text-gray-400">Tarea {index + 1} de {totalTasks}</span>
          <span className="text-xs text-green-400">✅ {completedCount} completadas</span>
        </div>
      </div>

      {/* Timer simplificado - sin SVG para móvil */}
      <div className="bg-white/10 rounded-2xl p-6 mx-auto max-w-[200px]">
        <div className="text-5xl font-mono font-bold tracking-wider text-center">
          {formatTime(time)}
        </div>
        <div className="text-xs text-gray-400 mt-2 text-center">
          {mode === "study" ? "tiempo restante" : "descanso"}
        </div>
      </div>

      <div className="bg-white/10 rounded-full h-1.5 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-full transition-all" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="flex justify-center gap-3 flex-wrap">
        <button onClick={() => setActive(!active)} className={`p-3 rounded-full ${active ? "bg-yellow-500" : "bg-green-500"}`}>
          {active ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button onClick={addMoreTime} className="p-3 rounded-full bg-blue-500" title="+5 minutos">+5</button>
        <button onClick={resetCurrentTask} className="p-3 rounded-full bg-yellow-500">
          <RotateCcw size={24} />
        </button>
        {mode === "study" ? (
          <button onClick={completeCurrentTask} className="p-3 rounded-full bg-purple-500" title="Completar tarea">
            <CheckCircle size={24} />
          </button>
        ) : (
          <button onClick={skipBreak} className="p-3 rounded-full bg-green-500 flex items-center gap-1">
            <SkipForward size={24} />
            <span className="text-sm">Saltar</span>
          </button>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-400 mb-2">📋 Plan de estudio:</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {tasks.map((task, idx) => (
              <div key={idx} className={`flex items-center gap-2 text-xs p-1.5 rounded-lg ${idx === index && mode === "study" && !task.completed ? "bg-purple-500/20" : ""}`}>
                {task.completed ? (
                  <CheckCircle size={12} className="text-green-400" />
                ) : idx === index && mode === "study" ? (
                  <span className="text-purple-400 text-xs">▶</span>
                ) : (
                  <span className="w-3 h-3 rounded-full bg-white/20" />
                )}
                <span className={`flex-1 text-left ${task.completed ? "line-through text-gray-500" : "text-white/80"}`}>{task.text}</span>
                <span className="text-gray-500 text-[10px]">{Math.floor(task.studyTime / 60)}min</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}