import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Node } from '@swimlane/ngx-graph';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IEmployee } from '../../interfaces/IEmployee';
import { UtilsService } from '../../utils/utils.service';
import { EmployeeService } from '../../services/employee.service';
import { OrganizationalunitService } from '../../services/organizationalunit.service';
import { IOrganizationalUnit } from '../../interfaces/IOrganizationalUnit';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss']
})
export class AddEmployeeComponent implements OnInit {

  miForm: FormGroup = this.fb.group({
    profile: ['', [Validators.required]],
    fullname: ['', [Validators.required]],
    job: ['', [Validators.required]]
  });

  employee: IEmployee;
  org: IOrganizationalUnit = {
    collaboratorIdList: []
  };

  position: string = 'COLLABORATOR'

  @Input() data: Node;
  @Output() onActionClick: EventEmitter<any> = new EventEmitter();

  constructor(private fb: FormBuilder,
              private employeeService: EmployeeService,
              private organizationalunitService: OrganizationalunitService,
              private utilsService: UtilsService) { }

  ngOnInit(): void {
    this.org.collaboratorIdList = this.data.data.collaboratorIdList || [];
    console.log(this.org);
  }

  add(){
    if(this.miForm.valid){
      this.employee = this.miForm.value;
      this.employee.position = this.position;
      this.employee.organizationalUnitId = this.utilsService.splitID(this.data.id);
      this.employeeService.addEmployee(this.employee)
        .subscribe(collaborator => {
          if(collaborator){
            this.org.collaboratorIdList.push(collaborator.id);
            console.log(this.org);
            const Id = this.utilsService.splitID(this.data.id);
            this.organizationalunitService.updateOrganizationalUnit(Id, this.org)
              .subscribe(organizational => {
                this.onActionClick.emit({collaborator, organizational, res: 2});
              });
          }
        });
    }
  }

  close(){
    this.onActionClick.emit();
  }

}
