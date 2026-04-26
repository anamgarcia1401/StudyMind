import { useState, useEffect } from "react";
import { Sparkles, Loader2, Clock, AlertCircle, CheckCircle, Circle, Trash2, Plus, X } from "lucide-react";

type Task = {
  text: string;
  completed: boolean;
  priority?: 'alta' | 'media' | 'baja';
  subject?: string;
};

type PlanTask = {
  step: number;
  task: string;
  subject: string;
  priority: string;
  studyTime: string;
  studySeconds: number;
  breakTime: string;
  breakSeconds: number;
  recommendation: string;
  order: number;
};

type Plan = {
  title: string;
  summary: string;
  totalStudyTime: string;
  totalBreakTime: string;
  totalTime: string;
  completedTasks: number;
  pendingTasks: number;
  plan: PlanTask[];
  quote: string;
  tip: string;
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskPriority, setNewTaskPriority] = useState<'alta' | 'media' | 'baja'>('media');
  const [newTaskSubject, setNewTaskSubject] = useState("");

  // Cargar tareas desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const tasksWithDefaults = parsed.map((t: any) => ({
            text: t.text,
            completed: t.completed || false,
            priority: t.priority || 'media',
            subject: t.subject || 'General'
          }));
          setTasks(tasksWithDefaults);
        } else {
          setTasks([]);
        }
      } catch (e) {
        console.error("Error parsing tasks:", e);
        setTasks([]);
      }
    }
  }, []);

  // 🔥 NUEVO: Cargar plan guardado al iniciar y cuando vuelve de otra pestaña
  useEffect(() => {
    const savedPlan = localStorage.getItem("studyPlan");
    if (savedPlan) {
      try {
        const parsed = JSON.parse(savedPlan);
        setPlan(parsed);
        setShowPlan(true);
      } catch (e) {
        console.error("Error loading saved plan", e);
      }
    }
  }, []);

  // Guardar tareas en localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    window.dispatchEvent(new Event("tasksUpdated"));
    window.dispatchEvent(new Event("storage"));
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;
    const newTask: Task = {
      text: input,
      completed: false,
      priority: newTaskPriority,
      subject: newTaskSubject || 'General',
    };
    setTasks([...tasks, newTask]);
    setInput("");
    setNewTaskSubject("");
    setNewTaskPriority('media');
    setShowAddTask(false);
  };

  const toggleTask = (index: number) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  const deleteTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const updatePriority = (index: number, priority: 'alta' | 'media' | 'baja') => {
    const updated = [...tasks];
    updated[index].priority = priority;
    setTasks(updated);
  };

  const updateSubject = (index: number, subject: string) => {
    const updated = [...tasks];
    updated[index].subject = subject;
    setTasks(updated);
  };

  const generateStudyPlan = async () => {
    setLoading(true);
    setShowPlan(false);
    
    try {
      const response = await fetch('http://localhost:3001/api/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks }),
      });
      
      const data = await response.json();
      setPlan(data);
      setShowPlan(true);
      
      const planWithTimestamp = {
        ...data,
        timestamp: Date.now(),
        taskSnapshot: JSON.stringify(tasks)
      };
      localStorage.setItem("studyPlan", JSON.stringify(planWithTimestamp));
      window.dispatchEvent(new Event("planUpdate"));
      
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al conectar con el servidor. Asegúrate de que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch(priority) {
      case 'alta': return 'border-l-4 border-l-red-500';
      case 'baja': return 'border-l-4 border-l-green-500';
      default: return 'border-l-4 border-l-yellow-500';
    }
  };

  const getPriorityBg = (priority?: string) => {
    switch(priority) {
      case 'alta': return 'bg-red-500/20 text-red-300';
      case 'baja': return 'bg-green-500/20 text-green-300';
      default: return 'bg-yellow-500/20 text-yellow-300';
    }
  };

  const getPriorityText = (priority?: string) => {
    switch(priority) {
      case 'alta': return '🔴 Alta';
      case 'baja': return '🟢 Baja';
      default: return '🟡 Media';
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
          <p className="text-2xl font-bold text-white">{pendingTasks}</p>
          <p className="text-xs text-white/60">Pendientes</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
          <p className="text-2xl font-bold text-green-400">{completedTasks}</p>
          <p className="text-xs text-white/60">Completadas</p>
        </div>
      </div>

      {totalTasks > 0 && (
        <div className="bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-300"
            style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
          />
        </div>
      )}

      <button
        onClick={() => setShowAddTask(!showAddTask)}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-white"
      >
        {showAddTask ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        {showAddTask ? "Cancelar" : "+ Nueva tarea"}
      </button>

      {showAddTask && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 space-y-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="📝 Ej: Estudiar para el examen de matemáticas"
            className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
          />
          <input
            type="text"
            value={newTaskSubject}
            onChange={(e) => setNewTaskSubject(e.target.value)}
            placeholder="📚 Materia (ej: Matemáticas)"
            className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
          />
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as any)}
            className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
          >
            <option value="alta">🔴 Alta prioridad (exámenes, entregas urgentes)</option>
            <option value="media">🟡 Media prioridad</option>
            <option value="baja">🟢 Baja prioridad</option>
          </select>
          <button
            onClick={addTask}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-2 rounded-lg text-white font-medium"
          >
            Agregar tarea
          </button>
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {tasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-white/50">No hay tareas</p>
            <p className="text-xs text-white/30 mt-1">Agrega tu primera tarea 👆</p>
          </div>
        )}
        {tasks.map((t, i) => (
          <div
            key={i}
            className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 ${getPriorityColor(t.priority)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div
                  onClick={() => toggleTask(i)}
                  className={`cursor-pointer text-white ${t.completed ? "line-through text-white/40" : ""}`}
                >
                  {t.text}
                </div>
                <div className="flex gap-2 mt-2">
                  <select
                    value={t.priority || 'media'}
                    onChange={(e) => updatePriority(i, e.target.value as any)}
                    className={`text-xs rounded-lg px-2 py-1 ${getPriorityBg(t.priority)} border-none focus:outline-none`}
                  >
                    <option value="alta">🔴 Alta</option>
                    <option value="media">🟡 Media</option>
                    <option value="baja">🟢 Baja</option>
                  </select>
                  <input
                    type="text"
                    value={t.subject || ''}
                    onChange={(e) => updateSubject(i, e.target.value)}
                    placeholder="Materia"
                    className="text-xs bg-black/30 rounded-lg px-2 py-1 w-24 text-white placeholder-white/40 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => deleteTask(i)}
                className="text-white/40 hover:text-red-400 ml-2 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {pendingTasks > 0 && (
        <button
          onClick={generateStudyPlan}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-white disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          {loading ? "Generando plan..." : "🤖 Gestionar actividades con IA"}
        </button>
      )}

      {/* Plan generado - se muestra si existe */}
      {showPlan && plan && plan.plan && plan.plan.length > 0 && (
        <div className="mt-4 space-y-4 animate-fadeIn">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white">{plan.title}</h3>
            <p className="text-sm text-white/80 mt-1">{plan.summary}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-white/70">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="text-xs">Estudio: {plan.totalStudyTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm">☕</span>
                <span className="text-xs">Descanso: {plan.totalBreakTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="text-xs">Total: {plan.totalTime}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-500/20 rounded-xl p-2 text-center">
              <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
              <p className="text-xs text-white/60">Completadas</p>
              <p className="text-lg font-bold text-white">{plan.completedTasks}</p>
            </div>
            <div className="bg-yellow-500/20 rounded-xl p-2 text-center">
              <AlertCircle className="w-4 h-4 text-yellow-400 mx-auto" />
              <p className="text-xs text-white/60">Pendientes</p>
              <p className="text-lg font-bold text-white">{plan.pendingTasks}</p>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            <p className="text-sm font-semibold text-white/80">📋 Plan sugerido (en orden):</p>
            {plan.plan.map((item) => (
              <div key={item.step} className="bg-white/5 rounded-xl p-3 border-l-4 border-purple-500">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-400 font-bold">#{item.step}</span>
                      <p className="font-medium text-white text-sm">{item.task}</p>
                    </div>
                    <p className="text-xs text-white/50 mt-1">
                      📚 {item.subject} • {getPriorityText(item.priority)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-purple-500/30 px-2 py-1 rounded text-white">
                      {item.studyTime}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-white/50 mt-2">{item.recommendation}</p>
                <p className="text-xs text-white/40 mt-1">⏱️ Descanso: {item.breakTime}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-sm italic text-white/70">"{plan.quote}"</p>
            <p className="text-xs text-white/50 mt-2">💡 Tip: {plan.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}