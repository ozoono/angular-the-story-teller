import { Component, input } from '@angular/core'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import { TitlePhotoCardComponent } from '@/shared/ui/news-card/title-photo-card/title-photo-card.component.ts'

@Component({
	selector: 'app-photo-title-card-grid-layout',
	imports: [TitlePhotoCardComponent],
	templateUrl: './photo-title-card-grid-layout.component.html',
	styleUrl: './photo-title-card-grid-layout.component.css',
})
export class PhotoTitleCardGridLayoutComponent {
	articles = input<NewsArticle[]>([])
}
