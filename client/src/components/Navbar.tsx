import { Link, useLocation } from "react-router-dom";
import { Home, CheckSquare, StickyNote, Clock, BarChart3 } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Inicio" },
    { path: "/tasks", icon: CheckSquare, label: "Tareas" },
    { path: "/notes", icon: StickyNote, label: "Notas" },
    { path: "/pomodoro", icon: Clock, label: "Focus" },
    { path: "/stats", icon: BarChart3, label: "Stats" },
  ];

  return (
    <div className="bg-black/80 backdrop-blur-lg border-t border-white/10 py-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all ${
                isActive ? "text-purple-400" : "text-gray-400"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}