import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Edge, Node, Layout, MiniMapPosition } from '@swimlane/ngx-graph';
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
import { ITree } from '../interfaces/ITree';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.scss']
})
export class OrgChartComponent implements OnInit {

  miFormulario: FormGroup = this.fb.group({
    search: ['', [Validators.required]]
  });

  //Variable vista;
  view;
  vista: boolean = false;
  variable: number;
  treeNodes: ITree[] = [];
  organizationalUnit: IOrganizationalUnit[] = [];
  organizationalUnit2: IOrganizationalUnit[] = [];
  employees: IEmployee[] = [];
  employees2: IEmployee[] = [];
  //Posición del Minimapa
  MiniMapPosition: MiniMapPosition = MiniMapPosition.UpperLeft;

  public nodes: Node[] = [];
  public links: Edge[] = [];
  public layoutSettings = {
    orientation: 'TB',
  };
  public animar: boolean = false;
  public curve: any = shape.curveLinear;
  public layout: Layout = new DagreNodesOnlyLayout();

  zoomToFit$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();
  panToNode$: Subject<String> = new Subject();

  constructor(public dialog: MatDialog,
              private organizationalunitService: OrganizationalunitService,
              private employeeService: EmployeeService,
              private utilsService: UtilsService,
              private router: Router,
              private fb: FormBuilder) { 
                this.view = [innerWidth / 1.3, 400]; 
              }

  ngOnInit(): void {
    this.vista = (this.router.url.includes('org-chart-view'))?true:false;
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
    let searchTree : ITree[] = [];
    this.treeNodes = this.treeNodes.filter(treeNode => {
      if(treeNode.id !== idNode){
        return treeNode
      }else{
        searchTree = this.treeNodes.filter(treeNode=> treeNode.id === idNode);
      }
    });
    const found = (searchTree.length>0)?true:false;
    if(!found){  
      // Si entra aqui es porque no hay nodos ocultos en el nodo padre. Por esa razón debemos borrar del DOM y almacenarla en memoria
      const organizationalUnitsID: number[] = [];
      let iTree: ITree = {id: 0, OrganizationalUnit: [], Employee: []};
      let band: boolean = false;
      for(let i = 0; i<this.organizationalUnit2.length; i++){
        if(!band && this.organizationalUnit2[i].id === idNode){
          iTree.id = idNode;
          this.employees2 = this.utilsService.hideShowNodes(false, organizationalUnitsID, this.organizationalUnit2, i, this.employees2, iTree);
          band = true;
          continue;
        }
        if(band && this.organizationalUnit2[i]){
          for(let j = 0; j<organizationalUnitsID.length; j++){
            if(this.organizationalUnit2[i].parentId === organizationalUnitsID[j]){
              this.employees2 = this.utilsService.hideShowNodes(true, organizationalUnitsID, this.organizationalUnit2, i, this.employees2, iTree);
              i--;
              break;
            }
          }
        }
      }
      this.treeNodes.push(iTree);
    }else{
      // Si entra aqui es porque existe contenido oculto y se debe volver a meter los nodos ocultos al DOM
      searchTree[0].OrganizationalUnit.forEach(org => {
        this.organizationalUnit2.push(org);
      });
      searchTree[0].Employee.forEach(emp => {
        this.employees2.push(emp);
      });
      // Antes de volve a pintar los nodos en el DOM debemos ordenarlos.
      this.organizationalUnit2.sort((a,b)=> a.id - b.id);
      this.employees2.sort((a,b)=> a.id - b.id);
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

        if(resp.res === 0){  // 0 = agregar COMPANY al array organizationalUnit.
          this.organizationalUnit.push(resp.organizational);
        }else if(resp.res === 1){  // 1 = agregar DEPARTMENT o TEAM al array organizationalUnit y agregar LEADER al array employees.
          this.organizationalUnit.push(resp.organizational);
          this.employees.push(resp.employee);
        }else if(resp.res === 2){   // 2 = agregar COLLABORATOR al array employees y actualizar el array organizationalUnit
          this.employees.push(resp.collaborator);
          const indexOrganizational = this.organizationalUnit.findIndex(organizationalunit => organizationalunit.id === resp.organizational.id);
          this.organizationalUnit[indexOrganizational] = resp.organizational;
        }
        this.dibujarDiagram(this.employees, this.organizationalUnit); // dibujar los cambios
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
    this.dibujarDiagram(this.employees, this.organizationalUnit);
  }

  acercar(){
    this.variable = this.variable + 0.1;
  }

  alejar(){
    this.variable = this.variable - 0.1;
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

  animaciones() {
    this.animar = !this.animar;
  }

  onResize(event) {
    this.view = [event.target.innerWidth / 1.35, 500];
  }

  Buscar(){
    if(!this.miFormulario.valid){
      return;
    }
    const organizationName = this.utilsService.quitarEspacios(this.miFormulario.get('search').value);
    const organization = this.organizationalUnit.find(org => org.name.toLowerCase() === organizationName.toLowerCase());
    if(!organization){
      return;
    }
    this.variable = 0.5;
    this.panToNode$.next(`organizationalUnit-${organization.id}`);
  }

  zoom() {
    return new Promise((resolve, reject)=> {
      this.variable = 0.5;
      setTimeout(() => {
        resolve('')
      }, 10);
    })
  }
}
