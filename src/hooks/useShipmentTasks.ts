import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ShipmentDocument } from './useShipmentDocuments';

export type TaskStatus = 'Pending' | 'Done';

export interface ShipmentTask {
  id: string;
  shipment_id: string;
  user_id: string;
  title: string;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_TASKS = [
  { title: 'Confirm commercial invoice', docType: 'Commercial_Invoice' },
  { title: 'Confirm packing list', docType: 'Packing_List' },
  { title: 'Upload B/L or AWB', docType: 'Bill_of_Lading' },
  { title: 'Customs clearance prep', docType: null },
  { title: 'Final delivery confirmation', docType: null },
];

export const TASK_DOC_MAPPING: Record<string, string> = {
  'Confirm commercial invoice': 'Commercial_Invoice',
  'Confirm packing list': 'Packing_List',
  'Upload B/L or AWB': 'Bill_of_Lading',
};

export function useShipmentTasks(shipmentId: string | undefined) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ShipmentTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!shipmentId || !user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shipment_tasks')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTasks((data as ShipmentTask[]) || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [shipmentId, user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createDefaultTasks = async () => {
    if (!shipmentId || !user) return false;

    try {
      const tasksToCreate = DEFAULT_TASKS.map(t => ({
        shipment_id: shipmentId,
        user_id: user.id,
        title: t.title,
        status: 'Pending' as TaskStatus,
        due_date: null,
      }));

      const { data, error } = await supabase
        .from('shipment_tasks')
        .insert(tasksToCreate)
        .select();

      if (error) throw error;
      setTasks(data as ShipmentTask[]);
      return true;
    } catch (error) {
      console.error('Error creating default tasks:', error);
      return false;
    }
  };

  const addTask = async (title: string, dueDate?: string) => {
    if (!shipmentId || !user) return null;

    try {
      const { data, error } = await supabase
        .from('shipment_tasks')
        .insert({
          shipment_id: shipmentId,
          user_id: user.id,
          title,
          status: 'Pending' as TaskStatus,
          due_date: dueDate || null,
        })
        .select()
        .single();

      if (error) throw error;
      setTasks(prev => [...prev, data as ShipmentTask]);
      toast.success('Task added');
      return data as ShipmentTask;
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
      return null;
    }
  };

  const toggleTaskStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return false;

    const newStatus: TaskStatus = task.status === 'Pending' ? 'Done' : 'Pending';

    try {
      const { error } = await supabase
        .from('shipment_tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      return true;
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error('Failed to update task');
      return false;
    }
  };

  const updateTaskFromDocuments = async (documents: ShipmentDocument[]) => {
    // Auto-complete tasks when related documents are uploaded/approved
    for (const task of tasks) {
      const mappedDocType = TASK_DOC_MAPPING[task.title];
      if (mappedDocType && task.status === 'Pending') {
        const hasUploadedDoc = documents.some(
          d => d.document_type === mappedDocType && d.status !== 'Missing'
        );
        if (hasUploadedDoc) {
          await toggleTaskStatus(task.id);
        }
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('shipment_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted');
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      return false;
    }
  };

  const openTasksCount = tasks.filter(t => t.status === 'Pending').length;
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'Done' || !t.due_date) return false;
    return new Date(t.due_date) < new Date();
  });

  return {
    tasks,
    loading,
    openTasksCount,
    overdueTasks,
    addTask,
    toggleTaskStatus,
    deleteTask,
    createDefaultTasks,
    updateTaskFromDocuments,
    refetch: fetchTasks,
  };
}
