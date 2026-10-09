import { Component, input, output } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NEWS_TOPICS } from '@/core/constants/news-topics.constants.ts'

@Component({
	selector: 'app-nav-mobile',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './nav-mobile.component.html',
	styleUrl: './nav-mobile.component.css',
})
export class NavMobileComponent {
	protected readonly categories = NEWS_TOPICS
	readonly isOpen = input.required<boolean>()
	readonly closed = output<void>()

	protected closeMenu(): void {
		this.closed.emit()
	}
}
