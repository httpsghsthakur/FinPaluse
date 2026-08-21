import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { useUIStore } from "../../lib/store/useUIStore";
import { cn } from "../../lib/utils/cn";

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const type = toast.type || "info";

        const icons = {
          success: (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ),
          warning: (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          ),
          error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
        };

        const borders = {
          success:
            "border-emerald-500/30 bg-slate-900/95 shadow-emerald-950/30",
          warning: "border-amber-500/30 bg-slate-900/95 shadow-amber-950/30",
          error: "border-rose-500/30 bg-slate-900/95 shadow-rose-950/30",
          info: "border-indigo-500/30 bg-slate-900/95 shadow-indigo-950/30",
        };

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0",
              borders[type],
            )}
          >
            {icons[type]}
            <div className="flex-1 text-xs">
              <div className="font-semibold text-slate-100">{toast.title}</div>
              {toast.description && (
                <div className="text-slate-400 mt-0.5 leading-relaxed">
                  {toast.description}
                </div>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
