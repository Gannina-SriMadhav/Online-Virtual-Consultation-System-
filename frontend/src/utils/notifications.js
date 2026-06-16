export const getNotifications = (email) => {
  const key = email ? `medconnect_notifications_${email}` : 'medconnect_notifications_general';
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

export const addNotification = (title, message, type = 'info', email = null) => {
  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title,
    message,
    type, // 'info', 'success', 'warning', 'error'
    timestamp: new Date().toISOString(),
    read: false
  };

  const key = email || localStorage.getItem('userEmail') || 'general';
  const storageKey = `medconnect_notifications_${key}`;

  try {
    const list = getNotifications(key);
    list.unshift(newNotif);
    localStorage.setItem(storageKey, JSON.stringify(list.slice(0, 50)));
    
    // Dispatch custom event for real-time update in active UI components
    window.dispatchEvent(new Event('medconnect_notification_update'));
  } catch (e) {
    console.error("Failed to write notification", e);
  }
};

export const markAllAsRead = (email) => {
  const key = email ? `medconnect_notifications_${email}` : 'medconnect_notifications_general';
  try {
    const list = getNotifications(email).map(n => ({ ...n, read: true }));
    localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new Event('medconnect_notification_update'));
  } catch {
    console.error("Failed to mark notifications as read");
  }
};

export const clearNotifications = (email) => {
  const key = email ? `medconnect_notifications_${email}` : 'medconnect_notifications_general';
  try {
    localStorage.setItem(key, '[]');
    window.dispatchEvent(new Event('medconnect_notification_update'));
  } catch {
    console.error("Failed to clear notifications");
  }
};

// SIMULATED NOTIFICATION CHANNELS (EMAIL & SMS)

/**
 * Simulates sending an Email notification.
 * Logs to the console and adds an in-app log entry so the user can see it.
 */
export const sendSimulatedEmail = (toEmail, subject, body) => {
  console.log(`[SIMULATED EMAIL SENT] To: ${toEmail} | Subject: ${subject}`);
  addNotification(`📧 Email Sent: ${subject}`, `To: ${toEmail}\n\n${body}`, 'info', toEmail);
};

/**
 * Simulates sending an SMS notification.
 * Logs to the console and adds an in-app log entry.
 */
export const sendSimulatedSMS = (toPhone, message, toEmail = null) => {
  console.log(`[SIMULATED SMS SENT] To: ${toPhone} | Message: ${message}`);
  addNotification(`📱 SMS Sent`, `To: ${toPhone}\n\n${message}`, 'info', toEmail);
};

/**
 * Helper to dispatch appointment email notifications.
 */
export const notifyAppointmentBooked = (userEmail, doctorName, date, slot) => {
  const subject = "MedConnect - Appointment Confirmed";
  const body = `Hello,\n\nYour virtual appointment with Dr. ${doctorName} has been booked successfully.\n\nDate: ${date}\nTime Slot: ${slot}\n\nThank you for choosing MedConnect!`;
  sendSimulatedEmail(userEmail, subject, body);
};

/**
 * Helper to dispatch cancellation email notifications.
 */
export const notifyAppointmentCancelled = (userEmail, date, doctorName) => {
  const subject = "MedConnect - Appointment Cancelled";
  const body = `Hello,\n\nYour virtual appointment scheduled for ${date} with Dr. ${doctorName} has been cancelled successfully.\n\nIf this was a mistake, please visit the dashboard to reschedule.`;
  sendSimulatedEmail(userEmail, subject, body);
};

/**
 * Helper to dispatch prescription email and SMS notifications.
 */
export const notifyPrescriptionIssued = (userEmail, userPhone, doctorName, legitCode) => {
  // Send Email
  const subject = "MedConnect - Prescription Issued";
  const body = `Hello,\n\nDr. ${doctorName} has issued a digital prescription for you.\n\nYour secure Handover Verification Code is: ${legitCode}.\n\nPlease share this code with the dispensing pharmacist to claim your medicine.`;
  sendSimulatedEmail(userEmail, subject, body);

  // Send SMS
  const smsText = `MedConnect: Dr. ${doctorName} issued a prescription. Your secure Handover Code is: ${legitCode}. Keep it private until claim.`;
  sendSimulatedSMS(userPhone, smsText, userEmail);
};

/**
 * Helper to dispatch SMS verification codes.
 */
export const sendOTPVerificationSMS = (userPhone, code, userEmail = null) => {
  const smsText = `MedConnect Secure: Your Two-Factor Authentication (2FA) verification code is ${code}. Valid for 5 minutes.`;
  sendSimulatedSMS(userPhone, smsText, userEmail);
};

/**
 * Helper to dispatch SMS consultation reminders.
 */
export const sendConsultationReminderSMS = (userPhone, doctorName, dateTime, userEmail = null) => {
  const smsText = `MedConnect Reminder: Your consultation with Dr. ${doctorName} starts soon on ${new Date(dateTime).toLocaleString()}. Join via your portal.`;
  sendSimulatedSMS(userPhone, smsText, userEmail);
};
