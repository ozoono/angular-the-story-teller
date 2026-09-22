import { Component, input } from '@angular/core'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import { NewsTitlePhotoComponent } from '@/shared/ui/news-card/news-title-photo/news-title-photo.component.ts'
import { TitleListLayoutComponent } from '@/shared/ui/news-layouts/title-list/title-list-layout.component.ts'

@Component({
	selector: 'app-photo-title-list-layout',
	imports: [NewsTitlePhotoComponent, TitleListLayoutComponent],
	templateUrl: './photo-title-list-layout.component.html',
	styleUrl: './photo-title-list-layout.component.css',
})
export class PhotoTitleListLayoutComponent {
	article = input<NewsArticle>()
	listArticles = input<NewsArticle[]>([])
}
