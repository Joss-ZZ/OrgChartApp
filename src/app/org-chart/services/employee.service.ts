import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { IEmployee } from '../interfaces/IEmployee';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  baseUrl: string = `${environment.baseUrl}/Employee`;

  constructor(private http: HttpClient) { }

  getEmployees():Observable<IEmployee[]> {
    return this.http.get<IEmployee[]>(`${this.baseUrl}`);
  }

  addEmployee(employee: IEmployee): Observable<IEmployee> {
    return this.http.post<IEmployee>(`${this.baseUrl}`, employee);
  }

  deleteEmployee(id: number): Observable<IEmployee>{
    return this.http.delete<IEmployee>(`${this.baseUrl}/${id}`);
  }

  updateEmployee(id: number, employee: IEmployee): Observable<IEmployee> {
    return this.http.put<IEmployee>(`${this.baseUrl}/${id}`, employee);
  }

}
