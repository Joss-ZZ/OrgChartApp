import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { OrgChartComponent } from './org-chart/org-chart.component';

import { NgxGraphModule } from '@swimlane/ngx-graph';
import { MaterialModule } from '../material/material.module';
import { CardFormOrganizationalunitComponent } from './components/card-form-organizationalunit/card-form-organizationalunit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AddOrganizationalunitComponent } from './components/add-organizationalunit/add-organizationalunit.component';
import { AddComponent } from './components/add/add.component';
import { AddEmployeeComponent } from './components/add-employee/add-employee.component';
import { CardFormEmployeeComponent } from './components/card-form-employee/card-form-employee.component';

@NgModule({
  declarations: [
    OrgChartComponent,
    CardFormOrganizationalunitComponent,
    AddOrganizationalunitComponent,
    AddComponent,
    AddEmployeeComponent,
    CardFormEmployeeComponent
  ],
  exports: [
    OrgChartComponent
  ],
  imports: [
    CommonModule,
    NgxGraphModule,
    MaterialModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class OrgChartModule { }
