import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ModalController } from '@ionic/angular';
import { DepartmentEmployeesService } from 'src/app/services/department-employees.service';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { Department } from 'src/app/models/employee-dept';
import { Toast } from '@capacitor/toast';
import { DepartmentComponent } from 'src/app/components/employee-dept/department/department.component';

@Component({
  selector: 'app-department',
  templateUrl: './department.page.html',
  styleUrls: ['./department.page.scss'],
  imports: [IonicModule, DepartmentComponent],
  standalone: true,
})

export class DepartmentPage implements OnInit {
  public departmentList: Department[] = [];
  private newDepartment!: Department;
  private department!: Department;

  constructor(private departmentEmployeesService: DepartmentEmployeesService,
              private sqliteService: SQLiteService,
              private modalCtrl: ModalController) {
  }

  ngOnInit() {
  }
  // Private functions
  /**
   * Cancel
   * @returns
   */
  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
  /**
   * handle the outDepartment Event from cmp-department component
   * @param department
   * @returns
   */
  async handleOutDepartment(dept:Department) {
    this.department = dept;
    if(this.department && this.department.deptid > 0) {
      try {
        this.newDepartment = await this.departmentEmployeesService.getDepartment(this.department);
        await this.departmentEmployeesService.getAllDepartments();
        await this.departmentEmployeesService.getAllIdsSeq();
        if (this.sqliteService.platform === 'web') {
          // save the databases from memory to store
          await this.sqliteService.sqliteConnection.saveToStore(this.departmentEmployeesService.databaseName);
        }
      } catch (err: any) {
        const msg = err.message ? err.message : err;
        console.log(`onSubmit Department: ${msg}`);
        await Toast.show({
          text: `onSubmit Department: ${msg} `,
          duration: 'long'
        });
      }
      return this.modalCtrl.dismiss(this.newDepartment, 'confirm');
    } else {
      await Toast.show({
        text: `onSubmit Department: deptid <= 0 `,
        duration: 'long'
      });
      return this.modalCtrl.dismiss(null, 'cancel');
    }
  }
}

