'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-mint print:hidden"
    >
      <Printer className="w-5 h-5" />
      Print or save as PDF
    </button>
  );
}
