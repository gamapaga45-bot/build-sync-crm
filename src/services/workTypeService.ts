import { toast } from "sonner";

export interface WorkType {
  id: string;
  code: string;
  title: string;
  unit: string;
  standard: string;
  baseUnitValue: number; // 1 or 1000
}

const STORAGE_KEY = 'construction_app_work_types';

const DEFAULT_WORKS: WorkType[] = [
  { id: '1', code: '01.01', title: 'Земляные работы. Разработка грунта в отвал', unit: 'м3', standard: 'ГЭСН 81-02-01-2017', baseUnitValue: 1000 },
  { id: '2', code: '01.02', title: 'Планировка площадей механизированным способом', unit: 'м2', standard: 'ГЭСН 81-02-01-2017', baseUnitValue: 100 },
  { id: '3', code: '06.01', title: 'Устройство бетонной подготовки под фундаменты', unit: 'м3', standard: 'ГЭСН 81-02-06-2001', baseUnitValue: 1 },
  { id: '4', code: '06.02', title: 'Устройство железобетонных фундаментных плит плоских', unit: 'м3', standard: 'ГЭСН 81-02-06-2001', baseUnitValue: 1 },
  { id: '5', code: '07.01', title: 'Установка стальных конструкций каркасов зданий', unit: 'т', standard: 'ГЭСН 81-02-07-2001', baseUnitValue: 1 },
];

export const workTypeService = {
  getWorks: (): WorkType[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_WORKS;
  },

  saveWork: (work: WorkType) => {
    const works = workTypeService.getWorks();
    const index = works.findIndex(w => w.id === work.id);
    if (index > -1) {
      works[index] = work;
    } else {
      works.push(work);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
    toast.success("Вид работ сохранен в реестре");
  },

  deleteWork: (id: string) => {
    const works = workTypeService.getWorks().filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
    toast.error("Вид работ удален");
  }
};
