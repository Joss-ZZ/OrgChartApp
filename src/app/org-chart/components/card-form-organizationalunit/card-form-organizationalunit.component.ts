import { Component, Input, OnInit } from '@angular/core';
import { Node } from '@swimlane/ngx-graph';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-card-form-organizationalunit',
  templateUrl: './card-form-organizationalunit.component.html',
  styleUrls: ['./card-form-organizationalunit.component.scss']
})
export class CardFormOrganizationalunitComponent implements OnInit {

  miForm!: FormGroup;
  miForm2!: FormGroup;

  constructor(private fb: FormBuilder) { }

  @Input() node!: Node;

  ngOnInit(): void {
    if(this.node.data.type === 'COMPANY'){
      this.miForm = this.fb.group({
        brand: [this.node.data.brand],
        name: [this.node.data.name]
      });
    }else{
      this.miForm2 = this.fb.group({
        profile: [this.node.data.profile],
        type: [this.node.data.type],
        prefix: [this.node.data.prefix],
        name: [this.node.data.name],
        position: [this.node.data.position],
        fullname: [this.node.data.fullname]
      });
    }
  }

  update(event: string){

  }

}
