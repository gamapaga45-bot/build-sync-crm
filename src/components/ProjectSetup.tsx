/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Building2, 
  MapPin, 
  Calendar, 
  Wallet,
  ArrowRight,
  Shield,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectSetupProps {
  onProjectCreated: (project: any) => void;
}

export default function ProjectSetup({ onProjectCreated }: ProjectSetupProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    budget: '',
    startDate: '',
    projectType: 'construction' as 'construction' | 'inspection' | 'planned',
  });

  const handleCreate = () => {
    onProjectCreated({
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'active',
      spent: 0,
      lat: 55.75 + (Math.random() - 0.5) * 0.2, // Random near Moscow
      lng: 37.62 + (Math.random() - 0.5) * 0.2,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
            <Building2 className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Добро пожаловать в СтройМастер</h1>
          <p className="text-slate-500">Начните с создания вашего первого строительного проекта</p>
        </div>

        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="h-2 w-full bg-slate-100">
            <div 
              className="h-full bg-slate-900 transition-all duration-500" 
              style={{ width: `${(step / 2) * 100}%` }} 
            />
          </div>
          
          <CardHeader className="p-8">
            <CardTitle className="text-xl">
              {step === 1 ? 'Основная информация' : 'Бюджет и сроки'}
            </CardTitle>
            <CardDescription>
              {step === 1 ? 'Укажите название и местоположение объекта' : 'Установите финансовые и временные рамки'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-0 space-y-6">
            {step === 1 ? (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Название проекта</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                      id="name" 
                      placeholder="Напр: Дом в Сочи" 
                      className="pl-10 bg-slate-50 border-none h-12"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Адрес строительства</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                      id="address" 
                      placeholder="Улица, город..." 
                      className="pl-10 bg-slate-50 border-none h-12"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Тип объекта</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'construction', label: 'Стройка' },
                      { id: 'inspection', label: 'Обследование' },
                      { id: 'planned', label: 'План' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({...formData, projectType: type.id as any})}
                        className={cn(
                          "py-2 px-3 rounded-lg text-xs font-bold border-2 transition-all",
                          formData.projectType === type.id 
                            ? "bg-slate-900 border-slate-900 text-white" 
                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Описание проекта</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Краткое описание объекта..." 
                    className="bg-slate-50 border-none min-h-[100px]"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="budget">Планируемый бюджет (₽)</Label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                      id="budget" 
                      type="number" 
                      placeholder="0.00" 
                      className="pl-10 bg-slate-50 border-none h-12"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Дата начала</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                      id="startDate" 
                      type="date" 
                      className="pl-10 bg-slate-50 border-none h-12"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {step === 2 && (
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 border-slate-200"
                  onClick={() => setStep(1)}
                >
                  Назад
                </Button>
              )}
              <Button 
                className="flex-1 h-12 bg-slate-900 hover:bg-slate-800"
                onClick={step === 1 ? () => setStep(2) : handleCreate}
                disabled={step === 1 && !formData.name}
              >
                {step === 1 ? 'Далее' : 'Создать проект'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            {step === 1 && (
              <Button 
                variant="ghost" 
                className="w-full text-slate-400 hover:text-slate-600"
                onClick={() => onProjectCreated({
                  id: 'demo-1',
                  name: 'Демо-объект: Вилла в Подмосковье',
                  address: 'Московская обл., Истринский р-н',
                  description: 'Пример заполненного проекта для ознакомления с функциями системы.',
                  budget: 25000000,
                  spent: 12500000,
                  status: 'active',
                  projectType: 'construction',
                  lat: 55.85,
                  lng: 37.35,
                  createdAt: new Date().toISOString()
                })}
              >
                Использовать демо-проект для ознакомления
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-8 text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Безопасное хранение</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Командная работа</span>
          </div>
        </div>
      </div>
    </div>
  );
}
