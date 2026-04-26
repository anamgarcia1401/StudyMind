import { useState, useEffect } from "react";
import { CheckSquare, Clock, BarChart3, Sparkles, Flame, Award, Brain, Zap, BookOpen } from "lucide-react";
import { getStreak } from '../../utils/streak';

 
type StreakData = {
  lastActive: string;
  streak: number;
};
type Task = {
  text: string;
  completed: boolean;
  priority?: string;
  subject?: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

 {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState(0);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    
    // Cargar streak real
    setStreak(getStreak());
    
    // Escuchar cambios en el streak
    const handleStreakUpdate = () => {
      setStreak(getStreak());
    };
    
    window.addEventListener("streakUpdated", handleStreakUpdate);
    
    // Saludo según la hora
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Buenos días");
    else if (hour < 18) setGreeting("Buenas tardes");
    else setGreeting("Buenas noches");
    
    return () => {
      window.removeEventListener("streakUpdated", handleStreakUpdate);
    };
  }, []);

  // Escuchar cambios en tareas para actualizar streak
  useEffect(() => {
    const handleTasksUpdate = () => {
      const savedTasks = localStorage.getItem("tasks");
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      setStreak(getStreak());
    };
    
    window.addEventListener("tasksUpdated", handleTasksUpdate);
    window.addEventListener("storage", handleTasksUpdate);
    
    return () => {
      window.removeEventListener("tasksUpdated", handleTasksUpdate);
      window.removeEventListener("storage", handleTasksUpdate);
    };
  }, []);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Obtener frase motivacional según el progreso
  const getMotivationalMessage = () => {
    if (completionRate === 100 && totalTasks > 0) {
      return { text: "¡Perfecto! Has completado todas tus tareas. ¡Eres una máquina! 🎉", icon: "🏆", color: "from-yellow-500 to-orange-500" };
    }
    if (completionRate >= 75) {
      return { text: "¡Vas excelente! Sigue así, estás muy cerca de tu meta. 🔥", icon: "🔥", color: "from-orange-500 to-red-500" };
    }
    if (completionRate >= 50) {
      return { text: "Vas por buen camino, ¡no pares! Cada paso cuenta. 💪", icon: "💪", color: "from-blue-500 to-cyan-500" };
    }
    if (completionRate > 0) {
      return { text: "Cada tarea completada es un paso más hacia tus sueños. 📝", icon: "📝", color: "from-purple-500 to-pink-500" };
    }
    return { text: "Comienza agregando tus primeras tareas. ¡Tú puedes! 🌟", icon: "🌟", color: "from-indigo-500 to-purple-500" };
  };

  const message = getMotivationalMessage();
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('es-ES', options);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  // Determinar mensaje de racha
  const getStreakMessage = () => {
    if (streak === 0) return "Comienza una racha hoy";
    if (streak === 1) return "¡Primer día! Sigue así";
    if (streak < 5) return `${streak} días seguidos 🔥`;
    if (streak < 10) return `${streak} días de racha! 🎯`;
    return `${streak} días - ¡Imparable! 🚀`;
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-4">
      {/* Saludo y fecha */}
      <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl p-5 border border-white/10">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {greeting}! 👋
            </h2>
            <p className="text-sm text-white/60 mt-1 capitalize">
              {formattedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Mensaje motivacional del día */}
      <div className={`bg-gradient-to-r ${message.color} rounded-xl p-4 shadow-lg`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{message.icon}</span>
          <p className="text-sm font-medium text-white flex-1">{message.text}</p>
        </div>
      </div>

      {/* Tarjetas de progreso - 3 tarjetas */}
      <div className="grid grid-cols-3 gap-3">
        {/* Pendientes */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10 hover:bg-white/15 transition">
          <div className="bg-blue-500/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckSquare className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{pendingTasks}</p>
          <p className="text-xs text-white/50">Pendientes</p>
        </div>
        
        {/* Completadas */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10 hover:bg-white/15 transition">
          <div className="bg-green-500/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{completedTasks}</p>
          <p className="text-xs text-white/50">Completadas</p>
        </div>
        
        {/* Días activo - AHORA FUNCIONAL */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10 hover:bg-white/15 transition group">
          <div className="bg-orange-500/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Flame className={`w-5 h-5 ${streak > 0 ? "text-orange-400" : "text-white/40"}`} />
          </div>
          <p className="text-2xl font-bold text-white">{streak}</p>
          <p className="text-xs text-white/50">{getStreakMessage()}</p>
        </div>
      </div>

      {/* Barra de progreso principal */}
      {totalTasks > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/70">Progreso general</span>
            <span className="text-white/70 font-bold">{completionRate}%</span>
          </div>
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-xs text-white/40 mt-2 text-center">
            {completionRate === 100 ? "🎉 ¡Completaste todo!" : `${totalTasks - completedTasks} tarea${totalTasks - completedTasks !== 1 ? 's' : ''} por completar`}
          </p>
        </div>
      )}
      {/* Próximas tareas */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-white/50 flex items-center gap-2">
            <BookOpen className="w-3 h-3" />
            Próximas tareas
          </p>
          <button onClick={() => handleNavigate("tasks")} className="text-[10px] text-purple-400 hover:text-purple-300">
            Ver todas →
          </button>
        </div>
        <div className="space-y-2">
          {tasks.filter(t => !t.completed).slice(0, 3).map((task, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 hover:bg-white/15 transition">
              <div className={`w-2 h-2 rounded-full ${
                task.priority === "alta" ? "bg-red-500" : task.priority === "baja" ? "bg-green-500" : "bg-yellow-500"
              }`} />
              <span className="text-sm text-white truncate flex-1">{task.text}</span>
              <span className="text-[10px] text-white/40 px-2 py-1 bg-white/5 rounded-full">{task.subject}</span>
            </div>
          ))}
          {pendingTasks === 0 && (
            <div className="bg-green-500/20 rounded-xl p-4 text-center border border-green-500/30">
              <Sparkles className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-white/80">🎉 No hay tareas pendientes</p>
              <p className="text-xs text-white/50 mt-1">¡Excelente trabajo! Sigue así.</p>
            </div>
          )}
          {pendingTasks > 3 && (
            <p className="text-[10px] text-white/30 text-center">
              +{pendingTasks - 3} tarea{pendingTasks - 3 !== 1 ? 's' : ''} más
            </p>
          )}
        </div>
      </div>

      {/* Consejo del día */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-4 border border-indigo-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <p className="text-xs font-semibold text-purple-400">🧠 CONSEJO DEL DÍA</p>
        </div>
        <p className="text-xs text-white/70 leading-relaxed">
          "La técnica Pomodoro de 25-45 minutos de estudio seguido de 5-10 minutos de descanso mejora la concentración hasta en un 40%. ¡Pruébala en Focus!"
        </p>
      </div>

      {/* Frase motivacional con racha */}
      <div className="text-center py-2">
        <p className="text-[10px] text-white/30 italic">
          {streak > 0 
            ? `🔥 Llevas ${streak} día${streak !== 1 ? 's' : ''} activo. ¡No rompas la racha!`
            : "Completa una tarea hoy para comenzar tu racha"}
        </p>
      </div>
    </div>
  );
}
}
