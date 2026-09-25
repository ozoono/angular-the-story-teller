import { Component, input } from '@angular/core'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import { StorySummaryCardComponent } from '@/shared/ui/news-card/story-summary-card/story-summary-card.component.ts'

@Component({
	selector: 'app-story-summary-list-layout',
	imports: [StorySummaryCardComponent],
	templateUrl: './story-summary-list-layout.component.html',
	styleUrl: './story-summary-list-layout.component.css',
})
export class StorySummaryListLayoutComponent {
	listArticles = input<NewsArticle[]>([])
}
