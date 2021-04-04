import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Node } from '@swimlane/ngx-graph';

@Component({
  selector: 'app-delete-alert',
  templateUrl: './delete-alert.component.html',
  styleUrls: ['./delete-alert.component.scss']
})
export class DeleteAlertComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DeleteAlertComponent>,
  @Inject(MAT_DIALOG_DATA) public data: Node) { }

  ngOnInit(): void {
  }
  borrar(){
  this.dialogRef.close(true);
  }
  cerrar(){
  this.dialogRef.close();
  }

}
