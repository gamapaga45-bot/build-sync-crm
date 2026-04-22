/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAuth } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, Building2, ShieldCheck, PieChart } from "lucide-react";

export default function Login() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-slate-200">
            <Building2 className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">СтройМастер</h1>
          <p className="text-slate-500 text-lg">Профессиональное управление строительством частного дома</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-left p-4 rounded-2xl bg-slate-50">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Технадзор</h3>
                <p className="text-xs text-slate-500">Контроль качества и фиксация ошибок</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-left p-4 rounded-2xl bg-slate-50">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <PieChart size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Бюджет</h3>
                <p className="text-xs text-slate-500">Учет материалов и контроль расходов</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={signIn}
            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-lg rounded-2xl"
          >
            <LogIn className="mr-2 w-5 h-5" /> Войти через Google
          </Button>
          
          <p className="text-xs text-slate-400">
            Нажимая «Войти», вы соглашаетесь с условиями использования и политикой конфиденциальности
          </p>
        </div>

        <div className="pt-8 text-slate-400 text-sm">
          © 2024 СтройМастер. Все права защищены.
        </div>
      </div>
    </div>
  );
}
