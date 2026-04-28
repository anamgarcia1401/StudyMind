import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 🔥 TIEMPOS FORZADOS - SIN EXCEPCIONES
function getRealStudyTime(task) {
  const text = task.text.toLowerCase();

  // ========== 1. TAREAS DE 3.5 HORAS ==========
  if (
    text.includes('parcial') ||
    text.includes('examen') ||
    text.includes('quiz') ||
    text.includes('proyecto final') ||
    text.includes('trabajo final') ||
    text.includes('repaso') ||
    text.includes('repasar')
  ) {
    return 210; // 3.5 horas
  }

  // ========== 2. TAREAS DE 2.5 HORAS ==========
  if (
    text.includes('workshop') ||
    text.includes('ensayo') ||
    text.includes('entrega') ||
    text.includes('trabajo') ||
    text.includes('taller')
  ) {
    return 150; // 2.5 horas
  }

  // ========== 3. TAREAS CORTAS ==========
  if (
    text.includes('tarea') ||
    text.includes('revisar') ||
    text.includes('enviar') ||
    text.includes('terminar') ||
    text.includes('actividad práctica') ||
    text.includes('actividad')
  ) {
    return 90; // 1.5 horas
  }

  // ========== FALLBACK ==========
  return 90;
}

function getBreakTime(priority, studyMinutes) {
  if (priority === 'alta') return 30;
  if (priority === 'media') return 20;
  return 10;
}

function generateStudyPlan(tasks) {
  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  
  if (incompleteTasks.length === 0) {
    return {
      title: "🎉 ¡Felicidades!",
      summary: "Has completado todas tus tareas. ¡Tómate un merecido descanso!",
      plan: [],
      totalStudyTime: "0 minutos",
      totalBreakTime: "0 minutos",
      totalTime: "0 minutos",
      completedTasks: completedTasks.length,
      pendingTasks: 0,
      quote: "El descanso también es parte del éxito. 🌟",
      tip: "¡Excelente trabajo! Sigue así."
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
      recomendacion = "⚠️ Prioridad ALTA - Haz esto PRIMERO. Requiere máxima concentración.";
    } else if (task.priority === 'media') {
      recomendacion = "📌 Prioridad MEDIA - Programa para hoy o mañana.";
    } else {
      recomendacion = "✅ Prioridad BAJA - Puedes hacerlo cuando tengas tiempo.";
    }
    
    if (task.text.toLowerCase().includes('parcial') || task.text.toLowerCase().includes('examen')) {
      recomendacion = "🎯 ¡ES UN PARCIAL/EXAMEN! Esto es prioritario. Dedícale el tiempo necesario y repasa con anticipación.";
    }
    
    if (task.text.toLowerCase().includes('workshop') || task.text.toLowerCase().includes('taller')) {
      recomendacion = "🔧 Es un taller/workshop. Requiere práctica activa y atención.";
    }
    
    return {
      step: index + 1,
      task: task.text,
      subject: task.subject || 'General',
      priority: task.priority,
      studyTime: `${studyMinutes} minutos (${Math.floor(studyMinutes / 60)}h ${studyMinutes % 60}min)`,
      studySeconds: studyMinutes * 60,
      breakTime: `${breakMinutes} minutos`,
      breakSeconds: breakMinutes * 60,
      recommendation: recomendacion,
      order: index
    };
  });

  const totalStudyMinutes = plan.reduce((acc, p) => acc + parseInt(p.studyTime), 0);
  const totalBreakMinutes = plan.reduce((acc, p) => acc + parseInt(p.breakTime), 0);
  const totalMinutes = totalStudyMinutes + totalBreakMinutes;
  const totalHours = Math.floor(totalMinutes / 60);
  const totalRemainingMinutes = totalMinutes % 60;

  return {
    title: "📚 Tu Plan de Estudio Personalizado",
    summary: `Basado en tus ${incompleteTasks.length} tareas pendientes. Sigue este orden:`,
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
    "🌟 Cada día es una nueva oportunidad para acercarte a tus metas."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function getStudyTip() {
  const tips = [
    "Para parciales: estudia en bloques de 2 horas con descansos de 20 minutos",
    "Elimina distracciones (celular en modo avión)",
    "Toma agua cada hora para mantenerte hidratado",
    "Haz resúmenes y mapas mentales para estudiar mejor"
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

app.post('/api/plan', (req, res) => {
  const { tasks } = req.body;
  console.log("📋 Recibidas tareas:", tasks.length);
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'Se requieren tareas válidas' });
  }
  const plan = generateStudyPlan(tasks);
  console.log("📚 Plan generado con tiempos:", plan.plan.map(p => `${p.task}: ${p.studyTime}`));
  res.json(plan);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend funcionando' });
});

app.listen(PORT, () => {
  console.log(`🧠 Backend corriendo en http://localhost:${PORT}`);
});