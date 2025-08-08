"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Vendor {
  id: string;
  name: string;
  category: string;
  status: 'suggested' | 'contacted' | 'responded' | 'selected' | 'rejected';
}

interface Task {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
}

// Placeholder event details. In a real app these would come from state or Supabase.
const exampleEvent = {
  type: 'Wedding',
  date: new Date(new Date().getFullYear(), new Date().getMonth() + 6, 1),
  budget: 20000,
};

const initialVendors: Vendor[] = [
  { id: '1', name: 'Garden Venue', category: 'venue', status: 'suggested' },
  { id: '2', name: 'Tasty Catering', category: 'catering', status: 'contacted' },
  { id: '3', name: 'Snap Photography', category: 'photography', status: 'responded' },
  { id: '4', name: 'Bloom Florist', category: 'flowers', status: 'selected' },
];

const initialTasks: Task[] = [
  { id: 'task1', title: 'Book venue', dueDate: new Date(exampleEvent.date.getFullYear(), exampleEvent.date.getMonth() - 6, exampleEvent.date.getDate()), completed: false },
  { id: 'task2', title: 'Finalize catering', dueDate: new Date(exampleEvent.date.getFullYear(), exampleEvent.date.getMonth() - 4, exampleEvent.date.getDate()), completed: false },
  { id: 'task3', title: 'Send invitations', dueDate: new Date(exampleEvent.date.getFullYear(), exampleEvent.date.getMonth() - 2, exampleEvent.date.getDate()), completed: false },
];

export default function DashboardPage() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Example handler to toggle task completion
  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  // Count vendors by status
  const vendorCounts = vendors.reduce(
    (acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    },
    {} as Record<Vendor['status'], number>,
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Event Dashboard</h1>

      {/* Event Summary */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Event Summary</h2>
        <p>Type: {exampleEvent.type}</p>
        <p>Date: {exampleEvent.date.toLocaleDateString()}</p>
        <p>Budget: ${exampleEvent.budget.toLocaleString()}</p>
      </div>

      {/* Vendor Pipeline */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Vendor Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['suggested', 'contacted', 'responded', 'selected'] as const).map((status) => (
            <div key={status} className="border rounded p-3 text-center">
              <p className="font-medium capitalize">{status}</p>
              <p className="text-2xl font-bold">{vendorCounts[status] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Planning Tasks */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Planning Checklist</h2>
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="mr-3"
                />
                <span className={task.completed ? 'line-through text-gray-500' : ''}>{task.title}</span>
              </div>
              <span className="text-sm text-gray-600">{task.dueDate.toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Link to Vendor Management */}
      <div className="mt-4">
        <Link href="/vendors" className="text-blue-600 underline">Go to Vendor Management</Link>
      </div>
    </div>
  );
}
