import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { OrgChartComponent } from './org-chart/org-chart/org-chart.component';

const routes: Routes = [
  {
    path: 'org-chart',
    component: OrgChartComponent
  },
  {
    path: 'org-chart-view',
    component: OrgChartComponent
  },
  {
    path: '**',
    redirectTo: '/org-chart'
  }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
