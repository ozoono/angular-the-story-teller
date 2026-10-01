import { Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NewsAuthorComponent } from '@/shared/ui/news-card/news-author.component.ts'
import { NewsSourceComponent } from '@/shared/ui/news-card/news-source.component.ts'
import { NewsLabelComponent } from '@/shared/ui/news-card/news-label.component.ts'
import type { NewsTopic } from '@/core/models/news-topic.model.ts'
import type { NewsDetailViewModel } from '@/shared/view-models/news-detail-view.model.ts'

@Component({
	selector: 'app-article-content',
	imports: [
		RouterLink,
		NewsAuthorComponent,
		NewsSourceComponent,
		NewsLabelComponent,
	],
	templateUrl: './article-content.component.html',
	styleUrl: './article-content.component.css',
})
export class ArticleContentComponent {
	readonly article = input.required<NewsDetailViewModel>()
	readonly topic = input<NewsTopic>()
}
