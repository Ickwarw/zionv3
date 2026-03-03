import { useState, useEffect } from 'react';
import { tasksService } from '../../../services/api';
import { toast } from 'sonner';
import { Task, TaskCategory, TaskPriority, TaskStatistics, TaskStatus } from '../types/tarefas.types';


export const useTarefas = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [priorities, setPriorities] = useState<TaskPriority[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks
  const fetchTasks = async (params?: any) => {
    try {
      setLoading(true);
      const response = await tasksService.getTasks(params);
      setTasks(response.data.tasks);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch task statistics
  const fetchStatistics = async () => {
    try {
      const response = await tasksService.getTaskStatistics();
      setStatistics(response.data);
    } catch (err: any) {
      console.error('Failed to fetch task statistics:', err);
    }
  };

  // Create task
  const createTask = async (taskData: Partial<Task>) => {
    try {
      const response = await tasksService.createTask(taskData);
      setTasks(prev => [response.data.task, ...prev]);
      toast.success('Task created successfully');
      return response.data.task;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create task';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update task
  const updateTask = async (id: number, taskData: Partial<Task>) => {
    try {
      const response = await tasksService.updateTask(id, taskData);
      setTasks(prev => prev.map(task => 
        task.id === id ? response.data.task : task
      ));
      toast.success('Task updated successfully');
      return response.data.task;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update task';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete task
  const deleteTask = async (id: number) => {
    try {
      await tasksService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Task deleted successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete task';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Create task category
  const createCategory = async (name: string, color: string) => {
    try {
      const response = await tasksService.createTaskCategory(name, color);
      setCategories(prev => [...prev, response.data.category]);
      toast.success('Category created successfully');
      return response.data.category;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create category';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const filterTask = async (activeTab) => {
    if (activeTab == 'todas') return tasks;
    return tasks.filter((task) => {
      task.status == activeTab
    });
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchTasks(),
        // fetchStatuses(),
        // fetchPriorities(),
        // fetchCategories(),
        // fetchStatistics()
      ]);
    };

    initializeData();
  }, []);

  return {
    tasks,
    statuses,
    priorities,
    categories,
    statistics,
    loading,
    error,
    filterTask,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    createCategory,
    refreshData: (taskFilter) => {
      fetchTasks(taskFilter);
      fetchStatistics();
    }
  };
};