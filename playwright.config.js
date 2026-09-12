import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser', workers: 1, timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:5193', channel: 'chrome', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: 'npm run dev -- --port 5193 --strictPort', url: 'http://127.0.0.1:5193', reuseExistingServer: false,
    env: { VITE_API_BASE_URL: 'https://booking-test.example/api', VITE_BOOKING_API_BASE_URL: 'https://booking-test.example/booking', VITE_TURNSTILE_SITE_KEY: 'test-only-widget-key' },
  },
});
