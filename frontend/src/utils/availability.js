export const DEFAULT_AVAILABILITY = {
  weekly: {
    Monday: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }],
    Tuesday: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }],
    Wednesday: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }],
    Thursday: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }],
    Friday: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }],
    Saturday: [],
    Sunday: []
  },
  breaks: [{ start: '13:00', end: '14:00' }],
  vacations: [],
  leaves: []
};

export const parseAvailability = (configStr) => {
  if (!configStr) return DEFAULT_AVAILABILITY;
  try {
    const parsed = JSON.parse(configStr);
    return {
      weekly: { ...DEFAULT_AVAILABILITY.weekly, ...parsed.weekly },
      breaks: parsed.breaks || DEFAULT_AVAILABILITY.breaks,
      vacations: parsed.vacations || DEFAULT_AVAILABILITY.vacations,
      leaves: parsed.leaves || DEFAULT_AVAILABILITY.leaves
    };
  } catch {
    return DEFAULT_AVAILABILITY;
  }
};

export const formatTime12h = (time24) => {
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${String(displayH).padStart(2, '0')}:${mStr} ${ampm}`;
};

export const generateSlotsForDate = (config, dateStr) => {
  if (!dateStr || !config) return [];

  // Check vacations and leaves
  if (config.vacations && config.vacations.includes(dateStr)) return [];
  if (config.leaves && config.leaves.includes(dateStr)) return [];

  // Get weekday name
  const date = new Date(dateStr);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[date.getDay()];

  // Get active shifts for this day
  const shifts = config.weekly ? config.weekly[dayName] : [];
  if (!shifts || shifts.length === 0) return [];

  const slots = [];
  const breakList = config.breaks || [];

  // Generate 30 min intervals
  shifts.forEach(shift => {
    let current = timeToMinutes(shift.start);
    const end = timeToMinutes(shift.end);

    while (current + 30 <= end) {
      const timeStr = minutesToTime(current);

      // Check if slot falls in a break
      const inBreak = breakList.some(brk => {
        const breakStart = timeToMinutes(brk.start);
        const breakEnd = timeToMinutes(brk.end);
        return current >= breakStart && current < breakEnd;
      });

      if (!inBreak) {
        slots.push({
          label: formatTime12h(timeStr),
          time: timeStr
        });
      }
      current += 30;
    }
  });

  return slots;
};

const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};
