import { createContext, useContext, useEffect, useState } from "react";

export type Task = {
  text: string;
  completed: boolean;
  priority?: 'alta' | 'media' | 'baja';
  subject?: string;
};

type TasksContextType = {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  toggleTask: (index: number) => void;
  deleteTask: (index: number) => void;
};

const TasksContext = createContext<TasksContextType | null>(null);

export const TasksProvider = ({ children }: any) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // 🔥 cargar al inicio
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // 🔥 guardar SIEMPRE
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const toggleTask = (index: number) => {
    setTasks(prev => {
      const copy = [...prev];
      copy[index].completed = !copy[index].completed;
      return copy;
    });
  };

  const deleteTask = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <TasksContext.Provider value={{ tasks, setTasks, addTask, toggleTask, deleteTask }}>
      {children}
    </TasksContext.Provider>
  );
};


export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) throw new Error("useTasks must be used inside TasksProvider");
  return context;
};