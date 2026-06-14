import React, { useState } from 'react';

const CalendarView = ({ appointments = [], onSelectAppointment, isDoctor = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate blank grids and day grids
  const calendarGrids = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarGrids.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarGrids.push(i);
  }

  const getAppointmentsForDay = (day) => {
    if (!day) return [];
    return appointments.filter(appt => {
      const apptDate = new Date(appt.appointmentDate);
      return apptDate.getFullYear() === year && 
             apptDate.getMonth() === month && 
             apptDate.getDate() === day;
    });
  };

  return (
    <div className="glass-card" style={{ padding: '2rem', background: 'var(--white)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 className="serif-text" style={{ fontSize: '1.5rem', margin: 0, color: 'var(--ink)' }}>
          📅 {monthNames[month]} {year}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" onClick={handlePrevMonth} style={{ padding: '6px 12px', fontSize: '12px' }}>◄ Prev</button>
          <button className="btn-ghost" onClick={handleNextMonth} style={{ padding: '6px 12px', fontSize: '12px' }}>Next ►</button>
        </div>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 'bold', fontSize: '12px', color: 'var(--ink-soft)', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>

      {/* Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '8px', columnGap: '8px', marginTop: '10px' }}>
        {calendarGrids.map((day, idx) => {
          const dayAppts = getAppointmentsForDay(day);
          const hasAppts = dayAppts.length > 0;
          return (
            <div 
              key={idx} 
              style={{ 
                minHeight: '65px', 
                padding: '6px', 
                background: day ? 'var(--surface)' : 'transparent', 
                borderRadius: '8px', 
                border: day ? '1px solid var(--border)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {day && (
                <>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--ink-soft)' }}>{day}</div>
                  {hasAppts && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {dayAppts.slice(0, 2).map(appt => {
                        const dateObj = new Date(appt.appointmentDate);
                        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const isCompleted = appt.status === 'COMPLETED';
                        
                        return (
                          <div 
                            key={appt.id}
                            onClick={() => onSelectAppointment(appt)}
                            style={{ 
                              fontSize: '9px', 
                              padding: '2px 4px', 
                              background: isCompleted ? 'var(--mint-pale)' : 'var(--sky-pale)', 
                              color: isCompleted ? 'var(--mint-dark)' : 'var(--sky-dark)', 
                              borderRadius: '4px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontWeight: '600',
                              border: `1px solid ${isCompleted ? 'var(--mint)' : 'var(--sky)'}`
                            }}
                            title={`${appt.doctor?.name || appt.patient?.name} - ${timeStr}`}
                          >
                            {timeStr} {isDoctor ? appt.patient?.name : appt.doctor?.name}
                          </div>
                        );
                      })}
                      {dayAppts.length > 2 && (
                        <div style={{ fontSize: '8px', color: 'var(--ink-muted)', textAlign: 'center', fontWeight: 'bold' }}>
                          +{dayAppts.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
