# Studierendenbereich

The student area exposes dashboard, tutorships, materials, games, study center, learning, tasks, achievements, forums and profile.

## Was diese Seite abdeckt

- The student area exposes dashboard, tutorships, materials, games, study center, learning, tasks, achievements, forums and profile.
- Student screens follow the app shell and shared navigation model.
- Tasks and learning integrate with their own backend configuration tokens.

## Wichtige Dateien

- `src/app/features/student/student.routes.ts`
- `src/app/features/student`
- `src/app/shared/layout/nav-items.ts`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
