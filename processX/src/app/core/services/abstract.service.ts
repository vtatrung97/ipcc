import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export abstract class AbstractService {
  constructor(
    protected http: HttpClient,
    protected toastSvc?: any,
    protected translate?: any
  ) {}

  protected handleError(error: any): Observable<never> {
    console.error('API Error: ', error);
    return throwError(() => error);
  }

  protected postRequest(url: string, body: any): Observable<any> {
    return this.http.post(url, body);
  }
}
