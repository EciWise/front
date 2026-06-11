# Tutorien

Tutorship flows are mocked in TutoringMockService until the backend is ready.

## Was diese Seite abdeckt

- Tutorship flows are mocked in TutoringMockService until the backend is ready.
- The mock covers availability, reservations, attendance, observations, ratings, reputation, recommendations and statistics.
- Dropdowns use eci-select with options owned by each page.

## Wichtige Dateien

- `src/app/features/student/tutorias`
- `src/app/features/tutor/tutoring.service.ts`
- `src/app/features/tutor/tutor.models.ts`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
