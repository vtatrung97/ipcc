import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SERVICES } from '@env/environment';
import { AbstractService } from '@core/services/abstract.service';

@Injectable({
  providedIn: 'root'
})
export class KeycloakRoleService extends AbstractService {

  constructor(
    http: HttpClient,
    toastSvc?: any,
    translate?: any
  ) {
    super(http, toastSvc, translate);
  }

  get SERVICE_URL(): string {
    return `${SERVICES?.ACCOUNT_API_URL || '/api/account'}/api/v1/keycloak-roles`;
  }

  searchRoles(searchCriteria: any): Observable<any> {
    return this.http.get<any>(this.SERVICE_URL, { params: searchCriteria });
  }

  getRoleDetail(roleId: string): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/${roleId}`);
  }

  countAssignedUsers(roleId: string): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/${roleId}/assigned-users`);
  }

  createRole(roleDTO: any): Observable<any> {
    return this.http.post<any>(this.SERVICE_URL, roleDTO);
  }

  updateRole(roleId: string, roleDTO: any): Observable<any> {
    return this.http.put<any>(`${this.SERVICE_URL}/${roleId}`, roleDTO);
  }

  deleteSingleRole(roleId: string): Observable<any> {
    return this.http.delete<any>(`${this.SERVICE_URL}/${roleId}`);
  }

  deleteRoles(roleIds: any): Observable<any> {
    return this.http.request<any>('delete', `${this.SERVICE_URL}/bulk`, { body: roleIds });
  }

  getCreators(): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/creators`);
  }

  getUpdators(): Observable<any> {
    return this.http.get<any>(`${this.SERVICE_URL}/updators`);
  }
}
