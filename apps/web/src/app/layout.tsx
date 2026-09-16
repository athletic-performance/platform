import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { FrontendObservability } from '@/shared/observability/frontend-observability';

import './globals.css';

export const metadata: Metadata = {
  title: 'Platform — Engineering Foundation',
  description: 'Стартовый экран инженерного контура web → API → PostgreSQL',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <FrontendObservability />
        {children}
      </body>
    </html>
  );
}
