import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 📝 Función para calcular tiempo REAL según prioridad y palabras clave
function getRealStudyTime(task) {
  let minutes = 25;
  
  // Tiempo base por prioridad
  if (task.priority === 'alta') minutes = 45;
  if (task.priority === 'baja') minutes = 20;
  if (task.priority === 'media') minutes = 30;
  
  // Materias difíciles requieren más tiempo
  const hardSubjects = ['Matemáticas', 'Programación', 'Física', 'Química', 'Cálculo', 'Álgebra'];
  if (task.subject && hardSubjects.some(s => task.subject.includes(s))) {
    minutes += 15;
  }
  
  // Palabras clave que indican más tiempo necesario
  const keywords = ['examen', 'parcial', 'final', 'proyecto', 'trabajo final', 'investigación', 'tesis'];
  if (keywords.some(k => task.text.toLowerCase().includes(k))) {
    minutes += 20;
  }
  
  // Si es muy urgente (prioridad alta + palabras clave)
  if (task.priority === 'alta' && keywords.some(k => task.text.toLowerCase().includes(k))) {
    minutes += 15;
  }
  
  return minutes;
}

function getBreakTime(priority, studyMinutes) {
  // Descanso proporcional al tiempo de estudio
  if (priority === 'alta') return Math.min(15, Math.floor(studyMinutes * 0.25));
  if (priority === 'media') return 10;
  return 8;
}

// 📝 Función para generar plan de estudio
function generateStudyPlan(tasks) {
  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  
  if (incompleteTasks.length === 0) {
    return {
      title: "🎉 ¡Felicidades!",
      summary: "Has completado todas tus tareas. ¡Tómate un merecido descanso!",
      plan: [],
      quote: "El descanso también es parte del éxito. 🌟",
      totalStudyTime: "0 minutos",
      totalBreakTime: "0 minutos",
      totalTime: "0 minutos",
      completedTasks: completedTasks.length,
      pendingTasks: 0
    };
  }

  // Ordenar por prioridad (alta > media > baja)
  const priorityOrder = { alta: 1, media: 2, baja: 3 };
  const sortedTasks = [...incompleteTasks].sort((a, b) => 
    (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
  );

  const plan = sortedTasks.map((task, index) => {
    const studyMinutes = getRealStudyTime(task);
    const breakMinutes = getBreakTime(task.priority, studyMinutes);
    
    let recomendacion = "";
    if (task.priority === 'alta') {
      recomendacion = "⚠️ Prioridad alta - Haz esto primero hoy. Requiere máxima concentración.";
    } else if (task.priority === 'media') {
      recomendacion = "📌 Prioridad media - Programa para hoy o mañana.";
    } else {
      recomendacion = "✅ Prioridad baja - Puedes hacerlo cuando tengas tiempo libre.";
    }
    
    if (task.text.toLowerCase().includes('examen')) {
      recomendacion += " 📝 Especial atención: ¡Es un examen! Repasa con anticipación.";
    }
    if (task.text.toLowerCase().includes('parcial')) {
      recomendacion += " 🎯 ¡Parcial importante! Dedícale tiempo extra.";
    }
    
    return {
      step: index + 1,
      task: task.text,
      subject: task.subject || 'General',
      priority: task.priority,
      studyTime: `${studyMinutes} minutos`,
      studySeconds: studyMinutes * 60,
      breakTime: `${breakMinutes} minutos`,
      breakSeconds: breakMinutes * 60,
      recommendation: recomendacion,
      order: index
    };
  });

  // Cálculos totales precisos
  const totalStudyMinutes = plan.reduce((acc, p) => acc + parseInt(p.studyTime), 0);
  const totalBreakMinutes = plan.reduce((acc, p) => acc + parseInt(p.breakTime), 0);
  const totalMinutes = totalStudyMinutes + totalBreakMinutes;
  const totalHours = Math.floor(totalMinutes / 60);
  const totalRemainingMinutes = totalMinutes % 60;

  return {
    title: "📚 Tu Plan de Estudio Personalizado",
    summary: `Basado en tus ${incompleteTasks.length} tareas pendientes. Sigue este orden para optimizar tu tiempo.`,
    totalStudyTime: `${totalStudyMinutes} minutos (${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}min)`,
    totalBreakTime: `${totalBreakMinutes} minutos (${Math.floor(totalBreakMinutes / 60)}h ${totalBreakMinutes % 60}min)`,
    totalTime: totalHours > 0 
      ? `${totalHours} hora${totalHours !== 1 ? 's' : ''} y ${totalRemainingMinutes} minutos` 
      : `${totalMinutes} minutos`,
    completedTasks: completedTasks.length,
    pendingTasks: incompleteTasks.length,
    plan: plan,
    quote: getMotivationalQuote(),
    tip: getStudyTip()
  };
}

function getMotivationalQuote() {
  const quotes = [
    "✨ El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    "💪 No tienes que ser genial para empezar, pero tienes que empezar para ser genial.",
    "🎯 La disciplina es el puente entre metas y logros.",
    "🌟 Cada día es una nueva oportunidad para acercarte a tus metas.",
    "📚 El estudio no es cuestión de tiempo, es cuestión de dedicación.",
    "🧠 Tu cerebro es como un músculo: entre más lo usas, más fuerte se vuelve.",
    "⚡ Pequeños progresos cada día llevan a grandes resultados."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function getStudyTip() {
  const tips = [
    "Usa la técnica Pomodoro: 25-45 min estudio, 5-10 min descanso según la dificultad",
    "Elimina distracciones (celular en modo avión o en otra habitación)",
    "Toma agua cada hora para mantenerte hidratado y concentrado",
    "Haz pausas activas: estira tu cuerpo cada 2 horas",
    "Revisa tu progreso al final del día para motivarte",
    "Estudia en bloques de tiempo cortos pero intensos",
    "Enseña lo que aprendes: es la mejor forma de afianzar conocimiento"
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

// Endpoint principal
app.post('/api/plan', (req, res) => {
  const { tasks } = req.body;
  
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'Se requieren tareas válidas' });
  }
  
  const plan = generateStudyPlan(tasks);
  res.json(plan);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LLM Simulator running 🚀' });
});

app.listen(PORT, () => {
  console.log(`🧠 LLM Simulator running on http://localhost:${PORT}`);
  console.log(`📝 Endpoint: POST http://localhost:${PORT}/api/plan`);
});