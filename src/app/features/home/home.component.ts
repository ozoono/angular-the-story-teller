import { Component, inject, type OnInit } from '@angular/core'
import { HomeEntertainmentSectionComponent } from '@/features/home/sections/home-entertainment-section/home-entertainment-section.component.ts'
import { HomeMainSectionComponent } from '@/features/home/sections/home-main-section/home-main-section.component.ts'
import { HomePopularSectionComponent } from '@/features/home/sections/home-popular-section/home-popular-section.component.ts'
import { HomeSportsSectionComponent } from '@/features/home/sections/home-sports-section/home-sports-section.component.ts'
import { HomeBreakingSectionComponent } from '@/features/home/sections/home-breaking-section/home-breaking-section.ts'
import { newsTopics } from '@/core/models/news-topic.model.ts'
import { NewsStore } from '@/core/stores/news.store.ts'

@Component({
	selector: 'app-home',
	imports: [
		HomeEntertainmentSectionComponent,
		HomeMainSectionComponent,
		HomePopularSectionComponent,
		HomeSportsSectionComponent,
		HomeBreakingSectionComponent,
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
