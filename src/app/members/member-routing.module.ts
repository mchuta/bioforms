import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'forms', loadChildren: './forms/forms.module#FormsPageModule' },
  { path: 'form/:id', loadChildren: './form/form.module#FormPageModule' },
  { path: 'submissions', loadChildren: './submissions/submissions.module#SubmissionsPageModule' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemberRoutingModule { }
