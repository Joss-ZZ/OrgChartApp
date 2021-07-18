import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Edge, Node, Layout } from '@swimlane/ngx-graph';
import { DagreNodesOnlyLayout } from './customDagreNodesOnly';
import * as shape from 'd3-shape';

import { IOrganizationalUnit } from '../interfaces/IOrganizationalUnit';
import { IEmployee } from '../interfaces/IEmployee';

import { AddComponent } from '../components/add/add.component';
import { DeleteAlertComponent } from '../components/delete-alert/delete-alert.component';

import { OrganizationalunitService } from '../services/organizationalunit.service';
import { EmployeeService } from '../services/employee.service';
import { UtilsService } from '../utils/utils.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.scss']
})
export class OrgChartComponent implements OnInit {

  variable: number;
  organizationalUnit: IOrganizationalUnit[] = [];
  organizationalUnit2: IOrganizationalUnit[] = [];
  employees: IEmployee[] = [];
  employees2: IEmployee[] = [];

  public nodes: Node[] = [];
  public links: Edge[] = [];
  public layoutSettings = {
    orientation: 'TB'
  };
  public curve: any = shape.curveLinear;
  public layout: Layout = new DagreNodesOnlyLayout();

  zoomToFit$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();

  constructor(public dialog: MatDialog,
              private organizationalunitService: OrganizationalunitService,
              private employeeService: EmployeeService,
              private utilsService: UtilsService) { }

  ngOnInit(): void {
    this.variable = 0.1;
    this.organizationalunitService.getOrganizationalUnit()
    .subscribe(resp=> {
      this.organizationalUnit = resp
      this.organizationalUnit2 = resp;
      this.employeeService.getEmployees()
        .subscribe(resp=> {
          this.employees = resp, 
          this.employees2 = resp,
          this.dibujarDiagram(this.employees, this.organizationalUnit);
        });
    });
  }


  dibujarDiagram(employees: IEmployee[], organizationalUnit: IOrganizationalUnit[]){
    this.nodes = [];
    this.links = [];
    //Filtramos y separamos en dos arreglos(Líderes y Colaboradores)
    let leaders: IEmployee[] = employees.filter(employee => employee.position === 'LEADER');
    let collaborators: IEmployee[] = employees.filter(employee => employee.position === 'COLLABORATOR');

    for (const orgUnit of organizationalUnit) {
      if(orgUnit.type === 'COMPANY'){
        const node: Node = {
          id: `organizationalUnit-${orgUnit.id}`,
          label: orgUnit.name,
          data: {
            brand: orgUnit.brand,
            type: orgUnit.type,
            name: orgUnit.name,          
            upperManagerId: `organizationalUnit-${orgUnit.parentId}`
          }
        };
  
        this.nodes.push(node);
      }else{
        leaders.forEach((leader)=> {
          if(orgUnit.leaderId === leader.id){
            const node: Node = {
              id: `organizationalUnit-${orgUnit.id}`,
              label: orgUnit.name,
              data: {
                profile: leader.profile,
                type: orgUnit.type,
                prefix: orgUnit.prefix,
                name: orgUnit.name,
                position: leader.position,
                fullname: leader.fullname,
                leaderId: leader.id,
                collaboratorIdList: orgUnit.collaboratorIdList,
                upperManagerId: `organizationalUnit-${orgUnit.parentId}`
              }
            };      
            this.nodes.push(node);     
          }
        });
      }
    }

    for (const collaborator of collaborators){
      const node: Node = {
        id: `employee-${collaborator.id}`,
        label: collaborator.fullname,
        data: {
          profile: collaborator.profile,
          fullname: collaborator.fullname,
          job: collaborator.job,
          position: collaborator.position,
          upperManagerId: `organizationalUnit-${collaborator.organizationalUnitId}`
        }
      };      
      this.nodes.push(node);
    }

    for (const orgUnit of organizationalUnit) {
      if (!orgUnit.parentId) {
        continue;
      }

      const edge: Edge = {
        source: `organizationalUnit-${orgUnit.parentId}`,
        target: `organizationalUnit-${orgUnit.id}`,
        id: `Org-${orgUnit.id}`
      };

      this.links.push(edge);
    }

    for (const collaborator of collaborators) {
      const edge: Edge = {
        source: `organizationalUnit-${collaborator.organizationalUnitId}`,
        target: `employee-${collaborator.id}`,
        id: `Emp-${collaborator.id}`
      };

      this.links.push(edge);
    }
    // console.log(this.organizationalUnit);
    [...this.nodes];
    [...this.links];

  }

  hide(node: Node){
    const idNode = this.utilsService.splitID(node.id);
    const organizationalUnitsID: number[] = [];
    const employeesID: number[] = [];
    let band: boolean = false;
    for(let i = 0; i<this.organizationalUnit2.length; i++){
      if(!band && this.organizationalUnit2[i].id === idNode){
        this.employees2 = this.utilsService.RemoveLeaderAndCollaboratorAndOrganizational(false, organizationalUnitsID, employeesID, this.organizationalUnit2, i, this.employees2);
        band = true;
        continue;
      }
      if(band && this.organizationalUnit2[i]){
        for(let j = 0; j<organizationalUnitsID.length; j++){
          if(this.organizationalUnit2[i].parentId === organizationalUnitsID[j]){
            this.employees2 = this.utilsService.RemoveLeaderAndCollaboratorAndOrganizational(true, organizationalUnitsID, employeesID, this.organizationalUnit2, i, this.employees2);
            i--;
            break;
          }
        }
      }
    }
    this.dibujarDiagram(this.employees2, this.organizationalUnit2);
    
  }

