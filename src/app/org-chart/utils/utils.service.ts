import { Injectable } from '@angular/core';
import { IEmployee } from '../interfaces/IEmployee';
import { IOrganizationalUnit } from '../interfaces/IOrganizationalUnit';
import { OrganizationalunitService } from '../services/organizationalunit.service';
import { EmployeeService } from '../services/employee.service';
import { ITree } from '../interfaces/ITree';

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

  quitarEspacios(termino: string): string {
    const nuevoString = termino.trim();
    return nuevoString.replace(/\s+/g, ' '); 
  }

  RemoveLeaderAndCollaboratorAndOrganizational(
    organizationalUnitsID: number[], employeesID: number[], organizationalUnit: IOrganizationalUnit[], indiceOrg: number, employees: IEmployee[]): IEmployee[]{
    organizationalUnitsID.push(organizationalUnit[indiceOrg].id);
    if(organizationalUnit[indiceOrg].leaderId){ // Verificamos si se trata de un DEPARTMENT o TEAM para filtrar sus líderes.
      employeesID.push(organizationalUnit[indiceOrg].leaderId);
      employees = employees.filter(employee => employee.id !== organizationalUnit[indiceOrg].leaderId);
    }
    if(organizationalUnit[indiceOrg].collaboratorIdList){ // Si la Organización tiene COLLABORATORS entonces recorremos y filtramos a nuestros empleados para quitarlo del array.      
      organizationalUnit[indiceOrg].collaboratorIdList.forEach((collaboratorId) => {
        employeesID.push(collaboratorId);
        employees = employees.filter(employee => employee.id !== collaboratorId);
      });
    }
    organizationalUnit.splice(indiceOrg, 1);
    return employees;
  }

  hideShowNodes(eliminar: boolean,
    organizationalUnitsID: number[], organizationalUnit: IOrganizationalUnit[], indiceOrg: number, employees: IEmployee[], iTree: ITree): IEmployee[]{
      organizationalUnitsID.push(organizationalUnit[indiceOrg].id);      
    if(organizationalUnit[indiceOrg].leaderId && eliminar){ // Verificamos si se trata de un DEPARTMENT o TEAM para filtrar sus líderes.
      employees = employees.filter(employee => {
        if(employee.id !== organizationalUnit[indiceOrg].leaderId){
          return employee
        }else{
          iTree.Employee.push(employee);
        }
      });
    }
    if(organizationalUnit[indiceOrg].collaboratorIdList){ // Si la Organización tiene COLLABORATORS entonces recorremos y filtramos a nuestros empleados para quitarlo del array.      
      organizationalUnit[indiceOrg].collaboratorIdList.forEach((collaboratorId) => {
        employees = employees.filter(employee => {
          if(employee.id !== collaboratorId){
            return employee;
          }else{
            iTree.Employee.push(employee);
          }
        });
      });
    }
    if(!eliminar){
      return employees;
    }
    iTree.OrganizationalUnit.push(organizationalUnit[indiceOrg]);
    organizationalUnit.splice(indiceOrg, 1);
    return employees;
  }

}
