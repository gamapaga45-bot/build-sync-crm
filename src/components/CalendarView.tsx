/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  MapPin,
  Users,
  X,
  Info,
  Calendar as CalendarIcon
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn as cnUtil } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'work' | 'delivery' | 'inspection' | 'meeting';
  location?: string;
  description?: string;
  assignee?: string;
}

export default function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'timeline'>('calendar');
  
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Заливка фундамента', date: new Date(2024, 3, 15), type: 'work', location: 'Сектор А-1', description: 'Основной этап заливки плиты' },
    { id: '2', title: 'Доставка кирпича', date: new Date(2024, 3, 18), type: 'delivery', location: 'Склад №2' },
    { id: '3', title: 'Приемка этапа 1', date: new Date(2024, 3, 20), type: 'inspection', location: 'Весь объект' },
    { id: '4', title: 'Встреча с архитектором', date: new Date(2024, 3, 15), type: 'meeting', location: 'Офис' },
  ]);

  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    type: 'work',
    date: new Date()
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !date) return;

    const event: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      date: date,
      type: newEvent.type as any,
      location: newEvent.location,
      description: newEvent.description,
    };

    setEvents([...events, event]);
    toast.success("Событие успешно добавлено");
    setIsAddEventOpen(false);
    setNewEvent({ type: 'work', date: new Date() });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    toast.success("Событие удалено");
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const selectedDateEvents = events.filter(e => date && isSameDay(e.date, date));

  const getDayEvents = (day: Date) => events.filter(e => isSameDay(e.date, day));

  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2 border-none shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg mr-4">
              <Button 
                variant={view === 'calendar' ? 'default' : 'ghost'} 
                size="sm" 
                className={cnUtil("h-7 text-xs", view === 'calendar' && "shadow-sm bg-white text-slate-900 hover:bg-white")}
                onClick={() => setView('calendar')}
              >
                Календарь
              </Button>
              <Button 
                variant={view === 'timeline' ? 'default' : 'ghost'} 
                size="sm" 
                className={cnUtil("h-7 text-xs", view === 'timeline' && "shadow-sm bg-white text-slate-900 hover:bg-white")}
                onClick={() => setView('timeline')}
              >
                Таймлайн
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setDate(new Date()); setCurrentMonth(new Date()); }}>Сегодня</Button>
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border-r border-slate-200" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'calendar' ? (
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              locale={ru}
              className="rounded-md border-none w-full"
              classNames={{
                root: "w-full",
                months: "w-full",
                month: "w-full space-y-4",
                caption: "hidden",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full",
                head_cell: "text-slate-500 rounded-md w-full font-normal text-[0.8rem] uppercase",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative w-full focus-within:relative focus-within:z-20",
                day: "h-20 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-lg transition-colors flex flex-col items-center justify-center",
                day_selected: "bg-slate-900 text-white hover:bg-slate-900 hover:text-white focus:bg-slate-900 focus:text-white",
                day_today: "bg-slate-100 text-slate-900",
                day_outside: "text-slate-400 opacity-50",
                day_disabled: "text-slate-400 opacity-50",
                day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900",
                day_hidden: "invisible",
              }}
            />
          ) : (
            <div className="space-y-6 py-4">
              {eachDayOfInterval({
                start: startOfMonth(currentMonth),
                end: endOfMonth(currentMonth)
              }).map((day, i) => {
                const dayEvents = getDayEvents(day);
                if (dayEvents.length === 0) return null;
                
                return (
                  <div key={i} className="flex gap-4">
                    <div className="w-16 flex flex-col items-center pt-1">
                      <span className="text-xs font-bold text-slate-400 uppercase">{format(day, 'eee', { locale: ru })}</span>
                      <span className={cnUtil(
                        "text-lg font-bold w-10 h-10 rounded-full flex items-center justify-center",
                        isToday(day) ? "bg-red-600 text-white" : "text-slate-900"
                      )}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      {dayEvents.map(event => (
                        <div key={event.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between group hover:bg-white hover:shadow-sm transition-all">
                          <div className="flex items-center gap-4">
                            <div className={cnUtil(
                              "w-2 h-10 rounded-full",
                              event.type === 'work' ? "bg-blue-500" :
                              event.type === 'delivery' ? "bg-orange-500" : "bg-purple-500"
                            )} />
                            <div>
                              <p className="text-sm font-bold text-slate-900">{event.title}</p>
                              <p className="text-xs text-slate-500">{event.location || 'Объект'}</p>
                            </div>
                          </div>
                          <Badge className={cnUtil(
                            "border-none",
                            event.type === 'work' ? "bg-blue-100 text-blue-600" :
                            event.type === 'delivery' ? "bg-orange-100 text-orange-600" : "bg-purple-100 text-purple-600"
                          )}>
                            {event.type === 'work' ? 'Работа' : event.type === 'delivery' ? 'Поставка' : 'Осмотр'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {date ? format(date, 'd MMMM', { locale: ru }) : 'Выберите дату'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <Dialog key={event.id}>
                    <DialogTrigger nativeButton={false} render={<div className="p-4 rounded-xl border border-slate-100 space-y-3 hover:bg-slate-50 transition-colors cursor-pointer group" />}>
                      <div className="flex items-center justify-between">
                        <Badge className={cnUtil(
                          "border-none",
                          event.type === 'work' ? "bg-blue-100 text-blue-600" :
                          event.type === 'delivery' ? "bg-orange-100 text-orange-600" : "bg-purple-100 text-purple-600"
                        )}>
                          {event.type === 'work' ? 'Работа' : event.type === 'delivery' ? 'Поставка' : event.type === 'inspection' ? 'Осмотр' : 'Встреча'}
                        </Badge>
                        <span className="text-xs text-slate-400">10:00 - 12:00</span>
                      </div>
                      <h4 className="font-bold text-slate-900">{event.title}</h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location || 'Не указано'}</span>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{event.title}</DialogTitle>
                        <DialogDescription>Детали события на объекте</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-500">Тип события</span>
                          <Badge className={cnUtil(
                            "border-none",
                            event.type === 'work' ? "bg-blue-100 text-blue-600" :
                            event.type === 'delivery' ? "bg-orange-100 text-orange-600" : "bg-purple-100 text-purple-600"
                          )}>
                            {event.type === 'work' ? 'Работа' : event.type === 'delivery' ? 'Поставка' : 'Осмотр'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarIcon size={16} />
                            <span>{format(event.date, 'd MMMM yyyy', { locale: ru })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock size={16} />
                            <span>10:00 - 12:00</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Описание</p>
                          <p className="text-sm text-slate-600">{event.description || 'Нет описания'}</p>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteEvent(event.id)}>Удалить</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Нет запланированных событий</p>
                </div>
              )}
              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger render={<Button className="w-full bg-slate-900 mt-4" />}>
                  <Plus className="w-4 h-4 mr-2" /> Добавить событие
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Новое событие</DialogTitle>
                    <DialogDescription>Запланируйте работу или поставку</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddEvent} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="event-title">Название</Label>
                      <Input 
                        id="event-title" 
                        placeholder="Напр: Приемка бетона" 
                        required 
                        value={newEvent.title || ''}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Тип</Label>
                      <Select 
                        value={newEvent.type} 
                        onValueChange={(v: any) => setNewEvent({...newEvent, type: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="work">Работа</SelectItem>
                          <SelectItem value="delivery">Поставка</SelectItem>
                          <SelectItem value="inspection">Осмотр</SelectItem>
                          <SelectItem value="meeting">Встреча</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Место</Label>
                      <Input 
                        id="location" 
                        placeholder="Сектор..." 
                        value={newEvent.location || ''}
                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Описание</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Детали..." 
                        value={newEvent.description || ''}
                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="bg-slate-900 w-full">Запланировать</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardContent className="p-6">
            <h4 className="font-bold mb-2">Напоминание</h4>
            <p className="text-sm text-slate-400">Завтра ожидается поставка арматуры. Необходимо подготовить площадку для разгрузки.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cnUtil("px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", className)}>
      {children}
    </span>
  );
}
