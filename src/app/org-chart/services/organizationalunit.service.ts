import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { IOrganizationalUnit } from '../interfaces/IOrganizationalUnit';

@Injectable({
  providedIn: 'root'
})
export class OrganizationalunitService {

  baseUrl: string = `${environment.baseUrl}/OrganizationalUnit`;

  constructor(private http: HttpClient) { }

  getOrganizationalUnit():Observable<IOrganizationalUnit[]> {
    return this.http.get<IOrganizationalUnit[]>(`${this.baseUrl}`);
  }

  addOrganizationalUnit(organizationalunit: IOrganizationalUnit): Observable<IOrganizationalUnit> {
    return this.http.post<IOrganizationalUnit>(`${this.baseUrl}`, organizationalunit);
  }

  deleteOrganizationalUnit(id: string): Observable<IOrganizationalUnit>{
    return this.http.delete<IOrganizationalUnit>(`${this.baseUrl}/${id}`);
  }

  updateOrganizationalUnit(id: string, organizationalunit: IOrganizationalUnit): Observable<IOrganizationalUnit> {
    return this.http.put<IOrganizationalUnit>(`${this.baseUrl}/${id}`, organizationalunit);
  }

}
