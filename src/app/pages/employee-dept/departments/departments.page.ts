import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ModalController } from '@ionic/angular';
import { DepartmentEmployeesService } from 'src/app/services/department-employees.service';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { Department } from 'src/app/models/employee-dept';
import { Toast } from '@capacitor/toast';
import { DepartmentComponent } from 'src/app/components/employee-dept/department/department.component';
import { DepartmentsComponent } from 'src/app/components/employee-dept/departments/departments.component';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.page.html',
  styleUrls: ['./departments.page.scss'],
  imports: [IonicModule, DepartmentComponent, DepartmentsComponent ],
  standalone: true,
})

export class DepartmentsPage implements OnInit {
  @Input() selectDepartment!: Department;

  updDepartment!: Department;
  private departmentEL: any;
  private selDept: Department = this.selectDepartment;

  constructor(private departmentEmployeesService: DepartmentEmployeesService,
    private modalCtrl: ModalController,
    private sqliteService: SQLiteService,
    private elementRef : ElementRef) {

  }

  ngOnInit() {
    this.departmentEL = this.elementRef.nativeElement.querySelector(`#departments-cmp-department`);
  }
  // Private functions
  /**
   * Close
   */
  async close() {
    // check if seltDept still exists
    if(!this.selDept) {
      return this.modalCtrl.dismiss(null, 'close');
    }
    const deptExist: Department = await this.departmentEmployeesService.getDepartment(this.selDept);

    if(deptExist && deptExist.deptid > 0) {
      return this.modalCtrl.dismiss(deptExist, 'close');
    } else {
      return this.modalCtrl.dismiss(null, 'close');
    }
  }
  /**
   * handle the outDepartment Event from cmp-department component
   * @param department
   * @returns
   */
  async handleOutDepartment(department:Department) {
    if(department && department.deptid > 0) {
      const mDepartment: Department = department;
      try {
        this.selDept = await this.departmentEmployeesService.getDepartment(mDepartment);
        await this.departmentEmployeesService.getAllDepartments();
        await this.departmentEmployeesService.getAllEmployees();
        await this.departmentEmployeesService.getAllIdsSeq();
        if (this.sqliteService.platform === 'web') {
          // save the databases from memory to store
          await this.sqliteService.sqliteConnection.saveToStore(this.departmentEmployeesService.databaseName);
        }
        this.departmentEL.classList.add('hidden');
      } catch (err: any) {
        const msg = err.message ? err.message : err;
        console.log(`onSubmit Update Department: ${msg}`);
        await Toast.show({
          text: `onSubmit Update Department: ${msg} `,
          duration: 'long'
        });
      }
    } else {
      await Toast.show({
        text: `onSubmit Update Department: deptid <= 0 `,
        duration: 'long'
      });
    }
  }
  /**
   * handle the toUpdateDepartment Event from cmp-departments component
   * @param department
   * @returns
   */
  async handleToUpdateDepartment(data:any) {
    if(this.sqliteService.platform === 'web') {
      await this.sqliteService.sqliteConnection.saveToStore(data.database);
    }
    if(data.command === 'update') {
      this.updDepartment = data.department;
      this.departmentEL.classList.remove('hidden');
    }
  }

}

