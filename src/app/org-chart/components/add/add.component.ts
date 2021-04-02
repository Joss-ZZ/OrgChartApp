import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Node } from '@swimlane/ngx-graph';
import { IOrganizationalUnit } from '../../interfaces/IOrganizationalUnit';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

  selectedValue: string;

  constructor(public dialogRef: MatDialogRef<AddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Node) { }

  ngOnInit(): void {
  }

  close(){
    this.dialogRef.close();
  }

  addNode(event: any) {
    this.dialogRef.close(event);
  }
}
