/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Circle, 
  Bot, 
  X, 
  ChevronUp, 
  ChevronDown,
  PlayCircle,
  AlertCircle,
  PieChart,
  ShieldCheck,
  LayoutDashboard,
  Settings as SettingsIcon,
  Users,
  TrendingUp,
  Mail,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

interface Step {
  id: string;
  title: string;
  tabId: string;
  description: string;
  tips: string[];
}

interface Scenario {
  id: string;
  name: string;
  icon: any;
  steps: Step[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'setup',
    name: 'Первичная настройка',
    icon: Bot,
    steps: [
      {
        id: 's1',
        title: 'Настройка проекта',
        tabId: 'dashboard',
        description: 'Создайте новый проект и заполните базовые реквизиты.',
        tips: ['Нажмите "Новый проект" в шапке', 'Укажите адрес и бюджет', 'Выберите тип строительства']
      },
      {
        id: 's2',
        title: 'Реестр видов работ',
        tabId: 'worktypes',
        description: 'Сформируйте список работ для этого проекта.',
        tips: ['Используйте ИИ для подбора ГЭСН/НПРМ', 'Настройте единицы измерения (м3, 1000м3)', 'Укажите коды работ']
      }
    ]
  },
  {
    id: 'budgeting',
    name: 'Составление сметы',
    icon: PieChart,
    steps: [
      {
        id: 'b1',
        title: 'Выбор видов работ',
        tabId: 'worktypes',
        description: 'Выберите нужные работы из общего реестра или добавьте новые.',
        tips: ['Проверьте единицы измерения', 'Укажите базовые расценки']
      },
      {
        id: 'b2',
        title: 'Формирование сметы',
        tabId: 'budget',
        description: 'Сведите выбранные работы в единый сметный расчет.',
        tips: ['Укажите плановые объемы', 'Проверьте итоговую сумму по разделам']
      }
    ]
  },
  {
    id: 'supervision',
    name: 'Работа технадзора',
    icon: ShieldCheck,
    steps: [
      {
        id: 't1',
        title: 'Контроль журналов',
        tabId: 'logs',
        description: 'Проверьте ежедневные записи прорабов.',
        tips: ['Сверьте фотофиксацию с описанием', 'Подпишите записи ЭЦП']
      },
      {
        id: 't2',
        title: 'Приемка работ',
        tabId: 'acceptance',
        description: 'Оформите акты освидетельствования скрытых работ (АОСР).',
        tips: ['Прикрепите исполнительные схемы', 'Укажите выявленные замечания']
      },
      {
        id: 't3',
        title: 'Реестр инцидентов',
        tabId: 'incidents',
        description: 'Зафиксируйте нарушения ТБ или отклонения от проекта.',
        tips: ['Укажите уровень критичности', 'Назначьте ответственного за устранение']
      }
    ]
  },
  {
    id: 'engineer',
    name: 'Работа инженера',
    icon: LayoutDashboard,
    steps: [
      {
        id: 'e1',
        title: 'BIM-координация',
        tabId: 'bim',
        description: 'Проверьте соответствие модели текущим работам.',
        tips: ['Используйте сечения для проверки коллизий', 'Сравните модель с фактом на фото']
      },
      {
        id: 'e2',
        title: 'Ведомость материалов',
        tabId: 'materials',
        description: 'Рассчитайте потребность в материалах на текущий этап.',
        tips: ['Укажите нормы расхода с учетом запаса', 'Свяжите материалы с графиком СМР']
      }
    ]
  },
  {
    id: 'client',
    name: 'Для Заказчика',
    icon: User,
    steps: [
      {
        id: 'c1',
        title: 'Обзор проекта',
        tabId: 'overview',
        description: 'Проверьте общий прогресс и статус текущих этапов.',
        tips: ['Посмотрите процент готовности', 'Ознакомьтесь с ближайшими вехами']
      },
      {
        id: 'c2',
        title: 'Просмотр BIM',
        tabId: 'bim',
        description: 'Ознакомьтесь с цифровым двойником вашего объекта.',
        tips: ['Вращайте модель для осмотра со всех сторон', 'Используйте слои для просмотра коммуникаций']
      },
      {
        id: 'c3',
        title: 'Финансовый контроль',
        tabId: 'finance',
        description: 'Следите за графиком платежей и актами КС.',
        tips: ['Проверьте статус выставленных счетов', 'Скачайте акты выполненных работ']
      }
    ]
  },
  {
    id: 'admin_config',
    name: 'Администрирование',
    icon: SettingsIcon,
    steps: [
      {
        id: 'ad1',
        title: 'Брендинг компании',
        tabId: 'settings',
        description: 'Настройте логотип и название компании для документов.',
        tips: ['Загрузите логотип в формате PNG', 'Укажите актуальные реквизиты компании']
      },
      {
        id: 'ad2',
        title: 'Управление доступом',
        tabId: 'settings',
        description: 'Настройте видимость разделов для разных ролей.',
        tips: ['Отключите лишние модули для прорабов', 'Проверьте настройки безопасности']
      }
    ]
  },
  {
    id: 'hr_recruitment',
    name: 'Найм и Кадры',
    icon: Users,
    steps: [
      {
        id: 'hr1',
        title: 'Реестр сотрудников',
        tabId: 'team',
        description: 'Просмотрите текущий состав команды проекта.',
        tips: ['Проверьте квалификацию сотрудников', 'Назначьте ответственных за этапы']
      },
      {
        id: 'hr2',
        title: 'Отправка приглашений',
        tabId: 'team',
        description: 'Отправьте приглашения новым сотрудникам для доступа к порталу.',
        tips: ['Укажите корректный Email', 'Выберите роль (Прораб, Инженер и т.д.)']
      }
    ]
  },
  {
    id: 'client_mgmt',
    name: 'Работа с клиентами',
    icon: TrendingUp,
    steps: [
      {
        id: 'cm1',
        title: 'Управление лидами',
        tabId: 'crm',
        description: 'Обрабатывайте новые заявки на строительство.',
        tips: ['Передвигайте карточки по воронке продаж', 'Планируйте звонки и встречи']
      },
      {
        id: 'cm2',
        title: 'База клиентов',
        tabId: 'clients',
        description: 'Ведите детальную историю взаимодействия с заказчиками.',
        tips: ['Заполняйте досье клиента', 'Прикрепляйте договора и ТЗ']
      },
      {
        id: 'cm3',
        title: 'Доступ к ЛК',
        tabId: 'portal',
        description: 'Настройте доступ клиента в его личный кабинет.',
        tips: ['Переключитесь в режим портала для проверки', 'Убедитесь, что отчеты готовы к просмотру']
      }
    ]
  }
];

