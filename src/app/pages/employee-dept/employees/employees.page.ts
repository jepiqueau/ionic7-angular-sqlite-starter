import { Component, OnInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ModalController } from '@ionic/angular';
import { DepartmentEmployeesService } from 'src/app/services/department-employees.service';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { Employee, EmployeeData } from 'src/app/models/employee-dept';
import { Toast } from '@capacitor/toast';
import { EmployeeComponent } from 'src/app/components/employee-dept/employee/employee.component';
import { EmployeesComponent } from 'src/app/components/employee-dept/employees/employees.component';


@Component({
  selector: 'app-employees',
  templateUrl: './employees.page.html',
  styleUrls: ['./employees.page.scss'],
  imports: [IonicModule, EmployeeComponent, EmployeesComponent ],
  standalone: true,
})

export class EmployeesPage implements OnInit {
  updEmployee!: EmployeeData;
  private employeeItemAddEL: any;
  private employeeAddEL: any;
  private employeeUpdateEL: any;
  private employeesEL: any;
  private employeeMode!: string;
  private toClose: boolean = true;

  constructor(private departmentEmployeesService: DepartmentEmployeesService,
    private sqliteService: SQLiteService,
    private modalCtrl: ModalController,
    private elementRef : ElementRef) { }

  async ngOnInit() {
    await this.departmentEmployeesService.openDatabase();
    await this.departmentEmployeesService.getAllData();
    this.employeeItemAddEL = this.elementRef.nativeElement.querySelector(`#employees-ion-item-add`);
    this.employeeAddEL = this.elementRef.nativeElement.querySelector(`#employees-cmp-employee-add`);
    this.employeeUpdateEL = this.elementRef.nativeElement.querySelector(`#employees-cmp-employee-update`);
    this.employeesEL = this.elementRef.nativeElement.querySelector(`#employees-cmp-employees`);
  }
  // Private functions
  /**
   * Close
   * @returns
   */
  async close() {
    if (this.toClose) {
      this.modalCtrl.dismiss();
    } else {
      this.employeesEL.classList.remove('hidden');
      this.employeeItemAddEL.classList.remove('hidden');
      if(this.employeeMode === "add") {
        this.employeeAddEL.classList.add('hidden');
      }
      if(this.employeeMode === "update") {
        this.employeeUpdateEL.classList.add('hidden');
      }
      this.toClose = true;
    }
  }
  /**
   * add a employee
   */
  async addEmployee() {
    this.toClose = false;
    this.employeeMode = "add"
    this.employeeAddEL.classList.remove('hidden');
    this.employeesEL.classList.add('hidden');
    this.employeeItemAddEL.classList.add('hidden');
  }
  handleInsideEmployee() {
    this.toClose = false;
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
        console.log(`onSubmit ${this.employeeMode} Employee: ${err}`);
        await Toast.show({
          text: `onSubmit ${this.employeeMode} Employee: ${msg} `,
          duration: 'long'
        });
      } finally {
        if(this.employeeMode === "update") {
          this.employeeUpdateEL.classList.add('hidden');
        }
        if(this.employeeMode === "add") {
          this.employeeAddEL.classList.add('hidden');
        }
        this.employeesEL.classList.remove('hidden');
        this.employeeItemAddEL.classList.remove('hidden');
        this.toClose = true;
      }
    } else {
      await Toast.show({
        text: `onSubmit ${this.employeeMode} Employee: empid <= 0 `,
        duration: 'long'
      });
    }
  }
  /**
   * handle the toUpdateEmployeet Event from cmp-employees component
   * @param data
   * @returns
   */
  async handleToUpdateEmployee(data:any) {
    if(this.sqliteService.platform === 'web') {
      await this.sqliteService.sqliteConnection.saveToStore(data.database);
    }
    if(data.command === 'update') {
      this.employeeMode = data.command
      this.updEmployee = data.employee;
      this.employeeUpdateEL.classList.remove('hidden');
      this.employeesEL.classList.add('hidden');
      this.employeeItemAddEL.classList.add('hidden');
    }
    await this.departmentEmployeesService.getAllEmployees();
  }
}