  delete(node: Node){
    const dialogRef = this.dialog.open(DeleteAlertComponent, {
      width: '250px',
      data: node
    });

    dialogRef.afterClosed()
      .subscribe( async resp => {
        if(!resp){ // Si el usuario cancela el diálogo el valor de resp = undefined y hacemos un return para que no se siga ejecturando el método.
          return;
        }
        // Separamos el ID del texto por medio de nuestro servicio
        const idNode = this.utilsService.splitID(node.id);
        // Animación opcional.
        await this.animarEliminacion(node.id);

        if(node.data.type){ // Se trata de una organización de tipo DEPARTMENT o TEAM
          this.eliminarNodosDependientes(idNode, node);
        }

        if(node.data.position === 'COLLABORATOR'){ // Se trata de un COLLABORATOR
          const org = this.organizationalUnit.find(org => org.id === this.utilsService.splitID(node.data.upperManagerId));
          const index = org.collaboratorIdList.indexOf(idNode);
          org.collaboratorIdList.splice(index, 1);
          const organizationalUnit: IOrganizationalUnit = { collaboratorIdList: org.collaboratorIdList };
          this.employeeService.deleteEmployee(idNode)
            .subscribe(resp => {
              this.employees = this.employees.filter(employee => employee.id !== idNode);
              this.organizationalunitService.updateOrganizationalUnit(org.id, organizationalUnit)
                .subscribe(resp2=> this.dibujarDiagram(this.employees, this.organizationalUnit));
            });
        }        
      });
  }

  add(node: Node){
    const dialogRef = this.dialog.open(AddComponent, {
      width: '600px',
      data: node
    });

    dialogRef.afterClosed()
      .subscribe(resp => {
        if(!resp){ // Si el usuario cancela el diálogo el valor de resp = undefined y hacemos un return para que no se siga ejecturando el método.
          return;
        }

        if(resp.res === 0){  // 0 = add COMPANY to array organizationalUnit.
          this.organizationalUnit.push(resp.organizational);
        }else if(resp.res === 1){  // 1 = add DEPARTMENT or TEAM to array organizationalUnit and add LEADER to array employees.
          this.organizationalUnit.push(resp.organizational);
          this.employees.push(resp.employee);
        }else if(resp.res === 2){   // 2 = add COLLABORATOR to array employees and update array organizationalUnit
          this.employees.push(resp.collaborator);
          const indexOrganizational = this.organizationalUnit.findIndex(organizationalunit => organizationalunit.id === resp.organizational.id);
          this.organizationalUnit[indexOrganizational] = resp.organizational;
        }
        this.dibujarDiagram(this.employees, this.organizationalUnit); // Draw the changes
      });
  }

  eliminarNodosDependientes(idNode: number, node: Node){
    const organizationalUnitsID: number[] = [];
    const employeesID: number[] = [];
    let band: boolean = false;
    for(let i = 0; i<this.organizationalUnit.length; i++){
      if(!band && this.organizationalUnit[i].id === idNode){
        this.employees = this.utilsService.RemoveLeaderAndCollaboratorAndOrganizational(true, organizationalUnitsID, employeesID, this.organizationalUnit, i, this.employees);
        band = true;
      }
      if(band && this.organizationalUnit[i]){
        for(let j = 0; j<organizationalUnitsID.length; j++){
          if(this.organizationalUnit[i].parentId === organizationalUnitsID[j]){
            this.employees = this.utilsService.RemoveLeaderAndCollaboratorAndOrganizational(true, organizationalUnitsID, employeesID, this.organizationalUnit, i, this.employees);
            i--;
            break;
          }
        }
      }
    }

    // if(organizationalUnitsID.length>0){
    //   organizationalUnitsID.forEach(organizationalunitID => {
    //     this.organizationalunitService.deleteOrganizationalUnit(organizationalunitID).subscribe(resp => console.log('Organización eliminada!'))
    //   });
    // }
    // if(employeesID.length>0){
    //   employeesID.forEach(employeeID=> {
    //     this.employeeService.deleteEmployee(employeeID).subscribe(resp=> console.log('Empleado eliminado!'))
    //   });
    // }
    this.dibujarDiagram(this.employees, this.organizationalUnit);
  }

  //Animaciones(Opcional)
  animarEliminacion(id: string) {
    return new Promise((resolve, reject)=>{
      const animarDelete = document.getElementById(`node${id}`);
      animarDelete.classList.add('containerAnim');
      setTimeout(() => {
        resolve('');
      }, 500);
    });
  }

  acercar(){
    this.variable = this.variable + 0.1;
  }

  alejar(){
    this.variable = this.variable - 0.1;
  }

}
