import { useEffect, useState } from "react";
import { 
  CheckCircle, Circle, TrendingUp, Award, Calendar, 
  Target, Sparkles, BarChart3, Clock, Flame, Brain,
  Smile, Meh, Frown
} from "lucide-react";

type Task = {
  text: string;
  completed: boolean;
  priority?: string;
  subject?: string;
  createdAt?: string;
};

type Habit = {
  id: string;
  date: string;
  mood: string;
  studied: boolean;
  hoursStudied: number;
};

export default function Stats() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
      setTasks(parsed);
    }
    
    const savedHabits = localStorage.getItem("studyHabits");
    if (savedHabits) {
      const parsed = JSON.parse(savedHabits);
      setHabits(parsed);
    }
  }, []);

  // Estadísticas de tareas
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
  
  // Estadísticas de hábitos
  const totalStudyDays = habits.length;
  const daysStudied = habits.filter(h => h.studied).length;
  const totalHoursStudied = habits.reduce((acc, h) => acc + (h.hoursStudied || 0), 0);
  const avgHoursPerDay = totalStudyDays ? (totalHoursStudied / totalStudyDays).toFixed(1) : 0;
  
  // Estado de ánimo
  const happyDays = habits.filter(h => h.mood === "feliz").length;
  const neutralDays = habits.filter(h => h.mood === "neutral").length;
  const sadDays = habits.filter(h => h.mood === "triste").length;
  
  // Racha actual (días consecutivos con estudio)
  const getCurrentStreak = () => {
    if (habits.length === 0) return 0;
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedHabits = [...habits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sortedHabits.length; i++) {
      if (sortedHabits[i].studied) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };
  
  const streak = getCurrentStreak();

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
      
      {/* Título */}
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

      {/* Barra de progreso principal */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/70">Progreso total</span>
          <span className="text-white/70 font-bold">{percent}%</span>
        </div>
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${percent}%` }}
          />
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

      {/* Hábitos de estudio */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <p className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-green-400" />
          Hábitos de estudio
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-xl font-bold">{streak}</p>
            <p className="text-[10px] text-white/40">Racha actual</p>
          </div>
          <div className="text-center">
            <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xl font-bold">{totalHoursStudied}</p>
            <p className="text-[10px] text-white/40">Horas totales</p>
          </div>
          <div className="text-center">
            <Award className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-xl font-bold">{daysStudied}</p>
            <p className="text-[10px] text-white/40">Días estudiados</p>
          </div>
        </div>
        {totalStudyDays > 0 && (
          <p className="text-center text-xs text-white/40 mt-3">
            Promedio: {avgHoursPerDay} horas/día
          </p>
        )}
      </div>

      {/* Estado de ánimo */}
      {habits.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
            <Smile className="w-4 h-4 text-yellow-400" />
            Estado de ánimo
          </p>
          <div className="flex justify-around">
            <div className="text-center">
              <Smile className="w-6 h-6 text-green-400 mx-auto" />
              <p className="text-lg font-bold">{happyDays}</p>
              <p className="text-[10px] text-white/40">Feliz</p>
            </div>
            <div className="text-center">
              <Meh className="w-6 h-6 text-yellow-400 mx-auto" />
              <p className="text-lg font-bold">{neutralDays}</p>
              <p className="text-[10px] text-white/40">Neutral</p>
            </div>
            <div className="text-center">
              <Frown className="w-6 h-6 text-red-400 mx-auto" />
              <p className="text-lg font-bold">{sadDays}</p>
              <p className="text-[10px] text-white/40">Triste</p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje motivacional */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 text-center border border-purple-500/30">
        <span className="text-2xl mr-2">{message.emoji}</span>
        <p className="text-sm text-white/80">{message.text}</p>
      </div>

      {/* Resumen de tareas por materia */}
      {(() => {
        const subjects = new Map<string, number>();
        tasks.forEach(t => {
          const subject = t.subject || "General";
          subjects.set(subject, (subjects.get(subject) || 0) + 1);
        });
        
        if (subjects.size > 1) {
          return (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Distribución por materia
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.from(subjects.entries()).map(([subject, count]) => (
                  <div key={subject} className="bg-white/5 rounded-full px-3 py-1 text-xs">
                    {subject}: {count}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })()}

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

// Import faltante
import { BookOpen } from "lucide-react";