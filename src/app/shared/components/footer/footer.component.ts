import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NEWS_TOPICS } from '@/core/constants/news-topics.constants.ts'
import { GithubComponent } from '../github.component.ts'

@Component({
	selector: 'app-footer',
	standalone: true,
	imports: [RouterLink, GithubComponent],
	templateUrl: './footer.component.html',
	styleUrl: './footer.component.css',
})
export class AppFooterComponent {
	protected readonly categories = NEWS_TOPICS
	protected readonly currentYear = new Date().getFullYear()
}
