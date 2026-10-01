import { Component, inject, type OnInit } from '@angular/core'
import { HomeEntertainmentSectionComponent } from '@/features/home/sections/home-entertainment-section/home-entertainment-section.component.ts'
import { HomeMainSectionComponent } from '@/features/home/sections/home-main-section/home-main-section.component.ts'
import { HomePopularSectionComponent } from '@/features/home/sections/home-popular-section/home-popular-section.component.ts'
import { HomeSportsSectionComponent } from '@/features/home/sections/home-sports-section/home-sports-section.component.ts'
import { HomeBreakingSectionComponent } from '@/features/home/sections/home-breaking-section/home-breaking-section.ts'
import { NewsPageDataService } from '@/core/services/news-page-data.service.ts'

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
	private readonly pageData = inject(NewsPageDataService)

	ngOnInit(): void {
		void this.pageData.loadHome()
	}
}
