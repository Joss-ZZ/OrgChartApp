import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Node } from '@swimlane/ngx-graph';

import { IOrganizationalUnit } from '../../interfaces/IOrganizationalUnit';

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
    fullname: ['', [Validators.required]]
  });

  @Input() type: string;
  @Input() data: Node;
  @Output() onActionClick: EventEmitter<undefined | IOrganizationalUnit> = new EventEmitter();

  empresa: IOrganizationalUnit = {
    brand: '',
    name: '',
    type: ''
  }

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  close(){
    this.onActionClick.emit();
  }

  add(){
    this.empresa = this.miForm.value;
    this.onActionClick.emit(this.empresa);
  }

}
