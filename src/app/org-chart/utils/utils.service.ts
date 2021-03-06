import { Injectable } from '@angular/core';
import { IEmployee } from '../interfaces/IEmployee';
import { IOrganizationalUnit } from '../interfaces/IOrganizationalUnit';
import { OrganizationalunitService } from '../services/organizationalunit.service';
import { EmployeeService } from '../services/employee.service';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(private organizationalunitService: OrganizationalunitService,
              private employeeService: EmployeeService) { }

  // Ejemplo: termino = "organizationalUnit-13", en este caso extraemos el 13 y lo retornamos
  splitID(termino: string): number {
    const idArr = termino.split('-');
    const id = Number(idArr[idArr.length-1]);
    return id;
  }

  RemoveLeaderAndCollaboratorAndOrganizational(eliminar: boolean,
    organizationalUnitsID: number[], employeesID: number[], organizationalUnit: IOrganizationalUnit[], indiceOrg: number, employees: IEmployee[]): IEmployee[]{
    organizationalUnitsID.push(organizationalUnit[indiceOrg].id);
    if(organizationalUnit[indiceOrg].leaderId && eliminar){ // Verificamos si se trata de un DEPARTMENT o TEAM para filtrar sus líderes.
      employeesID.push(organizationalUnit[indiceOrg].leaderId);
      employees = employees.filter(employee => employee.id !== organizationalUnit[indiceOrg].leaderId);
    }
    if(organizationalUnit[indiceOrg].collaboratorIdList){ // Si la Organización tiene COLLABORATORS entonces recorremos y filtramos a nuestros empleados para quitarlo del array.      
      organizationalUnit[indiceOrg].collaboratorIdList.forEach((collaboratorId) => {
        employeesID.push(collaboratorId);
        employees = employees.filter(employee => employee.id !== collaboratorId);
      });
    }
    if(eliminar){
      organizationalUnit.splice(indiceOrg, 1);
    }
    return employees;
  }

}
