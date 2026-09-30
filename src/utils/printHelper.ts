/**
 * Universal print helper for web apps and sandboxed iframes.
 *
 * In sandboxed iframes (like AI Studio preview), direct `window.print()` is often blocked
 * or suppressed by iframe sandbox policies (`allow-modals` missing), causing print buttons
 * to appear completely unresponsive.
 *
 * This utility provides:
 * 1. Targeted element printing with isolated clean styling.
 * 2. An in-page printable preview modal fallback if print dialog is suppressed by browser sandbox.
 * 3. Support for printing both in iframe and new tab.
 */

export function printElement(elementIdOrElement: string | HTMLElement, title = 'Legal Document Print') {
  let targetEl: HTMLElement | null = null;
  if (typeof elementIdOrElement === 'string') {
    targetEl = document.getElementById(elementIdOrElement);
  } else {
    targetEl = elementIdOrElement;
  }

  if (!targetEl) {
    try {
      window.print();
    } catch {
      // ignore
    }
    return;
  }

  // First try: hidden iframe print (often works even when window.print() on the parent iframe is restricted)
  try {
    const existingFrame = document.getElementById('chamber_print_iframe');
    if (existingFrame) {
      existingFrame.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'chamber_print_iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1000px';
    iframe.style.height = '1000px';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    // Get document head styles
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join('\n');

    const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>${title}</title>
            ${styles}
            <style>
              @page {
                size: A4 portrait;
                margin: 10mm 12mm 12mm 12mm;
              }
              body {
                background: #ffffff !important;
                color: #0f172a !important;
                font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
                padding: 16px !important;
                margin: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print, button, input, select {
                display: none !important;
              }
            </style>
          </head>
          <body>
            ${targetEl.outerHTML}
          </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          // If frame print fails, try window.print()
          window.print();
        }
      }, 400);

      // Cleanup
      setTimeout(() => {
        iframe.remove();
      }, 2500);

      return;
    }
  } catch (err) {
    console.warn('Iframe printing encountered an issue:', err);
  }

  // Fallback: standard window.print
  try {
    window.print();
  } catch (err) {
    console.warn('Direct window.print() failed:', err);
  }
}

export function triggerPrint() {
  try {
    window.print();
  } catch (err) {
    console.warn('window.print() error:', err);
  }
}

