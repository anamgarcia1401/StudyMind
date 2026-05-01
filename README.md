Aquí tienes el `README.md` **COMPLETO** con TODA la información en UN SOLO TEXTO, listo para copiar y pegar:

---

```markdown
# 📚 StudyMind - Gestión Académica con IA

Aplicación para gestionar tareas, generar planes de estudio con IA y temporizador Pomodoro.

---

## 🌐 OPCIÓN 1: VERLA ONLINE (La más fácil)

**https://studymind-frontend-arwr.onrender.com**

> ⚠️ La primera vez puede tardar 20-30 segundos en cargar. Solo espera.

---

## 💻 OPCIÓN 2: EJECUTARLA LOCALMENTE

### 📌 Requisito (solo una vez)

Instalar **Node.js** desde: https://nodejs.org/

---

### 🚀 COMANDOS (copia y pega EN ORDEN)

**Abre DOS terminales**

---

**TERMINAL 1 (BACKEND) - Copia y pega todo esto:**

```bash
cd backend
npm install
node server.js
```

✅ Cuando veas `🧠 Backend corriendo en http://localhost:3001` sigue con la TERMINAL 2

---

**TERMINAL 2 (FRONTEND) - Copia y pega todo esto:**

```bash
cd client
npm install
npm run dev
```

✅ Cuando veas `Local: http://localhost:5173` abre tu navegador

---

**ABRE TU NAVEGADOR Y VE A:**

```
http://localhost:5173
```

---

## 🎯 CÓMO USARLA

1. Ve a **"Tasks"** → escribe una tarea, selecciona prioridad (Alta/Media/Baja) y materia
2. Haz clic en **"+ Nueva tarea"** para agregarla
3. Repite para varias tareas
4. Haz clic en **"🤖 Generar plan de estudio con IA"**
5. Ve a **"Focus"** → verás el plan con los tiempos de estudio y descanso
6. Usa los botones: ▶️ Play, ⏸️ Pausa, 🔄 Reiniciar, ✅ Completar tarea
7. En **"Notes"** puedes escribir notas y convertirlas en tareas
8. En **"Stats"** ves tu progreso y estadísticas

---

## 🔊 EL SONIDO

- En PC: Alarma FUERTE de 10 segundos cuando termina el tiempo
- En móvil: Beep simple
- Si no escuchas sonido: **haz clic en cualquier parte de la pantalla** para activar el audio
- También hay un botón "🔊 Sonido ON/OFF" para silenciar

---

## ⚠️ ERRORES COMUNES Y SOLUCIONES

| Problema | Solución |
|----------|----------|
| `npm not found` o `node no se reconoce` | Instala Node.js desde https://nodejs.org/ |
| `Cannot find module 'express'` | En terminal 1: `cd backend` → `npm install` |
| `El plan no se genera` | Verifica que el backend esté corriendo en `http://localhost:3001` |
| `Puerto 3001 en uso` | Cierra otros programas o reinicia la computadora |
| `Puerto 5173 en uso` | En terminal 2 usa: `npm run dev -- --port 5174` |
| `La pantalla se ve en blanco` | Espera unos segundos o recarga la página |
| `El sonido no funciona` | Haz clic en cualquier parte de la pantalla |

---

## 📱 COMPATIBILIDAD

| Dispositivo | Funciona |
|-------------|----------|
| Windows PC | ✅ Sí |
| Mac | ✅ Sí |
| Linux | ✅ Sí |
| Android/iOS | ✅ Sí (tamaño adaptado) |

---

## 📁 ESTRUCTURA DEL PROYECTO

```
StudyMind/
├── backend/
│   ├── server.js       # API que genera los planes de estudio
│   └── package.json
├── client/
│   ├── src/
│   │   ├── pages/      # Home, Tasks, Notes, Pomodoro, Stats
│   │   ├── components/ # Navbar
│   │   └── App.tsx
│   └── package.json
└── README.md
```

---

## 🧠 CÓMO FUNCIONA LA IA

La IA analiza el texto de cada tarea y asigna tiempos según palabras clave:

| Palabra clave | Tiempo asignado |
|---------------|-----------------|
| parcial, examen, final | 3.5 horas (210 min) |
| proyecto, trabajo final | 3.5 horas (210 min) |
| taller, workshop | 2.5 horas (150 min) |
| Prioridad Alta | 3 horas (180 min) |
| Prioridad Media | 2.5 horas (150 min) |
| Prioridad Baja | 1.5 horas (90 min) |

Luego genera un plan ordenado por prioridad, con tiempos de estudio y descanso, y lo envía al temporizador Pomodoro.

---

## ✅ FUNCIONALIDADES COMPLETAS

| Función | Descripción |
|---------|-------------|
| ✅ Gestor de tareas | Crear, editar, eliminar, marcar completadas |
| ✅ Prioridades | Alta, Media, Baja |
| ✅ Materias | Asignar materia a cada tarea |
| ✅ IA Generadora de planes | Plan personalizado según texto y prioridad |
| ✅ Temporizador Pomodoro | Estudio + descanso, modo demo rápido |
| ✅ Alarma | 10 segundos de duración (PC) o beep (móvil) |
| ✅ Notificaciones | En PC: alertas cuando termina el tiempo |
| ✅ Notas | Notas con colores, convertir a tareas |
| ✅ Estadísticas | Progreso, productividad por prioridad, racha de estudio |
| ✅ Persistencia | Todo se guarda en localStorage |
| ✅ Responsive | Funciona en PC, tablet y móvil |

---

## 👩‍💻 DESARROLLADO POR

Ana García - Sofía Acosta - Sara Grijalba - Valery Bravo (Abril y Mayo 2026)
