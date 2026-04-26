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
  { name: "Amarillo", value: "bg-yellow-300", textColor: "text-yellow-800", border: "border-yellow-400" },
  { name: "Rosa", value: "bg-pink-300", textColor: "text-pink-800", border: "border-pink-400" },
  { name: "Verde", value: "bg-green-300", textColor: "text-green-800", border: "border-green-400" },
  { name: "Azul", value: "bg-blue-300", textColor: "text-blue-800", border: "border-blue-400" },
  { name: "Morado", value: "bg-purple-300", textColor: "text-purple-800", border: "border-purple-400" },
  { name: "Naranja", value: "bg-orange-300", textColor: "text-orange-800", border: "border-orange-400" },
  { name: "Cian", value: "bg-cyan-300", textColor: "text-cyan-800", border: "border-cyan-400" },
  { name: "Rojo", value: "bg-red-300", textColor: "text-red-800", border: "border-red-400" },
];

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("notes");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
        } else {
          setNotes([]);
        }
      }
    } catch {
      setNotes([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
    window.dispatchEvent(new Event("notesUpdated"));
  }, [notes]);

  // Cerrar selector de colores al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      if (showColorPicker) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showColorPicker]);

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
    
    // 🔥 Disparar eventos para que Tasks se actualice
    window.dispatchEvent(new Event("tasksUpdated"));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("planUpdate"));
    
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
    <div className="text-white space-y-5 animate-fadeIn pb-4">
      
      {/* Título */}
      <div className="flex items-center gap-2">
        <StickyNote className="w-5 h-5 text-yellow-400" />
        <h1 className="text-xl font-bold">Mis Notas</h1>
        <span className="text-xs text-white/40">{notes.length} notas</span>
      </div>

      {/* Formulario para agregar nota - CORREGIDO z-index */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="📝 Escribe tu nota aquí..."
          rows={3}
          className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-yellow-500 resize-none"
        />
        
        {/* Selector de color - CON z-index ALTO */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2 relative">
          <div className="relative z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${selectedColor.value} ${selectedColor.textColor}`}
            >
              <span className="w-3 h-3 rounded-full bg-current" />
              {selectedColor.name}
              <span className="text-xs">▼</span>
            </button>
            
            {showColorPicker && (
              <div 
                className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 rounded-xl shadow-2xl z-[100] grid grid-cols-4 gap-1 w-48 border border-white/20"
                style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '8px' }}
              >
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColor(color);
                      setShowColorPicker(false);
                    }}
                    className={`w-10 h-10 rounded-lg ${color.value} hover:scale-110 transition transform`}
                    title={color.name}
                  />
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={addNote}
            disabled={!input.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Agregar nota
          </button>
        </div>
      </div>

      {/* Lista de notas - CON z-index bajo para que el selector quede arriba */}
      <div className="grid grid-cols-2 gap-3 relative z-0">
        {notes.length === 0 ? (
          <div className="col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center border border-white/20">
            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-3 opacity-50" />
            <p className="text-white/50">No hay notas aún</p>
            <p className="text-xs text-white/30 mt-1">Escribe algo y aparecerá aquí</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`${note.color} rounded-xl p-3 shadow-lg transition-all duration-200 hover:scale-102 hover:shadow-xl animate-fadeIn`}
            >
              {editingNoteId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full bg-white/50 rounded-lg px-2 py-1 text-gray-800 text-sm resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(note.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="min-h-[80px]">
                    <p className="text-gray-800 text-sm break-words whitespace-pre-wrap">
                      {note.text}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-black/10">
                    <div className="flex gap-2">
                      <button
                        onClick={() => convertToTask(note)}
                        className="text-xs text-gray-700 hover:text-gray-900 flex items-center gap-1 transition"
                        title="Convertir a tarea"
                      >
                        <CheckSquare className="w-3 h-3" />
                        Tarea
                      </button>
                      <button
                        onClick={() => startEditing(note)}
                        className="text-xs text-gray-700 hover:text-gray-900 flex items-center gap-1 transition"
                        title="Editar nota"
                      >
                        <Edit2 className="w-3 h-3" />
                        Editar
                      </button>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-xs text-red-700 hover:text-red-900 flex items-center gap-1 transition"
                      title="Borrar nota"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="mt-2 text-[9px] text-gray-600/70">
                    {note.createdAt !== note.updatedAt ? `Editado: ${note.updatedAt}` : `Creado: ${note.createdAt}`}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Consejo */}
      <div className="bg-purple-900/30 rounded-xl p-3 text-center">
        <p className="text-[10px] text-white/50">
          💡 Las notas se guardan automáticamente. Puedes convertirlas en tareas con un clic.
        </p>
      </div>

    </div>
  );
}