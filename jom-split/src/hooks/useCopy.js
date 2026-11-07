import { useCallback } from 'react';
import { useStore } from './useStore.jsx';

/** Salin teks ke papan keratan; jika disekat, pilih teks dalam textarea tersembunyi sebagai ganti. */
export function useCopy() {
  const { toast } = useStore();
  return useCallback(async (text, okMsg = 'Disalin ke papan keratan') => {
    try {
      await navigator.clipboard.writeText(text);
      toast(okMsg, 'good');
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        toast(ok ? okMsg : 'Tak dapat salin. Pilih teks dan salin sendiri.', ok ? 'good' : 'warn');
      } catch {
        toast('Tak dapat salin. Pilih teks dan salin sendiri.', 'warn');
      }
    }
  }, [toast]);
}
