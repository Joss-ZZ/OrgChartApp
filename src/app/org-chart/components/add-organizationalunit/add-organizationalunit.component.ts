import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Node } from '@swimlane/ngx-graph';

import { IOrganizationalUnit } from '../../interfaces/IOrganizationalUnit';
import { IEmployee } from '../../interfaces/IEmployee';
import { OrganizationalunitService } from '../../services/organizationalunit.service';
import { UtilsService } from '../../utils/utils.service';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-add-organizationalunit',
  templateUrl: './add-organizationalunit.component.html',
  styleUrls: ['./add-organizationalunit.component.scss']
})
export class AddOrganizationalunitComponent implements OnInit {

  miForm: FormGroup = this.fb.group({
    brand: ['', [Validators.required]],
    name: ['', [Validators.required]]
  });

  miForm2: FormGroup = this.fb.group({
    prefix: ['', [Validators.required]],
    name: ['', [Validators.required]],
    profile: ['', [Validators.required]],
    fullname: ['', [Validators.required]],
    job: ['', [Validators.required]]
  });

  @Input() type: string;
  @Input() data: Node;
  @Output() onActionClick: EventEmitter<any> = new EventEmitter();

  organizationalUnit: IOrganizationalUnit;
  employee: IEmployee;

  constructor(private fb: FormBuilder,
              private organizationalunitService: OrganizationalunitService,
              private employeeService: EmployeeService,
              private utilsService: UtilsService) { }

  ngOnInit(): void {
  }

  close(){
    this.onActionClick.emit();
  }

  addCompany(){
    if(!this.miForm.valid){
      return;
    }
    this.organizationalUnit = this.miForm.value;
    this.organizationalUnit.type = this.type;
    this.organizationalUnit.parentId = this.utilsService.splitID(this.data.id);
    this.organizationalunitService.addOrganizationalUnit(this.organizationalUnit)
      .subscribe(organizational => {
        this.onActionClick.emit({organizational, res: 0});
      }); 
  }

  addTeamOrDepartment(){
    if(!this.miForm2.valid){
      return;
    }
    
    const { prefix, name, profile, fullname, job } = this.miForm2.value;
    this.employee = {profile, fullname, job, position: 'LEADER'};
    this.organizationalUnit = {prefix, name};
    this.organizationalUnit.type = this.type;
    this.organizationalUnit.parentId = this.utilsService.splitID(this.data.id);
    this.organizationalunitService.addOrganizationalUnit(this.organizationalUnit) // add DEPARTMENT or TEAM
    .subscribe(org => {
      if(org){ 
        this.employee.organizationalUnitId = org.id;
        this.employeeService.addEmployee(this.employee) // add employee LEADER
          .subscribe(employee => {  
            org.leaderId = employee.id;
            this.organizationalunitService.updateOrganizationalUnit(org.id, org) // add leaderId field in DEPARTMENT or TEAM
              .subscribe(organizational => {
                this.onActionClick.emit({employee, organizational, res: 1});
              });
          });
      }
    }); 
    
  }

}
