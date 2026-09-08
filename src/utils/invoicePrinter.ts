// Print & PDF Export Utility for Billora Billing App (Vyapar Edition)

export interface PrintOptions {
  elementId: string;
  format: 'A4' | 'THERMAL';
  title?: string;
}

/**
 * Creates isolated HTML document string for printing or standalone window
 */
export function generateInvoiceHTML(element: HTMLElement, format: 'A4' | 'THERMAL', title = 'Invoice'): string {
  // Collect all stylesheet links and inline style tags from current document
  const headElements: string[] = [];
  
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    headElements.push((link as HTMLLinkElement).outerHTML);
  });

  document.querySelectorAll('style').forEach((style) => {
    headElements.push(style.outerHTML);
  });

  const pageCss = format === 'A4' 
    ? `@page { size: A4 portrait; margin: 8mm 6mm; }
       body { margin: 0; padding: 12px; font-family: system-ui, -apple-system, sans-serif; background: #fff !important; color: #111827; }
       #printable-invoice { width: 100% !important; max-width: 800px !important; margin: 0 auto !important; border: 1px solid #e5e7eb !important; box-shadow: none !important; }`
    : `@page { size: 80mm auto; margin: 2mm; }
       body { margin: 0; padding: 4px; font-family: monospace, system-ui, sans-serif; background: #fff !important; color: #000; }
       #printable-invoice { width: 78mm !important; max-width: 78mm !important; margin: 0 auto !important; border: none !important; box-shadow: none !important; font-size: 11px !important; }`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${headElements.join('\n')}
  <style>
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box;
    }
    html, body {
      background-color: #ffffff !important;
    }
    ${pageCss}
    @media print {
      .action-bar { display: none !important; }
    }
    .action-bar {
      position: sticky;
      top: 0;
      background: #1e293b;
      color: white;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      font-family: system-ui, sans-serif;
    }
    .print-btn {
      background: #e52b44;
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 14px;
    }
    .print-btn:hover {
      background: #c52037;
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <div style="font-weight: 600; font-size: 14px;">${title} • Vyapar Print View</div>
    <div style="display: flex; gap: 10px;">
      <button class="print-btn" onclick="window.print()">🖨️ Print Now (Ctrl+P)</button>
    </div>
  </div>
  ${element.outerHTML}
</body>
</html>`;
}

/**
 * Direct print using multi-tier printer execution:
 * 1. Hidden print iframe (isolated and highly reliable in iframes)
 * 2. Direct window.print()
 * 3. Dedicated print window popup fallback
 */
export async function printInvoice(options: PrintOptions): Promise<{ success: boolean; message: string }> {
  const { elementId, format, title = 'Invoice' } = options;
  const element = document.getElementById(elementId);

  if (!element) {
    window.focus();
    window.print();
    return { success: true, message: 'Print command triggered!' };
  }

  try {
    // 1. Try hidden iframe print (most reliable for preventing modal capture issues)
    const existingPrintFrame = document.getElementById('billora-print-frame');
    if (existingPrintFrame) {
      existingPrintFrame.remove();
    }

    const printFrame = document.createElement('iframe');
    printFrame.id = 'billora-print-frame';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.visibility = 'hidden';
    document.body.appendChild(printFrame);

    const fullHtml = generateInvoiceHTML(element, format, title);
    const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;

    if (frameDoc && printFrame.contentWindow) {
      frameDoc.open();
      frameDoc.write(fullHtml);
      frameDoc.close();

      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (frameErr) {
          console.warn('Iframe print error, falling back to direct print:', frameErr);
          window.focus();
          window.print();
        }
      }, 350);

      return { success: true, message: 'Print dialog opened! (Ctrl+P also available)' };
    } else {
      // Direct print fallback
      window.focus();
      window.print();
      return { success: true, message: 'Print dialog sent to browser!' };
    }
  } catch (err) {
    console.warn('Print trigger fallback to window.print():', err);
    try {
      window.focus();
      window.print();
      return { success: true, message: 'Print dialog triggered!' };
    } catch (fallbackErr) {
      console.error('All print options failed, opening new tab:', fallbackErr);
      openInvoiceInNewTab(options);
      return { success: true, message: 'Opened print tab!' };
    }
  }
}

/**
 * Opens invoice in a new browser tab with direct print controls (bypasses iframe sandboxes)
 */
export function openInvoiceInNewTab(options: PrintOptions): void {
  const { elementId, format, title = 'Billora Invoice' } = options;
  const element = document.getElementById(elementId);
  if (!element) return;

  const fullHtml = generateInvoiceHTML(element, format, title);
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  const newWindow = window.open(blobUrl, '_blank');
  if (newWindow) {
    newWindow.focus();
  } else {
    // If popups are blocked, create a temporary download or navigation link
    const link = document.createElement('a');
    link.href = blobUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

/**
 * Downloads invoice directly as PDF file using html2canvas-pro (with full oklch/modern CSS color support) and jsPDF
 */
export async function downloadInvoicePDF(
  elementId: string,
  filename: string,
  format: 'A4' | 'THERMAL' = 'A4'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Invoice element not found');
  }

  // Import html2canvas-pro which natively supports oklch(), oklab(), lch(), lab() color functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2canvasModule = (await import('html2canvas-pro')) as any;
  const html2canvas = html2canvasModule.default || html2canvasModule;

  const { jsPDF } = await import('jspdf');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  if (format === 'A4') {
    // A4 dimensions: 210 x 297 mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    if (contentHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight);
    } else {
      // Multi-page handling if content is longer than one A4 sheet
      let heightLeft = contentHeight;
      let position = margin;

      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - contentHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
        heightLeft -= pageHeight - margin * 2;
      }
    }

    pdf.save(cleanFilename);
  } else {
    // Thermal format: 80mm roll with custom continuous height
    const rollWidth = 80;
    const rollMargin = 3;
    const contentWidth = rollWidth - rollMargin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;
    const rollHeight = Math.max(contentHeight + rollMargin * 2, 60);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [rollWidth, rollHeight],
    });

    pdf.addImage(imgData, 'JPEG', rollMargin, rollMargin, contentWidth, contentHeight);
    pdf.save(cleanFilename);
  }
}
