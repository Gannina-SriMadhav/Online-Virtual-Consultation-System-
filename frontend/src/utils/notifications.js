export const getNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem('medconnect_notifications') || '[]');
  } catch (e) {
    return [];
  }
};

export const addNotification = (title, message, type = 'info') => {
  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title,
    message,
    type, // 'info', 'success', 'warning', 'error'
    timestamp: new Date().toISOString(),
    read: false
  };

  try {
    const list = getNotifications();
    list.unshift(newNotif);
    localStorage.setItem('medconnect_notifications', JSON.stringify(list.slice(0, 50)));
    
    // Dispatch custom event for real-time update in active UI components
    window.dispatchEvent(new Event('medconnect_notification_update'));
  } catch (e) {
    console.error("Failed to write notification", e);
  }
};

export const markAllAsRead = () => {
  try {
    const list = getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem('medconnect_notifications', JSON.stringify(list));
    window.dispatchEvent(new Event('medconnect_notification_update'));
  } catch (e) {}
};

export const clearNotifications = () => {
  try {
    localStorage.setItem('medconnect_notifications', '[]');
    window.dispatchEvent(new Event('medconnect_notification_update'));
  } catch (e) {}
};
