import { setupIonicReact } from '@ionic/react';

// CSS lõi Ionic (thứ tự theo docs chính thức) rồi tới theme của app.
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';

import './theme/fonts.css';
import './theme/variables.css';
import './theme/global.css';

import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { initializeAuth } from './features/auth/authService';

setupIonicReact({
  mode: 'ios',
  animated: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
});

/**
 * Khởi động app: xử lý `?code=` (đăng nhập OAuth PKCE) TRƯỚC khi router
 * render, để tránh điều hướng sai trong lúc supabase-js còn đang đổi code
 * lấy session (mục 6.1 PLAN.md), rồi mới render `<App />`.
 */
async function bootstrap(): Promise<void> {
  await initializeAuth();

  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Không tìm thấy phần tử #root');
  }

  createRoot(container).render(<App />);
}

void bootstrap();
