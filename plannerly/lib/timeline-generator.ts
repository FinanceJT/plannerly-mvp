/**
 * Timeline generator for event planning tasks. Given an event date, this
 * module produces a list of tasks with due dates working backwards from
 * the event. Tasks can then be displayed in a timeline UI.
 */
export interface TimelineTask {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
}

// Default timeline definitions in months before the event.
const defaultTimeline: { monthsBefore: number; title: string }[] = [
  { monthsBefore: 6, title: 'Book venue' },
  { monthsBefore: 4, title: 'Finalize catering' },
  { monthsBefore: 3, title: 'Book photographer' },
  { monthsBefore: 2, title: 'Send invitations' },
  { monthsBefore: 1, title: 'Confirm vendors' },
  { monthsBefore: 0, title: 'Event day' },
];

/**
 * Generates a timeline based on the event date.
 * @param eventDate The date of the event
 */
export function generateTimeline(eventDate: Date): TimelineTask[] {
  return defaultTimeline.map((item, idx) => {
    const due = new Date(eventDate);
    due.setMonth(eventDate.getMonth() - item.monthsBefore);
    return {
      id: `task-${idx}`,
      title: item.title,
      dueDate: due,
      completed: false,
    };
  });
}

/**
 * Updates the completion status of a timeline task.
 */
export function toggleTimelineTask(tasks: TimelineTask[], id: string): TimelineTask[] {
  return tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
}
