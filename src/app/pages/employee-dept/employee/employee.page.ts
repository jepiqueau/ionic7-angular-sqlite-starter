import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ModalController } from '@ionic/angular';
import { DepartmentEmployeesService } from 'src/app/services/department-employees.service';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { Employee, EmployeeData } from 'src/app/models/employee-dept';
import { Toast } from '@capacitor/toast';
import { EmployeeComponent } from 'src/app/components/employee-dept/employee/employee.component';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.page.html',
  styleUrls: ['./employee.page.scss'],
  imports: [IonicModule, EmployeeComponent ],
  standalone: true,
})

export class EmployeePage implements OnInit {

  constructor(private departmentEmployeesService: DepartmentEmployeesService,
    private sqliteService: SQLiteService,
    private modalCtrl: ModalController) { }

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
   * handle the outEmployee Event from cmp-employee component
   * @param employee
   * @returns
   */
  async handleOutEmployee(employee: EmployeeData) {
    if(employee && employee.empid > 0) {
      const employeeJson: Employee = this.departmentEmployeesService.getEmployeeFromEmployeeData(employee);
      try {
        await this.departmentEmployeesService.getEmployee(employeeJson);
        await this.departmentEmployeesService.getAllEmployees();
        await this.departmentEmployeesService.getAllIdsSeq();
        if (this.sqliteService.platform === 'web') {
          // save the databases from memory to store
          await this.sqliteService.sqliteConnection.saveToStore(this.departmentEmployeesService.databaseName);
        }
      } catch (err: any) {
        const msg = err.message ? err.message : err;
        console.log(`onSubmit Post: ${msg}`);
        await Toast.show({
          text: `onSubmit Employee: ${msg} `,
          duration: 'long'
        });
      }
      return this.modalCtrl.dismiss(employee, 'confirm');
    } else {
      await Toast.show({
        text: `onSubmit Employee: empid <= 0 `,
        duration: 'long'
      });
      return this.modalCtrl.dismiss(null, 'cancel');
    }
  }

}
