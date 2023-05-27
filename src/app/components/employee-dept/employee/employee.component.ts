import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Toast } from '@capacitor/toast';
import { ModalController } from '@ionic/angular';
import { DepartmentEmployeesService } from 'src/app/services/department-employees.service';
import { Department, EmployeeData } from 'src/app/models/employee-dept';
import { IdsSeq } from 'src/app/models/ids-seq';
import { DepartmentPage } from 'src/app/pages/employee-dept/department/department.page';
import { DepartmentsPage } from 'src/app/pages/employee-dept/departments/departments.page';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'cmp-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  standalone: true,
})

export class EmployeeComponent implements OnInit {
  @Input() inEmployee!: EmployeeData;
  @Output() outEmployeeEvent = new EventEmitter<EmployeeData>();

  ngOnChanges(changes: SimpleChanges) {
    // get Current Value
    if (this.inEmployee) {

      this.isUpdate = true;
      this.currentVal = changes['inEmployee'].currentValue;
      if(this.currentVal) {
        const idxDept = this.getDepartmentIndexFromList(this.currentVal.department);
        const selDepartment = this.departmentList[idxDept];
        this.defDepartment = [selDepartment];
        this.setForm();
        this.name!.setValue(this.currentVal.name);
        this.title!.setValue(this.currentVal.title);
      }
    }
  }
  employeeForm!: FormGroup;
  departmentGroup!: FormGroup;
  employeeGroup!: FormGroup;
  fcDepartment!: FormControl;

  public departmentList: Department[] = [];
  public newDepartment: Department[] = [];
  public newEmployee: EmployeeData[] = [];
  public currentVal!: EmployeeData;
  public defDepartment: Department[] = [];
  public isForm: boolean = false;
  private idsSeqList: IdsSeq[] = [];
  private isUpdate: boolean = false;

  constructor(private departmentEmployeesService: DepartmentEmployeesService,
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController) {

  }

  ngOnInit() {
    try {
      this.isUpdate = false;
      this.departmentEmployeesService.departmentState().subscribe((res) => {
        if(res) {
          this.departmentEmployeesService.fetchDepartments().subscribe(data => {
            this.departmentList = data;
          });
        }
      });
      this.departmentEmployeesService.idsSeqState().subscribe((res) => {
        if(res) {
          this.departmentEmployeesService.fetchIdsSeq().subscribe(data => {
            this.idsSeqList = data;
          });
        }
      });
      if (!this.inEmployee) {
        this.setForm();
      }

    } catch(err) {
      throw new Error(`Error: ${err}`);
    }
  }
  // Private functions
  /**
   * Create the Reactive Form
   */
  setForm() {
    this.fcDepartment = new FormControl('');

    this.departmentGroup = new FormGroup({
      department: this.fcDepartment,
    });

    this.employeeGroup = new FormGroup({
      name: new FormControl(''),
      title: new FormControl('')
    })
    this.employeeForm = this.formBuilder.group({
      fg_department: this.departmentGroup,
      fg_employee: this.employeeGroup,
    });
    if(this.defDepartment.length === 1) {
      this.department!.setValue(this.defDepartment[0]);
    }
    this.isForm = true;
  }
  /**
   * Get the department from the form
   */
  get department() {
    return this.employeeForm.get("fg_department")!.get("department");
  }
  /**
   * Get the employee name from the form
   */
  get name() {
    return this.employeeForm.get("fg_employee")!.get("name");
  }
  /**
   * Get the employee title from the form
   */
  get title() {
    return this.employeeForm.get("fg_employee")!.get("title");
  }
  /**
   * Add a department
   */
  async addDepartment() {
    const modal = await this.modalCtrl.create({
      component: DepartmentPage,
      canDismiss: true
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.department!.reset();
      if(data) {
        const index = this.getDepartmentIndexFromList(data);
        const newDept: Department = this.departmentList[index];
        this.department!.setValue(newDept);
        await Toast.show({
          text: `addDepartment: ${JSON.stringify(newDept)}`,
          duration: 'long'
        });
      }
    }
  }
  /**
   * Get the department index from the departmentList
   */
  getDepartmentIndexFromList(dept: any): number {
    const mId = dept.deptid;
    return this.departmentList.indexOf(this.departmentList.filter((x) => x.deptid === mId )[0]);
  }
  /**
   * get the list of departments displayed
   */
  async listDepartment() {
    const modal = await this.modalCtrl.create({
      component: DepartmentsPage,
      componentProps: {
        selectDepartment: this.defDepartment[0],
      },
      canDismiss: true
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'close') {
      if(data) {
        const mId = data.deptid;
        const index = this.departmentList.indexOf(this.departmentList.filter((x) => x.deptid === mId )[0]);
        const newDept: Department = this.departmentList[index];
        this.department!.setValue(newDept);
      }
    }
  }
  /**
   * Submit the new employee from the form
   */
  async onSubmit() {
    let employeeId: number = -1;
    if(this.isUpdate) {
      employeeId = this.currentVal.empid;
    } else {
      const employee = this.idsSeqList.filter(x => x.name === "employee")[0];
      if(employee) {
        employeeId = employee.seq + 1;
      }
    }
    const outEmployee: EmployeeData = new EmployeeData();
    outEmployee.empid = employeeId;
    if(employeeId > 0 ) {
      outEmployee.title = this.title!.value;
      outEmployee.name = this.name!.value;
      outEmployee.department = this.department!.value;
    }
    this.outEmployeeEvent.emit(outEmployee);
    this.employeeForm.reset();
  }
}