export default function StepAssistant({ 
  activeTab, 
  onNavigate,
  role = 'admin'
}: { 
  activeTab: string, 
  onNavigate: (id: string) => void,
  role?: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Filter scenarios based on role
  const filteredScenarios = SCENARIOS.filter(s => {
    if (role === 'client') return s.id === 'client';
    return s.id !== 'client';
  });

  const activeScenario = SCENARIOS.find(s => s.id === activeScenarioId);
  const steps = activeScenario?.steps || [];
  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      onNavigate(steps[currentStepIndex + 1].tabId);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      onNavigate(steps[currentStepIndex - 1].tabId);
    }
  };

  const toggleStep = (id: string) => {
    setCompletedSteps(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-2xl bg-slate-900 hover:bg-slate-800 border-4 border-white group"
        >
          <Bot className="w-6 h-6 animate-pulse group-hover:scale-110 transition-transform" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div className="max-w-4xl mx-auto w-full pointer-events-auto">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden"
        >
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Интерактивный помощник BuildSync</h3>
                {activeScenario ? (
                  <p className="text-[10px] text-slate-400">Сценарий: {activeScenario.name}</p>
                ) : (
                  <p className="text-[10px] text-slate-400">Выберите сценарий работы</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeScenario && (
                <div className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold">
                  Шаг {currentStepIndex + 1} из {steps.length}
                </div>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-white/10 text-white"
                onClick={() => setIsOpen(false)}
              >
                <ChevronDown size={18} />
              </Button>
            </div>
          </div>

          <div className="p-6">
            {!activeScenario ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredScenarios.map((scenario) => (
                  <Card 
                    key={scenario.id} 
                    className="group border-none shadow-sm bg-slate-50 hover:bg-slate-900 transition-all cursor-pointer overflow-hidden p-6 text-center space-y-3"
                    onClick={() => {
                       setActiveScenarioId(scenario.id);
                       setCurrentStepIndex(0);
                    }}
                  >
                    <div className="mx-auto w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-900 group-hover:bg-white/10 group-hover:text-white transition-colors">
                      <scenario.icon size={24} />
                    </div>
                    <h4 className="font-bold text-slate-900 group-hover:text-white transition-colors">{scenario.name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{scenario.steps.length} этапов</p>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 -ml-2"
                        onClick={() => setActiveScenarioId(null)}
                      >
                        <ChevronLeft size={18} />
                      </Button>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-lg leading-none flex items-center gap-2">
                           {completedSteps.includes(currentStep.id) && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                           {currentStep.title}
                        </h4>
                        <p className="text-sm text-slate-500">{currentStep.description}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 space-y-3 ml-12">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <AlertCircle size={12} /> Рекомендации:
                       </p>
                       <ul className="space-y-2">
                         {currentStep.tips.map((tip, i) => (
                           <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                             <Circle size={4} className="fill-slate-400 text-slate-400" />
                             {tip}
                           </li>
                         ))}
                       </ul>
                    </div>
                  </div>

                  <div className="lg:w-48 flex flex-col justify-center gap-3">
                    <Button 
                       className={cn(
                         "w-full h-11 transition-all",
                         completedSteps.includes(currentStep.id) ? "bg-green-600 hover:bg-green-700" : "bg-slate-900"
                       )}
                       onClick={() => toggleStep(currentStep.id)}
                    >
                      {completedSteps.includes(currentStep.id) ? 'Завершено' : 'Отметить шаг'}
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 h-11" 
                        onClick={handleBack}
                        disabled={currentStepIndex === 0}
                      >
                        <ChevronLeft size={18} />
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 h-11"
                        onClick={handleNext}
                        disabled={currentStepIndex === steps.length - 1}
                      >
                        <ChevronRight size={18} />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex gap-2">
                    {steps.map((step, idx) => (
                      <div 
                        key={step.id}
                        className={cn(
                          "h-1.5 w-8 rounded-full transition-all cursor-pointer",
                          idx === currentStepIndex ? "bg-slate-900 w-12" : 
                          completedSteps.includes(step.id) ? "bg-green-500" : "bg-slate-200"
                        )}
                        onClick={() => {
                          setCurrentStepIndex(idx);
                          onNavigate(step.tabId);
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {Math.round((completedSteps.length / steps.length) * 100)}% сценария пройдено
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
