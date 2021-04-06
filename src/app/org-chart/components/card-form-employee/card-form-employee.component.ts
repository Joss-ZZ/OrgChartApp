import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Node } from '@swimlane/ngx-graph';
import { IEmployee } from '../../interfaces/IEmployee';
import { EmployeeService } from '../../services/employee.service';
import { UtilsService } from '../../utils/utils.service';

@Component({
  selector: 'app-card-form-employee',
  templateUrl: './card-form-employee.component.html',
  styleUrls: ['./card-form-employee.component.scss']
})
export class CardFormEmployeeComponent implements OnInit {

  miForm!: FormGroup;
  employee: IEmployee;

  @Input() node: Node;
  constructor(private fb: FormBuilder,
              private employeeService: EmployeeService,
              private utilsService: UtilsService) { }

  ngOnInit(): void {
    this.miForm = this.fb.group({
      fullname: [this.node.data.fullname, [Validators.required]]
    });
  }

  update(event: string){
    if(!this.miForm.valid){
      return;
    };
    this.employee = this.miForm.value;
    const id = this.utilsService.splitID(this.node.id);
    this.employeeService.updateEmployee(id, this.employee)
      .subscribe(resp => console.log('actualizado correctamente'));
  }

}
