import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideBell,
  LucideBookOpen,
  LucideBot,
  LucideBrain,
  LucideCalendar,
  LucideCalendarCheck,
  LucideCalendarClock,
  LucideChartColumn,
  LucideCheck,
  LucideChevronDown,
  LucideChevronLeft,
  LucideChevronRight,
  LucideCircle,
  LucideCircleCheck,
  LucideCircleDot,
  LucideClock,
  LucideCloudUpload,
  LucideFileText,
  LucideFlame,
  LucideFolderOpen,
  LucideGamepad2,
  LucideGraduationCap,
  LucideHistory,
  LucideInfo,
  LucideLayoutDashboard,
  LucideLifeBuoy,
  LucideListTodo,
  LucideMessageCircle,
  LucidePencil,
  LucidePlus,
  LucideRepeat,
  LucideSearch,
  LucideSettings,
  LucideShieldCheck,
  LucideStar,
  LucideTrash2,
  LucideTrophy,
  LucideUser,
  LucideUserPlus,
  LucideUsers,
  LucideX,
} from '@lucide/angular';

/** Nombres de icono soportados por la plataforma (iconos de línea, sin emojis). */
export type IconName =
  | 'dashboard'
  | 'monitorias'
  | 'materials'
  | 'games'
  | 'study'
  | 'tasks'
  | 'profile'
  | 'schedule'
  | 'availability'
  | 'requests'
  | 'history'
  | 'users'
  | 'help'
  | 'csv'
  | 'add-user'
  | 'search'
  | 'settings'
  | 'trophy'
  | 'file'
  | 'assistant'
  | 'chat'
  | 'ethics'
  | 'notifications'
  | 'arrow-left'
  | 'arrow-right'
  | 'check'
  | 'close'
  | 'aprendizaje'
  | 'info'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'repeat'
  | 'flame'
  | 'circle'
  | 'circle-dot'
  | 'circle-check'
  | 'star'
  | 'clock'
  | 'chart'
  | 'calendar'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down';

/**
 * Envoltorio de iconos. Mapea un nombre semántico a su icono lucide.
 * Centraliza la iconografía institucional de línea (sin emojis).
 */
