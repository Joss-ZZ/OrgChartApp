import { Component, Input, OnInit } from '@angular/core';
import { Node } from '@swimlane/ngx-graph';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-card-form-organizationalunit',
  templateUrl: './card-form-organizationalunit.component.html',
  styleUrls: ['./card-form-organizationalunit.component.scss']
})
export class CardFormOrganizationalunitComponent implements OnInit {

  scoreCompany: number;
  scoreTeamDepartment: number;
  scoreLeader: number;
  miForm!: FormGroup;
  miForm2!: FormGroup;

  constructor(private fb: FormBuilder) { }

  @Input() node!: Node;
  @Input() vista: boolean = false;

  ngOnInit(): void {
    this.scoreCompany = Math.floor(Math.random()*(105+1));
    this.scoreTeamDepartment = Math.floor(Math.random()*(105+1));
    this.scoreLeader = Math.floor(Math.random()*(105+1));
    if(this.node.data.type === 'COMPANY'){
      this.miForm = this.fb.group({
        // brand: [this.node.data.brand],
        name: [this.node.data.name, [Validators.required]]
      });
    }else{
      this.miForm2 = this.fb.group({
        // profile: [this.node.data.profile],
        // prefix: [this.node.data.prefix],
        name: [this.node.data.name],
        fullname: [this.node.data.fullname]
      });
    }
  }

  update(event: string){

  }

  updateCompany(event: string){
    if(!this.miForm.valid){
      console.log('El campo no puede estar vacío');
      return;
    }
    console.log(this.miForm.value);
  }

}
