import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateLangService {
  constructor(private translate: TranslateService) {}

  load(): Promise<any> {
    const lang = localStorage.getItem('lang') || 'vi';
    this.translate.setDefaultLang('vi');
    return this.translate.use(lang).toPromise().catch(() => null);
  }
}

export { TranslateLangService as LanguageService };
