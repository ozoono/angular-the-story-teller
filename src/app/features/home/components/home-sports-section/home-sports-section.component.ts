import { Component, computed, inject } from '@angular/core'
import { NewsStore } from '@/core/stores/news.store.ts'
import { PhotoTitleListLayoutComponent } from '@/shared/ui/news-layouts/photo-title-list/photo-title-list-layout.component.ts'

@Component({
	selector: 'app-home-sports-section',
	imports: [PhotoTitleListLayoutComponent],
	templateUrl: './home-sports-section.component.html',
	styleUrl: './home-sports-section.component.css',
})
export class HomeSportsSectionComponent {
	private readonly articles = inject(NewsStore).articlesFor('BUSINESS')

	protected readonly leftColumnArticle = computed(() => this.articles()[12])
	protected readonly leftColumnTitleArticles = computed(() =>
		this.articles().slice(13, 16),
	)
	protected readonly rightColumnArticle = computed(() => this.articles()[16])
	protected readonly rightColumnTitleArticles = computed(() =>
		this.articles().slice(17, 20),
	)
}
