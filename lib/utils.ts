// Log a Mind Garden activity from anywhere in the app
export async function logMindGardenActivity(type: 'journal' | 'mood' | 'game' | 'resource' | 'checkin', points: number) {
  try {
    const token = typeof document !== 'undefined'
      ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
      : undefined;
    await fetch('/api/mind-garden/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ type, points }),
    });
  } catch (err) {
    // Optionally handle/log error
    console.error('Failed to log Mind Garden activity:', err);
  }
}
import { format } from 'date-fns';

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}