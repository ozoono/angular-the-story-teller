import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { newsTopics } from '@/core/models/news-topic.model.ts'

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './app-header.component.html',
	styleUrl: './app-header.component.css',
})
export class AppHeaderComponent {
	protected readonly categories = newsTopics

	currentDate: string = new Date().toLocaleDateString('es-ES', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}
