/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Filter,
  Download
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton, CardSkeleton, ChartSkeleton } from "@/components/ui/skeleton";

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('quarter');
  const [isLoading, setIsLoading] = useState(true);

  useMemo(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const managerPerformance = [
    { name: 'Алексей И.', deals: 12, value: 45000000, conversion: 24, efficiency: 88 },
    { name: 'Сергей С.', deals: 8, value: 32000000, conversion: 18, efficiency: 75 },
    { name: 'Иван П.', deals: 15, value: 58000000, conversion: 31, efficiency: 92 },
    { name: 'Мария К.', deals: 10, value: 28000000, conversion: 20, efficiency: 82 },
  ];

  const pipelineForecast = [
    { month: 'Апр', actual: 12000000, forecast: 15000000 },
    { month: 'Май', actual: 0, forecast: 22000000 },
    { month: 'Июн', actual: 0, forecast: 18000000 },
    { month: 'Июл', actual: 0, forecast: 25000000 },
    { month: 'Авг', actual: 0, forecast: 30000000 },
    { month: 'Сен', actual: 0, forecast: 28000000 },
  ];

  const dealSources = [
    { name: 'Сайт', value: 45 },
    { name: 'Рекомендации', value: 25 },
    { name: 'Холодные звонки', value: 15 },
    { name: 'Партнеры', value: 15 },
  ];

  const COLORS = ['#0f172a', '#3b82f6', '#8b5cf6', '#ec4899'];

  const totalForecast = useMemo(() => {
    return pipelineForecast.reduce((acc, curr) => acc + curr.forecast, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Расширенная Аналитика</h2>
          <p className="text-slate-500">Эффективность отдела продаж и прогнозирование выручки</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-white border-slate-200">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">За месяц</SelectItem>
              <SelectItem value="quarter">За квартал</SelectItem>
              <SelectItem value="year">За год</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-white">
            <Download className="w-4 h-4 mr-2" /> Экспорт PDF
          </Button>
        </div>
      </div>

      {/* High-level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Прогноз выручки (Q2-Q3)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">138.0 млн ₽</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp size={12} /> +12.5% к прошлому периоду
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Средняя конверсия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23.2%</div>
            <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
              <Target size={12} /> Цель: 25%
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Активных сделок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <div className="text-xs text-slate-400 mt-1">на сумму 240 млн ₽</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Эффективность отдела</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
              <div className="bg-slate-900 h-full" style={{ width: '84%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Forecast Chart */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-blue-600" />
              Прогноз выручки по месяцам
            </CardTitle>
            <CardDescription>Взвешенная стоимость воронки с учетом вероятности закрытия</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipelineForecast}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(value) => `${value/1000000}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${(value/1000000).toFixed(1)} млн ₽`, 'Прогноз']}
                />
                <Area type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorForecast)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Manager Efficiency Chart */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Эффективность менеджеров
            </CardTitle>
            <CardDescription>Объем закрытых сделок и конверсия по сотрудникам</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={managerPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${(value/1000000).toFixed(1)} млн ₽`, 'Объем']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {managerPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deal Sources */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-orange-600" />
              Источники лидов
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dealSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dealSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {dealSources.map((source, i) => (
                <div key={source.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-xs text-slate-500">{source.name} ({source.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Manager Table */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
          <CardHeader>
            <CardTitle>Детальный отчет по сотрудникам</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Менеджер</th>
                    <th className="px-6 py-4 font-bold text-right">Сделок</th>
                    <th className="px-6 py-4 font-bold text-right">Сумма</th>
                    <th className="px-6 py-4 font-bold text-right">Конверсия</th>
                    <th className="px-6 py-4 font-bold">Эффективность</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {managerPerformance.map((m) => (
                    <tr key={m.name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{m.name}</td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">{m.deals}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{(m.value/1000000).toFixed(1)} млн ₽</td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-none">{m.conversion}%</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Progress value={m.efficiency} className="h-1.5 w-24" />
                          <span className="text-xs font-bold text-slate-700">{m.efficiency}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
