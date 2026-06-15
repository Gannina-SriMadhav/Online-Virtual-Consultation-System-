export const getNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem('medconnect_notifications') || '[]');
  } catch {
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
  } catch {
    console.error("Failed to mark notifications as read");
  }
};

export const clearNotifications = () => {
  try {
    localStorage.setItem('medconnect_notifications', '[]');
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
  addNotification(`📧 Email Sent: ${subject}`, `To: ${toEmail}\n\n${body}`, 'info');
};

/**
 * Simulates sending an SMS notification.
 * Logs to the console and adds an in-app log entry.
 */
export const sendSimulatedSMS = (toPhone, message) => {
  console.log(`[SIMULATED SMS SENT] To: ${toPhone} | Message: ${message}`);
  addNotification(`📱 SMS Sent`, `To: ${toPhone}\n\n${message}`, 'info');
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
  sendSimulatedSMS(userPhone, smsText);
};

/**
 * Helper to dispatch SMS verification codes.
 */
export const sendOTPVerificationSMS = (userPhone, code) => {
  const smsText = `MedConnect Secure: Your Two-Factor Authentication (2FA) verification code is ${code}. Valid for 5 minutes.`;
  sendSimulatedSMS(userPhone, smsText);
};

/**
 * Helper to dispatch SMS consultation reminders.
 */
export const sendConsultationReminderSMS = (userPhone, doctorName, dateTime) => {
  const smsText = `MedConnect Reminder: Your consultation with Dr. ${doctorName} starts soon on ${new Date(dateTime).toLocaleString()}. Join via your portal.`;
  sendSimulatedSMS(userPhone, smsText);
};
