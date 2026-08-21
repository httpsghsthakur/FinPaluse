import { create } from "zustand";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface UIState {
  isSidebarCollapsed: boolean;
  isMobileNavOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileNav: () => void;
  setMobileNavOpen: (open: boolean) => void;

  // Modals
  isPlaidModalOpen: boolean;
  openPlaidModal: () => void;
  closePlaidModal: () => void;

  isAddTxModalOpen: boolean;
  openAddTxModal: () => void;
  closeAddTxModal: () => void;

  isCsvImportModalOpen: boolean;
  openCsvImportModal: () => void;
  closeCsvImportModal: () => void;

  isCreateGoalModalOpen: boolean;
  openCreateGoalModal: () => void;
  closeCreateGoalModal: () => void;

  selectedTxIdForDetail: string | null;
  openTxDetail: (id: string) => void;
  closeTxDetail: () => void;

  // Toasts
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id">) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  isMobileNavOpen: false,
  toggleSidebar: () =>
    set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  toggleMobileNav: () => set((s) => ({ isMobileNavOpen: !s.isMobileNavOpen })),
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),

  // Modals
  isPlaidModalOpen: false,
  openPlaidModal: () => set({ isPlaidModalOpen: true }),
  closePlaidModal: () => set({ isPlaidModalOpen: false }),

  isAddTxModalOpen: false,
  openAddTxModal: () => set({ isAddTxModalOpen: true }),
  closeAddTxModal: () => set({ isAddTxModalOpen: false }),

  isCsvImportModalOpen: false,
  openCsvImportModal: () => set({ isCsvImportModalOpen: true }),
  closeCsvImportModal: () => set({ isCsvImportModalOpen: false }),

  isCreateGoalModalOpen: false,
  openCreateGoalModal: () => set({ isCreateGoalModalOpen: true }),
  closeCreateGoalModal: () => set({ isCreateGoalModalOpen: false }),

  selectedTxIdForDetail: null,
  openTxDetail: (id) => set({ selectedTxIdForDetail: id }),
  closeTxDetail: () => set({ selectedTxIdForDetail: null }),

  // Toasts
  toasts: [],
  showToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));

    const duration = toast.duration || 4000;
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
