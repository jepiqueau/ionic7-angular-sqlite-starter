import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { DepartmentEmployeesService } from 'src/app/services/department-employees.service';
import { Department } from 'src/app/models/employee-dept';
import { IdsSeq } from 'src/app/models/ids-seq';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'cmp-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  standalone: true,
})

export class DepartmentComponent implements OnInit {
  @Input() inDepartment!: Department;
  @Output() outDepartmentEvent = new EventEmitter<Department>();

  ngOnChanges(changes: SimpleChanges) {
    // get Current Value
    if (this.inDepartment) {
      this.isUpdate = true;
      this.currentVal = changes['inDepartment'].currentValue;
      if(this.currentVal) {
        this.name!.setValue(this.currentVal.name);
        if(this.currentVal.location != null) {
          this.location!.setValue(this.currentVal.location);
        }
      }
    }
  }

  public departmentForm!: FormGroup;
  public currentVal!: Department;
  private idsSeqList: IdsSeq[] = [];
  private isUpdate: boolean = false;

  constructor(private departmentEmployeesService : DepartmentEmployeesService ,
              private formBuilder: FormBuilder) {

  }

  ngOnInit() {
    try {
      this.isUpdate = false;
      this.departmentEmployeesService.idsSeqState().subscribe((res) => {
        if(res) {
          this.departmentEmployeesService.fetchIdsSeq().subscribe(data => {
            this.idsSeqList = data;
          });
        }
      });
    } catch(err) {
      throw new Error(`Error: ${err}`);
    }

    this.departmentForm = this.formBuilder.group({
      name: new FormControl(''),
      location: new FormControl(''),
    });

  }
  // Private functions
  /**
   * Get the department name from the form
   */
  get name() {
    return this.departmentForm.get("name");
  }
  /**
   * Get the department location from the form
   */
  get location() {
    return this.departmentForm.get("location");
  }

  /**
   * submit a department
   */
  async onSubmit() {
    let departmentId: number = -1;
    if(this.isUpdate) {
      departmentId = this.currentVal.deptid;
    } else {
      const department = this.idsSeqList.filter(x => x.name === "department")[0];
      if(department) {
        departmentId = department.seq + 1;
      }
    }
    const outDepartment: Department = new Department();
    outDepartment.deptid = departmentId;
    outDepartment.name = this.name!.value;
    if(this.location!.value) {
      outDepartment.location = this.location!.value;
    }
    this.outDepartmentEvent.emit(outDepartment);
  }

}
