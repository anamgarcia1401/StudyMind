import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Notes from "./pages/Notes";
import Pomodoro from "./pages/Pomodoro";
import Stats from "./pages/Stats";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900 p-4">
        {/* Contenedor estilo iPhone */}
        <div className="w-[380px] h-[700px] bg-black/30 backdrop-blur-xl rounded-[50px] border border-white/20 shadow-2xl flex flex-col overflow-hidden relative">
          
          {/* Header */}
          <div className="pt-8 pb-3 px-4 text-white font-bold text-center bg-black/20">
            <h1 className="text-xl tracking-tight">StudyMind</h1>
            <p className="text-[10px] text-gray-400">Gestiona tus tareas y emociones</p>
          </div>

          {/* Contenido principal - CORREGIDO */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/pomodoro" element={<Pomodoro />} />
              <Route path="/stats" element={<Stats />} />
            </Routes>
          </div>

          {/* Navbar */}
          <Navbar />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;