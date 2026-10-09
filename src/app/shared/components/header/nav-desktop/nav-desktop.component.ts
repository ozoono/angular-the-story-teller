import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NEWS_TOPICS } from '@/core/constants/news-topics.constants.ts'

@Component({
	selector: 'app-nav-desktop',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './nav-desktop.component.html',
	styleUrl: './nav-desktop.component.css',
})
export class NavDesktopComponent {
	protected readonly categories = NEWS_TOPICS
}
