import { Component, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NavDesktopComponent } from './nav-desktop/nav-desktop.component.ts'
import { NavMobileComponent } from './nav-mobile/nav-mobile.component.ts'
import { WeatherComponent } from '../weather.component.ts'

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [
		RouterLink,
		NavMobileComponent,
		NavDesktopComponent,
		WeatherComponent,
	],
	templateUrl: './header.component.html',
	styleUrl: './header.component.css',
})
export class AppHeaderComponent {
	protected readonly isMenuOpen = signal(false)

	currentDate: string = new Date().toLocaleDateString('en-EN', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})

	protected openMenu(): void {
		this.isMenuOpen.set(true)
	}

	protected onCloseMenu(): void {
		this.isMenuOpen.set(false)
	}
}
