import { Component, signal } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { AppHeaderComponent } from '@shared/components/app-header/app-header.component.ts'
import { AppFooterComponent } from '@shared/components/app-footer/app-footer.component.ts'

@Component({
	imports: [RouterOutlet, AppHeaderComponent, AppFooterComponent],
	selector: 'app-root',
	styleUrl: './app.component.css',
	templateUrl: './app.component.html',
})
export class App {
	protected readonly title = signal('newspaper')
}
