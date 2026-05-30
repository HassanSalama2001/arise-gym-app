import { playNotificationSound } from './audio';
import db from '../db/db';
import { getToday } from './date';

// Request notification permission from user
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

// Fire a standard HTML5 notification and play synthesized sound
export function triggerNotification(title, body) {
  // Try playing sound first (browser may block if no user interaction yet, but normally okay since user interacts with the app)
  playNotificationSound();

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/pwa-192x192.png', // Fallback or PWA standard icon
        tag: 'arise-notification',
        requireInteraction: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.error('Failed to instantiate Web Notification:', e);
      // Fallback: Web service workers showNotification
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body,
            icon: '/pwa-192x192.png',
            tag: 'arise-notification'
          });
        });
      }
    }
  }
}

// Background scheduler for hydration and meal reminders
let reminderInterval = null;

export function startNotificationScheduler() {
  if (reminderInterval) return;

  // Ask for permission on startup
  requestNotificationPermission();

  // Run a check every 10 minutes to verify if we need to remind the user
  const runChecks = async () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const todayStr = getToday();

    // 1. Meal reminders (check if logged by threshold hour)
    // Breakfast: remind at 9:30 AM if no breakfast logged
    if (currentHour === 9 && currentMinute >= 30 && currentMinute < 40) {
      const count = await db.meals.where('date').equals(todayStr).filter(m => m.type === 'breakfast').count();
      if (count === 0) {
        triggerNotification(
          "🍳 Morning Fuel Check",
          "Have you logged your breakfast yet? Fuel your body or tap to see healthy meal-prep suggestions!"
        );
      }
    }

    // Lunch: remind at 2:00 PM if no lunch logged
    if (currentHour === 14 && currentMinute >= 0 && currentMinute < 10) {
      const count = await db.meals.where('date').equals(todayStr).filter(m => m.type === 'lunch').count();
      if (count === 0) {
        triggerNotification(
          "🥗 Midday Nutrition Protocol",
          "Time for lunch! Don't skip meals. Tap to log your lunch or check recipes."
        );
      }
    }

    // Dinner: remind at 8:30 PM if no dinner logged
    if (currentHour === 20 && currentMinute >= 30 && currentMinute < 40) {
      const count = await db.meals.where('date').equals(todayStr).filter(m => m.type === 'dinner').count();
      if (count === 0) {
        triggerNotification(
          "🥩 Recovery Meal Protocol",
          "Sustain your gains! Log your dinner. Tap to view high-protein options."
        );
      }
    }

    // 2. Hydration reminders (every 2 hours between 8 AM and 10 PM)
    // If they haven't logged water in the last 2 hours, alert them.
    if (currentHour >= 8 && currentHour <= 22 && currentHour % 2 === 0 && currentMinute >= 0 && currentMinute < 10) {
      const loggedWater = await db.hydration.where('date').equals(todayStr).toArray();
      const totalWater = loggedWater.reduce((acc, h) => acc + h.amountMl, 0);

      if (totalWater < 3000) {
        triggerNotification(
          "💧 Hydration Level Critical",
          `You've logged ${totalWater}ml today. Drink some water to keep your performance high!`
        );
      }
    }
  };

  // Run checks immediately on start, then set interval
  runChecks();
  reminderInterval = setInterval(runChecks, 10 * 60 * 1000); // 10 minutes
}

export function stopNotificationScheduler() {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
}
