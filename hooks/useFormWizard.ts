import { create } from 'zustand';
import { WizardState, WizardData } from '@/types';

const initialData: WizardData = {
  youtubeConnected: true,
};

export const useFormWizard = create<WizardState>((set) => ({
  step: 1,
  data: initialData,
  setStep: (step: number) => set({ step }),
  updateData: (newData: Partial<WizardData>) =>
    set((state) => ({
      data: { ...state.data, ...newData },
    })),
  reset: () => set({ step: 1, data: initialData }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 3) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
}));
