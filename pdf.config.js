import { defineUserConfig } from 'vitepress-export-pdf';

export default defineUserConfig({
  outDir: 'docs/.vitepress/pdf',
  outFile: 'documentacion-espanol.pdf',
  routePatterns: ['!/en/**', '!/fr/**', '!/pt/**', '!/de/**'],
  pdfOptions: {
    format: 'A4',
    printBackground: true,
  },
});
