import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './app-header.component.html',
	styleUrl: './app-header.component.css',
})
export class AppHeaderComponent {
	currentDate: string = new Date().toLocaleDateString('es-ES', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}
