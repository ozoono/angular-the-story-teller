import { Component, input } from '@angular/core'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import { NewsTitlePhotoSummaryComponent } from '@/shared/ui/news-card/news-title-photo-summary/news-title-photo-summary.component.ts'

@Component({
	selector: 'app-horizontal-story-list-layout',
	imports: [NewsTitlePhotoSummaryComponent],
	templateUrl: './horizontal-story-list-layout.component.html',
	styleUrl: './horizontal-story-list-layout.component.css',
})
export class HorizontalStoryListLayoutComponent {
	listArticles = input<NewsArticle[]>([])
}
