// 全局 UI 状态：Toast 提示 + 确认对话框
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

// 对话框按钮
export interface DialogAction {
  text: string;
  onPress?: () => void;
  variant?: 'default' | 'primary' | 'danger';
}

interface UIState {
  // Toast
  toast: { visible: boolean; message: string; type: ToastType };
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;

  // Dialog
  dialog: { visible: boolean; title: string; message: string; actions: DialogAction[] };
  showDialog: (title: string, message: string, actions: DialogAction[]) => void;
  hideDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toast: { visible: false, message: '', type: 'info' },
  showToast: (message, type = 'info') => {
    set({ toast: { visible: true, message, type } });
    // 2 秒后自动消失
    setTimeout(() => set((s) => ({ toast: { ...s.toast, visible: false } })), 2000);
  },
  hideToast: () => set((s) => ({ toast: { ...s.toast, visible: false } })),

  dialog: { visible: false, title: '', message: '', actions: [] },
  showDialog: (title, message, actions) => set({ dialog: { visible: true, title, message, actions } }),
  hideDialog: () => set((s) => ({ dialog: { ...s.dialog, visible: false } })),
}));

// ===== 便捷调用（函数式，像 Alert.alert 一样简单）=====

export const toast = {
  success: (msg: string) => useUIStore.getState().showToast(msg, 'success'),
  error: (msg: string) => useUIStore.getState().showToast(msg, 'error'),
  info: (msg: string) => useUIStore.getState().showToast(msg, 'info'),
};

// 确认对话框（确认 + 取消）
export function confirm(
  title: string,
  message: string,
  onConfirm: () => void,
  opts?: { confirmText?: string; cancelText?: string; danger?: boolean }
) {
  const s = useUIStore.getState();
  s.showDialog(title, message, [
    { text: opts?.cancelText || '取消' },
    { text: opts?.confirmText || '确认', onPress: onConfirm, variant: opts?.danger ? 'danger' : 'primary' },
  ]);
}

// 多选项对话框（如选择来源：拍照/相册/取消）
export function showDialog(title: string, message: string, actions: DialogAction[]) {
  useUIStore.getState().showDialog(title, message, actions);
}
