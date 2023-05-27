import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DepartmentEmployeesService } from 'src/app/services/department-employees.service';
import { EmployeeData } from 'src/app/models/employee-dept';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'cmp-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
  imports: [CommonModule, IonicModule],
  standalone: true,
})

export class EmployeesComponent implements OnInit {
  @Output() toUpdateEmployee = new EventEmitter<{command: string, database: string, employee: EmployeeData}>();
  @Output() insideEmployeeEvent = new EventEmitter();

  public employeeList: EmployeeData[] = [];

  constructor(private departmentEmployeesService: DepartmentEmployeesService) { }

  ngOnInit() {
    this.fetchEmployees();
  }
  fetchEmployees() {
    try {
      this.departmentEmployeesService.employeeState().subscribe((res) => {
        if(res) {
          this.departmentEmployeesService.fetchEmployees().subscribe(data => {
            this.employeeList = data;
          });
        }
      });
    } catch(err) {
      throw new Error(`Error: ${err}`);
    }
  }
  /**
   * Update an employee
   * @param employee
   */
  async updateEmployee(employeeData: EmployeeData) {
    await this.departmentEmployeesService.getAllEmployees();
    this.insideEmployeeEvent.emit();
    this.toUpdateEmployee.emit({command: "update", database: this.departmentEmployeesService.databaseName, employee: employeeData});
  }
  /**
   * Delete an employee
   * @param employee
   */
  async deleteEmployee(employeeData: EmployeeData) {
    try {
      const employee = await this.departmentEmployeesService.getEmployeeFromEmployeeData(employeeData);
      await this.departmentEmployeesService.deleteEmployee(employee);
      await this.departmentEmployeesService.getAllEmployees();
      this.toUpdateEmployee.emit({command: "delete", database: this.departmentEmployeesService.databaseName, employee: employeeData});
    } catch(err) {
      throw new Error(`Error: ${err}`);
    }
  }

}
