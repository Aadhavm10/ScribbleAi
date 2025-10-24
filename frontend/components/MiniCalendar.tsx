'use client';

import { useState, useEffect } from 'react';
import { CalendarAPI, CalendarEvent } from '../lib/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import Link from 'next/link';

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const fetchedEvents = await CalendarAPI.getEvents({
        startDate: monthStart,
        endDate: monthEnd,
      });

      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, date);
    });
  };

  const upcomingEvents = events
    .filter(event => new Date(event.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white border border-[#E5E5E5] overflow-hidden h-full">
      {/* Header */}
      <div className="bg-black p-4 border-b border-[#E5E5E5]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider">Calendar</h2>
          <Link
            href="/calendar"
            className="text-white text-sm hover:underline flex items-center gap-1 font-medium"
          >
            <span>View Full</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="text-white hover:bg-white/20 p-1 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-white font-bold text-sm">{format(currentDate, 'MMMM yyyy')}</h3>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="text-white hover:bg-white/20 p-1 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs font-bold text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDate(day);
            const today = isToday(day);
            const currentMonth = day.getMonth() === currentDate.getMonth();

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`aspect-square flex flex-col items-center justify-center p-1 text-xs font-medium transition border ${
                  today
                    ? 'bg-black text-white border-black'
                    : currentMonth
                    ? 'text-black hover:bg-[#F5F5F5] border-transparent'
                    : 'text-gray-400 border-transparent'
                }`}
              >
                <span className="mb-0.5">{format(day, 'd')}</span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-black" />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="border-t border-[#E5E5E5] p-4">
          <h4 className="text-xs font-bold text-black uppercase tracking-wider mb-3">Upcoming</h4>
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href={`/calendar`}
                className="block p-2 hover:bg-[#F5F5F5] transition border border-transparent hover:border-black"
              >
                <p className="text-sm font-medium text-black line-clamp-1">{event.title}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(event.startDate), 'MMM d, h:mm a')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
