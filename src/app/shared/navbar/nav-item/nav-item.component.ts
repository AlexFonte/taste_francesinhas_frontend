import { Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  enabled: boolean;
}

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss',
})
export class NavItemComponent {

  readonly item    = input.required<NavItem>();
  readonly variant = input.required<'desktop' | 'mobile'>();

  readonly linkClass = computed(() => {
    const enabled = this.item().enabled;
    if (this.variant() === 'desktop') {
      return 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors '
        + (enabled ? 'text-gray-700 hover:bg-neutral' : 'text-gray-300 cursor-not-allowed');
    }
    return 'flex flex-col items-center justify-center flex-1 px-1 py-4 gap-0.5 text-xs font-medium text-center transition-colors '
      + (enabled ? 'text-gray-500' : 'text-gray-400 cursor-not-allowed');
  });

  readonly activeClass = computed(() =>
    this.variant() === 'desktop' ? '!text-primary font-black ! !text-base' : '!text-primary font-black !text-sm'
  );

  readonly iconClass = computed(() =>
    this.variant() === 'desktop'
      ? '!text-xl !w-5 !h-5 !leading-5'
      : '!text-2xl !w-6 !h-6 !leading-6'
  );
}
