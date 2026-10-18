import { Injectable } from '@angular/core';

/** Angular version of the Blazor client's js/invoice-pdf.js. */
@Injectable({ providedIn: 'root' })
export class PdfService {
  /** Opens the PDF in a new tab and asks the browser to print it. False if the popup was blocked. */
  print(pdf: Blob): boolean {
    const url = URL.createObjectURL(pdf);
    const win = window.open(url, '_blank');
    if (!win) {
      URL.revokeObjectURL(url);
      return false;
    }

    let printed = false;
    const requestPrint = () => {
      if (printed) return;
      printed = true;
      try {
        win.focus();
        win.print();
      } catch {
        // The PDF stays open; the user can print it from the viewer.
      }
      setTimeout(() => URL.revokeObjectURL(url), 120000);
    };

    win.addEventListener('load', () => setTimeout(requestPrint, 900), { once: true });
    setTimeout(requestPrint, 1800);
    return true;
  }

  download(pdf: Blob, fileName: string): void {
    const url = URL.createObjectURL(pdf);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
