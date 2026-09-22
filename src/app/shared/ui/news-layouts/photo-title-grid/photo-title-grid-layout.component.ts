import { Component, input } from '@angular/core'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import { NewsTitlePhotoComponent } from '@/shared/ui/news-card/news-title-photo/news-title-photo.component.ts'

@Component({
	selector: 'app-photo-title-grid-layout',
	imports: [NewsTitlePhotoComponent],
	templateUrl: './photo-title-grid-layout.component.html',
	styleUrl: './photo-title-grid-layout.component.css',
})
export class PhotoTitleGridLayoutComponent {
	articles = input<NewsArticle[]>([])
}
