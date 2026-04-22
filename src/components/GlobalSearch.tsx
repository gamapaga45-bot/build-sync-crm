/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { 
  Search, 
  CheckSquare, 
  Box, 
  Users, 
  FileText, 
  LayoutDashboard,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  onSelect: (type: string, id: string) => void;
}

export function GlobalSearch({ onSelect }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 bg-slate-100 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors w-64 justify-between"
      >
        <div className="flex items-center gap-2">
          <Search size={14} />
          <span>Поиск...</span>
        </div>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <div className={cn(
        "fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity",
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setOpen(false)}>
        <div className="flex items-start justify-center pt-24 px-4 h-full">
          <div 
            className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Command label="Global Search">
              <div className="flex items-center border-b border-slate-100 px-4">
                <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                <Command.Input 
                  placeholder="Что вы ищете?" 
                  className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <Command.List className="max-h-[300px] overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-slate-500">Ничего не найдено.</Command.Empty>
                
                <Command.Group heading="Проекты" className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <Command.Item 
                    onSelect={() => { onSelect('project', '1'); setOpen(false); }}
                    className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-slate-100 cursor-pointer text-slate-700 aria-selected:bg-slate-100"
                  >
                    <LayoutDashboard size={16} className="text-blue-500" />
                    <span>ЖК "Северное Сияние"</span>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { onSelect('project', '2'); setOpen(false); }}
                    className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-slate-100 cursor-pointer text-slate-700 aria-selected:bg-slate-100"
                  >
                    <LayoutDashboard size={16} className="text-blue-500" />
                    <span>ТЦ "Мегаполис"</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Задачи" className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">
                  <Command.Item className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-slate-100 cursor-pointer text-slate-700 aria-selected:bg-slate-100">
                    <CheckSquare size={16} className="text-green-500" />
                    <span>Армирование плиты фундамента</span>
                  </Command.Item>
                  <Command.Item className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-slate-100 cursor-pointer text-slate-700 aria-selected:bg-slate-100">
                    <CheckSquare size={16} className="text-green-500" />
                    <span>Гидроизоляция цоколя</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="CRM / Лиды" className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">
                  <Command.Item className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-slate-100 cursor-pointer text-slate-700 aria-selected:bg-slate-100">
                    <TrendingUp size={16} className="text-purple-500" />
                    <span>ООО "СтройИнвест"</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Документы" className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">
                  <Command.Item className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-slate-100 cursor-pointer text-slate-700 aria-selected:bg-slate-100">
                    <FileText size={16} className="text-orange-500" />
                    <span>Договор подряда №45</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </div>
        </div>
      </div>
    </>
  );
}
