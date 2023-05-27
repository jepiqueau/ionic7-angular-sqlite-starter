export const deptEmployeesVersionUpgrades = [
  {
      toVersion: 1,
      statements: [
        `CREATE TABLE IF NOT EXISTS department (
          deptid integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          name varchar(20) NOT NULL,
          location varchar(10)
        );`,
        `CREATE INDEX department_index_deptId ON department (deptid);`,
        `CREATE TABLE IF NOT EXISTS employee (
          empid integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          name varchar(20) NOT NULL,
          title varchar(10),
          deptid integer,
          CONSTRAINT "deptid_dept_constraintFK" FOREIGN KEY (deptid) REFERENCES department (deptid) ON DELETE NO ACTION ON UPDATE NO ACTION
        );`,
        `CREATE INDEX employee_index_empid ON employee (empid);`,
      ]
  },
]
