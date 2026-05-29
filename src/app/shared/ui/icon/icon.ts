import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  LucideBell,
  LucideBookOpen,
  LucideBot,
  LucideCalendarCheck,
  LucideCalendarClock,
  LucideCloudUpload,
  LucideFileText,
  LucideFolderOpen,
  LucideGamepad2,
  LucideGraduationCap,
  LucideHistory,
  LucideLayoutDashboard,
  LucideLifeBuoy,
  LucideListTodo,
  LucideMessageCircle,
  LucideSearch,
  LucideSettings,
  LucideShieldCheck,
  LucideTrophy,
  LucideUser,
  LucideUserPlus,
  LucideUsers,
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
  | 'notifications';

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
