import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Node } from '@swimlane/ngx-graph';

@Component({
  selector: 'app-card-form-employee',
  templateUrl: './card-form-employee.component.html',
  styleUrls: ['./card-form-employee.component.scss']
})
export class CardFormEmployeeComponent implements OnInit {

  miForm!: FormGroup;

  @Input() node: Node;
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.miForm = this.fb.group({
      fullname: [this.node.data.fullname, [Validators.required]]
    });
  }

  update(event: string){

  }

}
