// TypeScript declarations for tasks.ts

import { Task } from '../types';

export interface TaskFilters {
  status?: string;
  categoryId?: string;
  cityId?: string;
  areaId?: string;
  userId?: string;
  userLat?: number;
  userLon?: number;
}

export interface TaskResult {
  success: boolean;
  taskId?: string;
  error?: string;
}

export function getTasks(filters?: TaskFilters): Promise<Task[]>;

export function getTaskById(taskId: string): Promise<Task>;

export function createTask(
  task: {
    title: string;
    description: string;
    categoryId: string | number;
    cityId: string;
    areaId: string;
    latitude?: number;
    longitude?: number;
    budgetMin?: number;
    budgetMax?: number;
    price?: number;
    isNegotiable?: boolean;
    timeWindow?: string;
    exactLocation?: string;
    phone?: string;
    whatsapp?: string;
    hasWhatsapp?: boolean;
  },
  userId: string
): Promise<TaskResult>;

export function updateTask(
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    categoryId?: string | number;
    cityId?: string;
    areaId?: string;
    latitude?: number;
    longitude?: number;
    budgetMin?: number;
    budgetMax?: number;
    status?: string;
  }
): Promise<Task>;

export function editTask(
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    categoryId?: string | number;
    cityId?: string;
    areaId?: string;
    latitude?: number;
    longitude?: number;
    budgetMin?: number;
    budgetMax?: number;
    price?: number;
    isNegotiable?: boolean;
    timeWindow?: string;
    exactLocation?: string;
    phone?: string;
    whatsapp?: string;
    hasWhatsapp?: boolean;
  }
): Promise<TaskResult>;

export function updateTaskStatus(
  taskId: string,
  status: 'open' | 'negotiating' | 'accepted' | 'in_progress' | 'completed' | 'cancelled',
  helperId?: string
): Promise<Task>;

export function acceptTask(taskId: string, helperId: string): Promise<Task>;

export function cancelTask(taskId: string): Promise<TaskResult>;

export function completeTask(taskId: string): Promise<TaskResult>;

export function getUserActiveTasks(userId: string): Promise<Task[]>;

export function getMyTasks(userId: string): Promise<Task[]>;

export function getAllTasks(filters?: TaskFilters): Promise<Task[]>;

export function deleteTask(taskId: string, userId: string): Promise<void>;

export function startTask(taskId: string, helperId: string): Promise<Task>;

export function closeTask(taskId: string, adminNotes?: string): Promise<TaskResult>;
