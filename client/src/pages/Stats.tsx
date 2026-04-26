import { useEffect, useState } from "react";
import { 
  CheckCircle, Circle, TrendingUp, Award, Calendar, 
  Target, Sparkles, BarChart3, Clock, Flame, Brain,
  BookOpen
} from "lucide-react";

type Task = {
  text: string;
  completed: boolean;
  priority?: string;
  subject?: string;
  createdAt?: string;
};

export default function Stats() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
      setTasks(parsed);
    }
  }, []);

  // Actualizar cuando cambian las tareas
  useEffect(() => {
    const handleTasksUpdate = () => {
      const savedTasks = localStorage.getItem("tasks");
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        setTasks(parsed);
      }
        };
    
    window.addEventListener("tasksUpdated", handleTasksUpdate);
    window.addEventListener("storage", handleTasksUpdate);
    
    return () => {
      window.removeEventListener("tasksUpdated", handleTasksUpdate);
      window.removeEventListener("storage", handleTasksUpdate);
    };
  }, []);

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  
  // Estadísticas por prioridad
  const highPriority = tasks.filter(t => t.priority === "alta").length;
  const highCompleted = tasks.filter(t => t.priority === "alta" && t.completed).length;
  const highPercent = highPriority ? Math.round((highCompleted / highPriority) * 100) : 0;
  
  const mediumPriority = tasks.filter(t => t.priority === "media").length;
  const mediumCompleted = tasks.filter(t => t.priority === "media" && t.completed).length;
  const mediumPercent = mediumPriority ? Math.round((mediumCompleted / mediumPriority) * 100) : 0;
  
  const lowPriority = tasks.filter(t => t.priority === "baja").length;
  const lowCompleted = tasks.filter(t => t.priority === "baja" && t.completed).length;
  const lowPercent = lowPriority ? Math.round((lowCompleted / lowPriority) * 100) : 0;

  // Mensaje motivacional
  const getMotivationalMessage = () => {
    if (percent === 100 && total > 0) {
      return { text: "🎉 ¡Increíble! Completaste TODAS tus tareas. ¡Eres un campeón!", emoji: "🏆" };
    }
    if (percent >= 75) {
      return { text: "🔥 ¡Excelente progreso! Estás a punto de terminar.", emoji: "🔥" };
    }
    if (percent >= 50) {
      return { text: "💪 Vas muy bien. ¡Sigue así, no pares!", emoji: "💪" };
    }
    if (percent > 0) {
      return { text: "📝 Cada tarea completada es un paso más. ¡Continúa!", emoji: "📝" };
    }
    return { text: "🌟 Comienza agregando tus primeras tareas. ¡Tú puedes!", emoji: "🌟" };
  };
  
  const message = getMotivationalMessage();

  return (
    <div className="text-white space-y-5 animate-fadeIn pb-4">
      
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-purple-400" />
        <h1 className="text-xl font-bold">Tus Estadísticas</h1>
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-3 text-center border border-blue-500/30">
          <CheckCircle className="w-6 h-6 text-blue-400 mx-auto mb-1" />
          <p className="text-2xl font-bold">{completed}</p>
          <p className="text-[10px] text-white/50">Completadas</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-3 text-center border border-yellow-500/30">
          <Circle className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
          <p className="text-2xl font-bold">{pending}</p>
          <p className="text-[10px] text-white/50">Pendientes</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-3 text-center border border-green-500/30">
          <Target className="w-6 h-6 text-green-400 mx-auto mb-1" />
          <p className="text-2xl font-bold">{percent}%</p>
          <p className="text-[10px] text-white/50">Completado</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/70">Progreso total</span>
          <span className="text-white/70 font-bold">{percent}%</span>
        </div>
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500 rounded-full" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Productividad por prioridad */}
      {(highPriority > 0 || mediumPriority > 0 || lowPriority > 0) && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Productividad por prioridad
          </p>
          <div className="space-y-3">
            {highPriority > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-400">🔴 Alta prioridad</span>
                  <span className="text-white/50">{highCompleted}/{highPriority}</span>
                </div>
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${highPercent}%` }} />
                </div>
              </div>
            )}
            {mediumPriority > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-yellow-400">🟡 Media prioridad</span>
                  <span className="text-white/50">{mediumCompleted}/{mediumPriority}</span>
                </div>
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                  <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${mediumPercent}%` }} />
                </div>
              </div>
            )}
            {lowPriority > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-green-400">🟢 Baja prioridad</span>
                  <span className="text-white/50">{lowCompleted}/{lowPriority}</span>
                </div>
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: `${lowPercent}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensaje motivacional */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 text-center border border-purple-500/30">
        <span className="text-2xl mr-2">{message.emoji}</span>
        <p className="text-sm text-white/80">{message.text}</p>
      </div>

      {/* Consejo personalizado */}
      <div className="bg-indigo-900/30 rounded-xl p-3 text-center">
        <Brain className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
        <p className="text-[10px] text-white/50">
          {percent < 50 
            ? "💡 Tip: Prioriza las tareas más importantes y usa la técnica Pomodoro"
            : percent < 100
            ? "💡 Tip: ¡Ya casi terminas! Un último esfuerzo y lo lograrás"
            : "💡 Tip: ¡Excelente trabajo! Disfruta tu logro y prepárate para nuevos retos"}
        </p>
      </div>
    </div>
  );
}