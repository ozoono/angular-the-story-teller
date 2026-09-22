import { Component, inject, type OnInit } from '@angular/core'
import { HomeEntertainmentSectionComponent } from '@/features/home/components/home-entertainment-section/home-entertainment-section.component.ts'
import { HomeMainSectionComponent } from '@/features/home/components/home-main-section/home-main-section.component.ts'
import { HomePopularSectionComponent } from '@/features/home/components/home-popular-section/home-popular-section.component.ts'
import { HomeSportsSectionComponent } from '@/features/home/components/home-sports-section/home-sports-section.component.ts'
import { newsTopics } from '@/core/models/news-topic.model.ts'
import { NewsStore } from '@/core/stores/news.store.ts'

@Component({
	selector: 'app-home',
	imports: [
		HomeEntertainmentSectionComponent,
		HomeMainSectionComponent,
		HomePopularSectionComponent,
		HomeSportsSectionComponent,
	],
	templateUrl: './home.component.html',
	styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
	private readonly newsStore = inject(NewsStore)

	ngOnInit(): void {
		void this.newsStore.initTopics(newsTopics)
	}
}
