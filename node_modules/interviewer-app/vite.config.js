import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // הפעלת הפלאגין של ריאקט עם תצורה מפורשת
    react({
      // אומר ל-Babel להתייחס לקבצים כ-ES Modules
      babel: {
        parserOpts: {
          sourceType: 'module'
        }
      }
    })
  ],
  // ההגדרה הקודמת עדיין חשובה
  envDir: process.cwd(),
});