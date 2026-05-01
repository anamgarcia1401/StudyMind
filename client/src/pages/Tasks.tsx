import { useState, useEffect } from "react";
import { Trash2, Plus, Sparkles, Loader2, Clock } from "lucide-react";

type Task = {
  text: string;
  completed: boolean;
  priority: 'alta' | 'media' | 'baja';
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
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<'alta' | 'media' | 'baja'>('media');
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [showPlan, setShowPlan] = useState(false);

  // Guardar tareas y SIEMPRE verificar si hay que borrar el plan
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    window.dispatchEvent(new Event("tasksUpdated"));
    
    const pendingTasks = tasks.filter(t => !t.completed);
    
    // 🔥 Si no hay tareas pendientes, borrar el plan
    if (pendingTasks.length === 0) {
      localStorage.removeItem("studyPlan");
      setPlan(null);
      setShowPlan(false);
    }
  }, [tasks]);

  // Cargar plan solo si hay tareas pendientes y el plan existe
  useEffect(() => {
    const savedPlan = localStorage.getItem("studyPlan");
    const pendingTasks = tasks.filter(t => !t.completed);
    
    if (savedPlan && pendingTasks.length > 0) {
      try {
        const parsed = JSON.parse(savedPlan);
        setPlan(parsed);
        setShowPlan(true);
      } catch (e) {}
    } else {
      setShowPlan(false);
      setPlan(null);
    }
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;
    
    // 🔥 Al agregar una nueva tarea, borrar el plan viejo
    localStorage.removeItem("studyPlan");
    setPlan(null);
    setShowPlan(false);
    
    setTasks([...tasks, {
      text: input,
      completed: false,
      priority,
      subject: subject || "General"
    }]);
    setInput("");
    setSubject("");
  };

  const toggleTask = (i: number) => {
    const updated = [...tasks];
    updated[i].completed = !updated[i].completed;
    setTasks(updated);
  };

  const deleteTask = (i: number) => {
    const newTasks = tasks.filter((_, idx) => idx !== i);
    setTasks(newTasks);
    
    // 🔥 Si después de borrar no quedan tareas pendientes, borrar plan
    const pendingAfterDelete = newTasks.filter(t => !t.completed);
    if (pendingAfterDelete.length === 0) {
      localStorage.removeItem("studyPlan");
      setPlan(null);
      setShowPlan(false);
    }
  };

  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://studymind-backend-ayco.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });

      const data = await res.json();
      setPlan(data);
      setShowPlan(true);
      localStorage.setItem("studyPlan", JSON.stringify(data));
      window.dispatchEvent(new Event("planUpdate"));
      
    } catch (error) {
      alert("❌ Error: asegúrate que el backend esté corriendo en https://studymind-backend-ayco.onrender.com");
    } finally {
      setLoading(false);
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'alta': return 'border-l-4 border-l-red-500 bg-red-500/10';
      case 'baja': return 'border-l-4 border-l-green-500 bg-green-500/10';
      default: return 'border-l-4 border-l-yellow-500 bg-yellow-500/10';
    }
  };

  const getPriorityText = (p: string) => {
    switch(p) {
      case 'alta': return '🔴 Alta';
      case 'baja': return '🟢 Baja';
      default: return '🟡 Media';
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      
      <h2 className="text-xl font-bold text-white">Mis Tareas</h2>

      {/* Formulario compacto */}
      <div className="flex gap-2 flex-wrap">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && addTask()}
          placeholder="📝 Nueva tarea..."
          className="flex-1 min-w-[150px] p-2 rounded-xl bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as any)}
          className="p-2 rounded-xl bg-white/10 text-white text-sm"
        >
          <option value="alta">🔴 Alta</option>
          <option value="media">🟡 Media</option>
          <option value="baja">🟢 Baja</option>
        </select>
        
        <input
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Materia"
          className="w-24 p-2 rounded-xl bg-white/10 text-white placeholder-gray-400 text-sm"
        />
        
        <button onClick={addTask} className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 rounded-xl">
          <Plus size={18} />
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/10 rounded-xl p-2 text-center">
          <p className="text-xl font-bold text-white">{pendingTasks}</p>
          <p className="text-[10px] text-gray-400">Pendientes</p>
        </div>
        <div className="bg-white/10 rounded-xl p-2 text-center">
          <p className="text-xl font-bold text-green-400">{completedTasks}</p>
          <p className="text-[10px] text-gray-400">Completadas</p>
        </div>
        <div className="bg-white/10 rounded-xl p-2 text-center">
          <p className="text-xl font-bold text-white">{totalTasks}</p>
          <p className="text-[10px] text-gray-400">Total</p>
        </div>
      </div>

      {/* Barra de progreso */}
      {totalTasks > 0 && (
        <div className="bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all" style={{ width: `${(completedTasks / totalTasks) * 100}%` }} />
        </div>
      )}

      {/* Lista de tareas */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {tasks.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <p>No hay tareas</p>
            <p className="text-xs mt-1">Agrega tu primera tarea 👆</p>
          </div>
        )}
        {tasks.map((t, i) => (
          <div key={i} className={`${getPriorityColor(t.priority)} rounded-xl p-2 flex items-center justify-between`}>
            <div className="flex-1">
              <div onClick={() => toggleTask(i)} className={`cursor-pointer text-white text-sm ${t.completed ? "line-through text-gray-400" : ""}`}>
                {t.text}
              </div>
              <div className="flex gap-2 mt-0.5">
                <span className="text-[10px] text-gray-400">{getPriorityText(t.priority)}</span>
                <span className="text-[10px] text-gray-500">📚 {t.subject || "General"}</span>
              </div>
            </div>
            <button onClick={() => deleteTask(i)} className="text-gray-400 hover:text-red-400 p-1">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Botón generar plan - solo si hay tareas pendientes */}
      {pendingTasks > 0 && (
        <button
          onClick={generatePlan}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-white disabled:opacity-50 text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Generando plan..." : "🤖 Generar plan de estudio con IA"}
        </button>
      )}

      {/* Plan generado - solo si hay tareas pendientes Y plan existe */}
      {showPlan && plan && plan.plan && plan.plan.length > 0 && pendingTasks > 0 && (
        <div className="mt-2 space-y-3 max-h-[280px] overflow-y-auto">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-3">
            <h3 className="text-md font-bold text-white">{plan.title}</h3>
            <p className="text-xs text-white/80 mt-0.5">{plan.summary}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                <Clock size={12} /><span>📚 {plan.totalStudyTime}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                <span>☕</span><span>Descanso: {plan.totalBreakTime}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-white/80">📋 Plan sugerido:</p>
            {plan.plan.map((item) => (
              <div key={item.step} className="bg-white/10 rounded-xl p-2 border-l-4 border-purple-500">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-purple-400 font-bold">#{item.step}</span>
                      <p className="font-medium text-white text-xs">{item.task}</p>
                    </div>
                    <p className="text-[10px] text-white/50 mt-0.5">📚 {item.subject} • {getPriorityText(item.priority)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-purple-500/30 px-1.5 py-0.5 rounded-full">
                      {item.studyTime}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-white/50 mt-1">{item.recommendation}</p>
                <p className="text-[10px] text-white/40 mt-0.5">⏱️ Descanso: {item.breakTime}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 rounded-xl p-2 text-center">
            <p className="text-xs italic text-white/70">"{plan.quote}"</p>
          </div>
        </div>
      )}
    </div>
  );
}