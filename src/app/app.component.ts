import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
// import { ServiceWorkerModule } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';

import { DataService, ThemeService } from './services';
import { MaterialModule } from './@shared/material.module';
import { PageComponent } from './components/page/page.component';
import { ThemeFormComponent } from './components/theme-form/theme-form.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { TemplateDialogComponent } from './components/template-dialog/template-dialog.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,

    ThemeFormComponent,
    ConfirmDialogComponent,
    TemplateDialogComponent,

    PageComponent,
    // TextFormComponent,
    // ImageFormComponent,
    // TimelineFormComponent,

    // ServiceWorkerModule.register('ngsw-worker.js', {
    //   enabled: environment.production,
    //   // Register the ServiceWorker as soon as the app is stable
    //   // or after 30 seconds (whichever comes first).
    //   registrationStrategy: 'registerWhenStable:30000'
    // }),
  ]
})
export class AppComponent implements AfterViewInit {

  useStorage: Observable<boolean>;
  sidebarOpen = false;

  constructor(
    private readonly dialog: MatDialog,
    private readonly dataService: DataService,
    private readonly themeService: ThemeService,
  ) {
    this.useStorage = this.dataService.persistentStorage.asObservable();
  }

  ngAfterViewInit() {
    this.themeService.applyTheme();
  }

  async onUpload(event) {
    const target = event.target as HTMLInputElement;
    if (!target.files || !target.files.length) {
      return alert('Import failed');
    }

    const [file] = event.target.files;

    const content = await this.readFileContent(file);
    this.dataService.import(content);
  }

  onDownload() {
    const content = this.dataService.export();

    const blob = new Blob([JSON.stringify(content)], { type: 'text/plain' });

    saveAs(blob, `cv.json`);
  }

  onPrint() {
    window.print();
  }

  onReset() {
    this.dataService.reset();
  }

  onOpenTemplates() {
    this.dialog.open(TemplateDialogComponent);
  }

  onUseStorageChanged(change: MatSlideToggleChange) {
    if (change.checked) {
      this.dataService.enableStorage();
    } else {
      this.dataService.disableStorage();
    }
  }

  private readFileContent(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onerror = reject;
      fileReader.onabort = reject;

      fileReader.onload = (e: any) => {
        const result = JSON.parse(e.target.result);
        resolve(result);
      };

      fileReader.readAsText(file);
    });
  }

}
