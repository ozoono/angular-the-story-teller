import { Component, input } from '@angular/core'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import { NewsTitleOnlyComponent } from '@/shared/ui/news-card/news-title-only/news-title-only.component.ts'

@Component({
	selector: 'app-title-list-layout',
	imports: [NewsTitleOnlyComponent],
	templateUrl: './title-list-layout.component.html',
	styleUrl: './title-list-layout.component.css',
})
export class TitleListLayoutComponent {
	articles = input<NewsArticle[]>([])
}
