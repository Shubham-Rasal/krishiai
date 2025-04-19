import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the task priority enum
export enum TaskPriority {
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}

// Define the task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  stage: string;
  priority: TaskPriority;
  dueDate?: Date | null;
  isCompleted: boolean;
  completedAt?: Date | null;
  estimatedDuration?: string;
  tools?: string[];
  notes?: string;
  fieldCode?: string;
  time?: string;
  status?: 'On-Progress' | 'Not-Started';
}

// Define the context type
interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  getTasksByStage: (stage: string) => Task[];
  getCompletedTasks: () => Task[];
  getPendingTasks: () => Task[];
}

// Create the context
export const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider props
interface TaskProviderProps {
  children: ReactNode;
}

// Initial demo tasks for first-time users
const initialDemoTasks: Task[] = [
  {
    id: '1',
    title: 'Soil preparation for wheat',
    description: 'Prepare the soil by removing weeds and ensuring proper aeration',
    stage: 'pre-planting',
    priority: TaskPriority.High,
    isCompleted: false,
    estimatedDuration: '120',
    fieldCode: 'F001',
    tools: ['Tractor', 'Plough'],
    notes: 'Ensure the soil is well drained'
  },
  {
    id: '2',
    title: 'Apply fertilizer',
    description: 'Apply NPK fertilizer as per recommended dosage',
    stage: 'pre-planting',
    priority: TaskPriority.Medium,
    isCompleted: false,
    estimatedDuration: '60',
    fieldCode: 'F001',
    tools: ['Spreader', 'Protective gear'],
    notes: 'Use organic fertilizer if available'
  },
  {
    id: '3',
    title: 'Plant wheat seeds',
    description: 'Sow wheat seeds at appropriate spacing',
    stage: 'planting',
    priority: TaskPriority.High,
    isCompleted: false,
    estimatedDuration: '180',
    fieldCode: 'F001',
    tools: ['Seed drill', 'Seeds'],
    notes: 'Ensure 2-3 cm depth for proper germination'
  },
  {
    id: '4',
    title: 'Irrigation scheduling',
    description: 'Set up and monitor irrigation schedule for wheat field',
    stage: 'growth',
    priority: TaskPriority.High,
    isCompleted: false,
    estimatedDuration: '45',
    fieldCode: 'F001',
    tools: ['Irrigation pipes', 'Timer'],
    notes: 'Water early morning or late evening'
  },
  {
    id: '5',
    title: 'Pest monitoring',
    description: 'Check for pests and diseases in the wheat field',
    stage: 'growth',
    priority: TaskPriority.Medium,
    isCompleted: false,
    estimatedDuration: '30',
    fieldCode: 'F001',
    tools: ['Magnifying glass', 'Notebook'],
    notes: 'Particularly watch for aphids and rust'
  }
];

// Provider component
export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Load tasks from AsyncStorage
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          setTasks(parsedTasks);
        } else {
          // If no tasks exist, set demo tasks
          setTasks(initialDemoTasks);
        }
        
        setInitialDataLoaded(true);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTasks(initialDemoTasks); // Fallback to demo tasks
        setInitialDataLoaded(true);
      }
    };

    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever they change
  useEffect(() => {
    if (initialDataLoaded) {
      const saveTasks = async () => {
        try {
          await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
        } catch (error) {
          console.error('Error saving tasks:', error);
        }
      };

      saveTasks();
    }
  }, [tasks, initialDataLoaded]);

  // Add a new task
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  // Update an existing task
  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, ...updatedTask } : task
      )
    );
  };

  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  // Toggle task completion status
  const toggleTaskCompletion = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id
          ? {
              ...task,
              isCompleted: !task.isCompleted,
              completedAt: !task.isCompleted ? new Date() : undefined,
            }
          : task
      )
    );
  };

  // Get tasks by stage
  const getTasksByStage = (stage: string) => {
    return tasks.filter(task => task.stage === stage);
  };

  // Get completed tasks
  const getCompletedTasks = () => {
    return tasks.filter(task => task.isCompleted);
  };

  // Get pending tasks
  const getPendingTasks = () => {
    return tasks.filter(task => !task.isCompleted);
  };

  // Context value
  const contextValue: TaskContextType = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTasksByStage,
    getCompletedTasks,
    getPendingTasks,
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use the task context
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}; 