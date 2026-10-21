/** Legacy copy path for HTTP pages; call from a user interaction. */
export function copyToClipboard(text: string, err?: (error: unknown) => void): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  const previous = document.activeElement as HTMLElement | null;
  const selection = window.getSelection?.();
  const ranges = selection
    ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange())
    : [];
  let textarea: HTMLTextAreaElement | undefined;
  try {
    const legacy = (window as any).clipboardData;
    if (legacy?.setData) return legacy.setData('Text', text) !== false;
    textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    return document.execCommand('copy');
  } catch (error) {
    err?.(error);
    return false;
  } finally {
    textarea?.remove();
    previous?.focus?.({ preventScroll: true });
    if (selection && ranges.length) {
      selection.removeAllRanges();
      ranges.forEach((range) => selection.addRange(range));
    }
  }
}

/** Prefer the modern API, but also support HTTP and denied clipboard permission. */
export async function writeClipboardText(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the user-gesture-based HTTP copy path.
    }
  }
  if (!copyToClipboard(text)) throw new Error('浏览器未允许复制，请手动选择内容复制。');
}
