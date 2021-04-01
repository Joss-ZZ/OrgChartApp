import { Component, Input, OnInit } from '@angular/core';
import { Node } from '@swimlane/ngx-graph';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  @Input() type: string;
  @Input() data: Node;
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  add(){

  }

  close(){

  }

}
