import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.scss']
})
export class OrgChartComponent implements OnInit {

  organizationalUnit: IOrganizationalUnit[] = [];
  employees: IEmployee[] = [];

  public nodes: Node[] = [];
  public links: Edge[] = [];
  public layoutSettings = {
    orientation: 'TB'
  };
  public curve: any = shape.curveLinear;
  public layout: Layout = new DagreNodesOnlyLayout();

  constructor(public dialog: MatDialog,
              private organizationalunitService: OrganizationalunitService,
              private employeeService: EmployeeService,
              private utilsService: UtilsService) { }

  ngOnInit(): void {
    this.organizationalunitService.getOrganizationalUnit()
    .subscribe(resp=> {
      this.organizationalUnit = resp
      this.employeeService.getEmployees()
        .subscribe(resp=> {
          this.employees = resp, 
          this.dibujarDiagram();
        });
    });
  }

  dibujarDiagram(){
    this.nodes = [];
    this.links = [];
    //Filtramos y separamos en dos arreglos(Líderes y Colaboradores)
    let leaders: IEmployee[] = this.employees.filter(employee => employee.position === 'LEADER');
    let collaborators: IEmployee[] = this.employees.filter(employee => employee.position === 'COLLABORATOR');

    for (const orgUnit of this.organizationalUnit) {
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

    for (const orgUnit of this.organizationalUnit) {
      if (!orgUnit.parentId) {
        continue;
      }

      const edge: Edge = {
        source: `organizationalUnit-${orgUnit.parentId}`,
        target: `organizationalUnit-${orgUnit.id}`,
      };

      this.links.push(edge);
    }

    for (const collaborator of collaborators) {
      const edge: Edge = {
        source: `organizationalUnit-${collaborator.organizationalUnitId}`,
        target: `employee-${collaborator.id}`,
      };

      this.links.push(edge);
    }
    console.log(this.organizationalUnit);
    [...this.nodes];
    [...this.links];
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
          this.employeeService.deleteEmployee(idNode)
            .subscribe(resp => {
              this.employees = this.employees.filter(employee => employee.id !== idNode);
              this.dibujarDiagram();
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
        this.dibujarDiagram(); // Draw the changes
      });
  }

  eliminarNodosDependientes(idNode: number, node: Node){
    const organizationalUnitsID: number[] = [];
    const employeesID: number[] = [];
    let band: boolean = false;
    for(let i = 0; i<this.organizationalUnit.length; i++){
      if(!band && this.organizationalUnit[i].id === idNode){
        this.employees = this.utilsService.RemoveLeaderAndCollaboratorAndOrganizational(organizationalUnitsID, employeesID, this.organizationalUnit, i, this.employees);
        band = true;
      }
      if(band && this.organizationalUnit[i]){
        for(let j = 0; j<organizationalUnitsID.length; j++){
          if(this.organizationalUnit[i].parentId === organizationalUnitsID[j]){
            this.employees = this.utilsService.RemoveLeaderAndCollaboratorAndOrganizational(organizationalUnitsID, employeesID, this.organizationalUnit, i, this.employees);
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
    this.dibujarDiagram();
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
}
