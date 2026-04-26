import { useState, useEffect } from "react";
import { Plus, Trash2, CheckSquare, X, Edit2, Save, Sparkles, StickyNote } from "lucide-react";

type Note = {
  id: string;
  text: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

const colorOptions = [
  { name: "Amarillo", value: "bg-yellow-300", textColor: "text-yellow-800" },
  { name: "Rosa", value: "bg-pink-300", textColor: "text-pink-800" },
  { name: "Verde", value: "bg-green-300", textColor: "text-green-800" },
  { name: "Azul", value: "bg-blue-300", textColor: "text-blue-800" },
  { name: "Morado", value: "bg-purple-300", textColor: "text-purple-800" },
  { name: "Naranja", value: "bg-orange-300", textColor: "text-orange-800" },
];

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Cargar notas SOLO al inicio
  useEffect(() => {
    const saved = localStorage.getItem("notes");
    console.log("📋 Cargando notas al inicio:", saved);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
        }
      } catch (e) {
        console.error("Error cargando notas:", e);
      }
    }
  }, []);

  // Guardar notas CADA VEZ que cambian
  useEffect(() => {
    console.log("💾 Guardando notas en localStorage:", notes.length);
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // Recargar notas cuando la pestaña recibe foco
  useEffect(() => {
    const handleFocus = () => {
      console.log("🔄 Recargando notas por foco");
      const saved = localStorage.getItem("notes");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setNotes(parsed);
          }
        } catch (e) {
          console.error("Error recargando notas:", e);
        }
      }
    };
    
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const addNote = () => {
    if (!input.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      text: input,
      color: selectedColor.value,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };
    setNotes([newNote, ...notes]);
    setInput("");
    setSelectedColor(colorOptions[0]);
    setShowColorPicker(false);
  };

  const deleteNote = (id: string) => {
    if (window.confirm("¿Eliminar esta nota?")) {
      setNotes(notes.filter((note) => note.id !== id));
    }
  };

  const convertToTask = (note: Note) => {
    try {
      const saved = JSON.parse(localStorage.getItem("tasks") || "[]");
      const newTask = {
        text: note.text,
        completed: false,
        priority: "media",
        subject: "Nota",
      };
      const updated = [...saved, newTask];
      localStorage.setItem("tasks", JSON.stringify(updated));
      window.dispatchEvent(new Event("tasksUpdated"));
      alert(`✅ "${note.text.substring(0, 50)}" se ha convertido en tarea`);
    } catch (error) {
      alert("Error al convertir la nota a tarea");
    }
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
  };

  const saveEdit = (id: string) => {
    if (!editingText.trim()) return;
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, text: editingText, updatedAt: new Date().toLocaleString() }
        : note
    ));
    setEditingNoteId(null);
    setEditingText("");
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditingText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  };

  return (
    <div className="text-white space-y-5 pb-4">
      
      <div className="flex items-center gap-2">
        <StickyNote className="w-5 h-5 text-yellow-400" />
        <h1 className="text-xl font-bold">Mis Notas</h1>
        <span className="text-xs text-white/40">{notes.length} notas</span>
      </div>

      {/* Formulario */}
      <div className="bg-white/10 rounded-xl p-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="📝 Escribe tu nota aquí..."
          rows={3}
          className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-yellow-500 resize-none"
        />
        
        <div className="flex items-center justify-between mt-3">
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${selectedColor.value} ${selectedColor.textColor}`}
            >
              <span className="w-3 h-3 rounded-full bg-current" />
              {selectedColor.name}
            </button>
            {showColorPicker && (
              <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 rounded-xl shadow-2xl z-50 grid grid-cols-3 gap-1 w-36">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color);
                      setShowColorPicker(false);
                    }}
                    className={`w-10 h-10 rounded-lg ${color.value} hover:scale-110 transition`}
                    title={color.name}
                  />
                ))}
              </div>
            )}
          </div>
          <button
            onClick={addNote}
            disabled={!input.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1.5 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Agregar
          </button>
        </div>
      </div>

      {/* Lista de notas */}
      <div className="grid grid-cols-2 gap-3">
        {notes.length === 0 && (
          <div className="col-span-2 bg-white/10 rounded-xl p-8 text-center">
            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-3 opacity-50" />
            <p className="text-white/50">No hay notas aún</p>
            <p className="text-xs text-white/30 mt-1">Escribe algo y aparecerá aquí</p>
          </div>
        )}
        {notes.map((note) => (
          <div key={note.id} className={`${note.color} rounded-xl p-3 shadow-lg`}>
            {editingNoteId === note.id ? (
              <div>
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="w-full bg-white/50 rounded-lg px-2 py-1 text-gray-800 text-sm resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => saveEdit(note.id)} className="bg-green-500 text-white px-2 py-1 rounded text-xs">Guardar</button>
                  <button onClick={cancelEdit} className="bg-gray-500 text-white px-2 py-1 rounded text-xs">Cancelar</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-800 text-sm break-words whitespace-pre-wrap min-h-[60px]">
                  {note.text}
                </p>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-black/10">
                  <div className="flex gap-2">
                    <button onClick={() => convertToTask(note)} className="text-xs text-gray-700 hover:text-gray-900">Tarea</button>
                    <button onClick={() => startEditing(note)} className="text-xs text-gray-700 hover:text-gray-900">Editar</button>
                  </div>
                  <button onClick={() => deleteNote(note.id)} className="text-xs text-red-700 hover:text-red-900">Eliminar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}