@Component({
  selector: 'eci-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideLayoutDashboard,
    LucideGraduationCap,
    LucideBookOpen,
    LucideGamepad2,
    LucideFolderOpen,
    LucideListTodo,
    LucideUser,
    LucideCalendarClock,
    LucideCalendarCheck,
    LucideUsers,
    LucideHistory,
    LucideLifeBuoy,
    LucideCloudUpload,
    LucideUserPlus,
    LucideSearch,
    LucideSettings,
    LucideTrophy,
    LucideFileText,
    LucideBot,
    LucideMessageCircle,
    LucideShieldCheck,
    LucideBell,
    LucideArrowLeft,
    LucideArrowRight,
    LucideCheck,
    LucideX,
    LucideBrain,
    LucideInfo,
    LucidePlus,
    LucidePencil,
    LucideTrash2,
    LucideRepeat,
    LucideFlame,
    LucideCircle,
    LucideCircleDot,
    LucideCircleCheck,
    LucideStar,
    LucideClock,
    LucideChartColumn,
    LucideCalendar,
    LucideChevronLeft,
    LucideChevronRight,
    LucideChevronDown,
  ],
  template: `
    @switch (name()) {
      @case ('dashboard') {
        <svg lucideLayoutDashboard [size]="size()" aria-hidden="true"></svg>
      }
      @case ('monitorias') {
        <svg lucideGraduationCap [size]="size()" aria-hidden="true"></svg>
      }
      @case ('materials') {
        <svg lucideBookOpen [size]="size()" aria-hidden="true"></svg>
      }
      @case ('games') {
        <svg lucideGamepad2 [size]="size()" aria-hidden="true"></svg>
      }
      @case ('study') {
        <svg lucideFolderOpen [size]="size()" aria-hidden="true"></svg>
      }
      @case ('tasks') {
        <svg lucideListTodo [size]="size()" aria-hidden="true"></svg>
      }
      @case ('profile') {
        <svg lucideUser [size]="size()" aria-hidden="true"></svg>
      }
      @case ('schedule') {
        <svg lucideCalendarClock [size]="size()" aria-hidden="true"></svg>
      }
      @case ('availability') {
        <svg lucideCalendarCheck [size]="size()" aria-hidden="true"></svg>
      }
      @case ('requests') {
        <svg lucideUsers [size]="size()" aria-hidden="true"></svg>
      }
      @case ('history') {
        <svg lucideHistory [size]="size()" aria-hidden="true"></svg>
      }
      @case ('users') {
        <svg lucideUsers [size]="size()" aria-hidden="true"></svg>
      }
      @case ('help') {
        <svg lucideLifeBuoy [size]="size()" aria-hidden="true"></svg>
      }
      @case ('csv') {
        <svg lucideCloudUpload [size]="size()" aria-hidden="true"></svg>
      }
      @case ('add-user') {
        <svg lucideUserPlus [size]="size()" aria-hidden="true"></svg>
      }
      @case ('search') {
        <svg lucideSearch [size]="size()" aria-hidden="true"></svg>
      }
      @case ('settings') {
        <svg lucideSettings [size]="size()" aria-hidden="true"></svg>
      }
      @case ('trophy') {
        <svg lucideTrophy [size]="size()" aria-hidden="true"></svg>
      }
      @case ('file') {
        <svg lucideFileText [size]="size()" aria-hidden="true"></svg>
      }
      @case ('assistant') {
        <svg lucideBot [size]="size()" aria-hidden="true"></svg>
      }
      @case ('chat') {
        <svg lucideMessageCircle [size]="size()" aria-hidden="true"></svg>
      }
      @case ('ethics') {
        <svg lucideShieldCheck [size]="size()" aria-hidden="true"></svg>
      }
      @case ('notifications') {
        <svg lucideBell [size]="size()" aria-hidden="true"></svg>
      }
      @case ('arrow-left') {
        <svg lucideArrowLeft [size]="size()" aria-hidden="true"></svg>
      }
      @case ('arrow-right') {
        <svg lucideArrowRight [size]="size()" aria-hidden="true"></svg>
      }
      @case ('check') {
        <svg lucideCheck [size]="size()" aria-hidden="true"></svg>
      }
      @case ('close') {
        <svg lucideX [size]="size()" aria-hidden="true"></svg>
      }
      @case ('aprendizaje') {
        <svg lucideBrain [size]="size()" aria-hidden="true"></svg>
      }
      @case ('info') {
        <svg lucideInfo [size]="size()" aria-hidden="true"></svg>
      }
      @case ('plus') {
        <svg lucidePlus [size]="size()" aria-hidden="true"></svg>
      }
      @case ('edit') {
        <svg lucidePencil [size]="size()" aria-hidden="true"></svg>
      }
      @case ('trash') {
        <svg lucideTrash2 [size]="size()" aria-hidden="true"></svg>
      }
      @case ('repeat') {
        <svg lucideRepeat [size]="size()" aria-hidden="true"></svg>
      }
      @case ('flame') {
        <svg lucideFlame [size]="size()" aria-hidden="true"></svg>
      }
      @case ('circle') {
        <svg lucideCircle [size]="size()" aria-hidden="true"></svg>
      }
      @case ('circle-dot') {
        <svg lucideCircleDot [size]="size()" aria-hidden="true"></svg>
      }
      @case ('circle-check') {
        <svg lucideCircleCheck [size]="size()" aria-hidden="true"></svg>
      }
      @case ('star') {
        <svg lucideStar [size]="size()" aria-hidden="true"></svg>
      }
      @case ('clock') {
        <svg lucideClock [size]="size()" aria-hidden="true"></svg>
      }
      @case ('chart') {
        <svg lucideChartColumn [size]="size()" aria-hidden="true"></svg>
      }
      @case ('calendar') {
        <svg lucideCalendar [size]="size()" aria-hidden="true"></svg>
      }
      @case ('chevron-left') {
        <svg lucideChevronLeft [size]="size()" aria-hidden="true"></svg>
      }
      @case ('chevron-right') {
        <svg lucideChevronRight [size]="size()" aria-hidden="true"></svg>
      }
      @case ('chevron-down') {
        <svg lucideChevronDown [size]="size()" aria-hidden="true"></svg>
      }
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        line-height: 0;
      }
    `,
  ],
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(20);
}
