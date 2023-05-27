import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DepartmentEmployeesService } from 'src/app/services/department-employees.service';
import { Department } from 'src/app/models/employee-dept';
import { Toast } from '@capacitor/toast';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'cmp-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
  imports: [CommonModule, IonicModule],
  standalone: true,
})

export class DepartmentsComponent implements OnInit {
  @Output() toUpdateDepartment = new EventEmitter<{command: string, database: string, department: Department}>();

  public departmentList: Department[] = [];

  constructor(private departmentEmployeesService: DepartmentEmployeesService) {
  }

  ngOnInit() {
    try {
      this.departmentEmployeesService.departmentState().subscribe((res) => {
        if(res) {
          this.departmentEmployeesService.fetchDepartments().subscribe(data => {
            this.departmentList = data;
          });
        }
      });
    } catch(err) {
      throw new Error(`Error: ${err}`);
    }
  }
  // Private functions
  /**
   * update a Department
   * @param department
   */
  updateDepartment(department: Department) {
    this.toUpdateDepartment.emit({command: "update", database: this.departmentEmployeesService.databaseName, department: department});
  }
  /**
   * delete a Department
   * @param department
   */
  async deleteDepartment(department: Department) {
    try {
      await this.departmentEmployeesService.deleteDepartment(department);
      await this.departmentEmployeesService.getAllDepartments();
      this.toUpdateDepartment.emit({command: "delete", database: this.departmentEmployeesService.databaseName, department: department});
    } catch(err) {
      await Toast.show({
        text: `Employees are still attached to ${department.name}`,
        duration: 'long'
      });
      throw new Error(`Error: ${err}`);
    }
  }

}
