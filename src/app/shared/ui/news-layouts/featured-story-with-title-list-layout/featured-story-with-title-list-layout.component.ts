import { Component, input } from '@angular/core'
import type { NewsCardViewModel } from '@/shared/view-models/news-card-view.model.ts'
import { TitlePhotoCardComponent } from '@/shared/ui/news-card/title-photo-card/title-photo-card.component.ts'
import { StackedTitleListLayoutComponent } from '@/shared/ui/news-layouts/stacked-title-list-layout/stacked-title-list-layout.component.ts'

@Component({
	selector: 'app-featured-story-with-title-list-layout',
	imports: [TitlePhotoCardComponent, StackedTitleListLayoutComponent],
	templateUrl: './featured-story-with-title-list-layout.component.html',
	styleUrl: './featured-story-with-title-list-layout.component.css',
})
export class FeaturedStoryWithTitleListLayoutComponent {
	article = input<NewsCardViewModel>()
	listArticles = input<NewsCardViewModel[]>([])
}
