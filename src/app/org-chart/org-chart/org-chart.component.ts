import { Component, OnInit } from '@angular/core';

import { Edge, Node, Layout } from '@swimlane/ngx-graph';
import { DagreNodesOnlyLayout } from './customDagreNodesOnly';
import * as shape from 'd3-shape';

import { IOrganizationalUnit } from '../interfaces/IOrganizationalUnit';
import { IEmployee } from '../interfaces/IEmployee';
import { MatDialog } from '@angular/material/dialog';
import { AddComponent } from '../components/add/add.component';
import { OrganizationalunitService } from '../services/organizationalunit.service';
import { EmployeeService } from '../services/employee.service';

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
              private employeeService: EmployeeService) { }

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

    [...this.nodes];
    [...this.links];
  }

  delete(){
    console.log('eliminar');
  }

  add(node: Node){
    const dialogRef = this.dialog.open(AddComponent, {
      width: '600px',
      data: node
    });

    dialogRef.afterClosed()
      .subscribe(resp => {
        if(!resp){
          return;
        }

        //Lógica para agregar nodos

      });
  }

}
