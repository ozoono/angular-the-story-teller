import { Component, input } from '@angular/core'
import type { NewsCardViewModel } from '@/shared/view-models/news-card-view.model.ts'
import { TitleOnlyCardComponent } from '@/shared/ui/news-card/title-only-card/title-only-card.component.ts'

@Component({
	selector: 'app-stacked-title-list-layout',
	imports: [TitleOnlyCardComponent],
	templateUrl: './stacked-title-list-layout.component.html',
	styleUrl: './stacked-title-list-layout.component.css',
})
export class StackedTitleListLayoutComponent {
	articles = input<NewsCardViewModel[]>([])
}
