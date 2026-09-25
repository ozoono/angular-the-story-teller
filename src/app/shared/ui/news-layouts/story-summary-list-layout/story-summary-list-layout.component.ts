import { Component, input } from '@angular/core'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import { LeadStoryCardComponent } from '@/shared/ui/news-card/lead-story-card/lead-story-card.component.ts'

@Component({
	selector: 'app-story-summary-list-layout',
	imports: [LeadStoryCardComponent],
	templateUrl: './story-summary-list-layout.component.html',
	styleUrl: './story-summary-list-layout.component.css',
})
export class StorySummaryListLayoutComponent {
	listArticles = input<NewsArticle[]>([])
}
