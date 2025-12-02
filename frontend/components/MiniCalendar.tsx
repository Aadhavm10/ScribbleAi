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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full animate-fade-in">
      {/* Header */}
      <div className="bg-indigo-600 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Calendar</h2>
              <p className="text-indigo-100 text-xs font-medium">Your Schedule</p>
            </div>
          </div>
          <Link
            href="/calendar"
            className="group flex items-center gap-2 bg-white hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all"
          >
            <span className="text-indigo-600 font-semibold text-sm">View Full</span>
            <svg className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-white font-bold text-base">{format(currentDate, 'MMMM yyyy')}</h3>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-5">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            <div key={i} className="text-center">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDate(day);
            const today = isToday(day);
            const currentMonth = day.getMonth() === currentDate.getMonth();
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`group relative aspect-square flex flex-col items-center justify-center p-2 text-sm font-bold transition-all duration-300 rounded-xl ${
                  today
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105 hover:scale-110 ring-2 ring-indigo-300'
                    : currentMonth
                    ? isWeekend
                      ? 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:scale-105 hover:shadow-md border-2 border-transparent hover:border-indigo-200'
                      : 'bg-white text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 hover:scale-105 hover:shadow-md border-2 border-slate-100 hover:border-indigo-300'
                    : 'bg-slate-50/50 text-slate-300 hover:text-slate-400 border-2 border-transparent'
                }`}
              >
                {today && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border-2 border-white animate-ping"></div>
                )}
                <span className={`mb-1 ${today ? 'text-lg' : ''}`}>{format(day, 'd')}</span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-1 mt-auto">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          today
                            ? 'bg-yellow-300 shadow-md shadow-yellow-200'
                            : 'bg-indigo-500 group-hover:scale-125'
                        }`}
                      />
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
        <div className="border-t-2 border-slate-200 p-5 bg-slate-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full border-2 border-white"></div>
            </div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Upcoming Events</h4>
          </div>
          <div className="space-y-2.5">
            {upcomingEvents.map((event, index) => (
              <Link
                key={event.id}
                href={`/calendar`}
                className="group block relative overflow-hidden bg-white hover:bg-indigo-50 transition-all duration-300 rounded-xl border-2 border-slate-100 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-indigo-600 group-hover:scale-125 transition-transform shadow-sm"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 line-clamp-1 mb-1.5 transition-colors">{event.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-indigo-600 transition-colors">
                        <div className="flex items-center gap-1.5 bg-slate-50 group-hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold">{format(new Date(event.startDate), 'MMM d, h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
