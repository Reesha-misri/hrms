import { useState, useEffect, useCallback } from "react";
import Login from "./Pages/Login";
import LeaveApproval from "./Pages/LeaveApproval";
import ApplyLeave from "./Pages/ApplyLeave";
import Attendance from "./Pages/Attendance";
import Payroll from "./Pages/Payroll";
import Profile from "./Pages/Profile";
import MyAttendance from "./Pages/MyAttendance";
import AuditLogs from "./Pages/AuditLogs";

function App() {
  const [employees, setEmployees] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [designations, setDesignations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: "",
    full_name: "",
    email: "",
    password: "",
    department_name: "",
    designation_id: "",
    manager_id: "",
    role_id: "",
    communication_address: "",
    permanent_address: "",
    basic: "",       // new salary field
    allowance: "",   // new salary field
    deduction: ""    // new salary field
  });
  const [editId, setEditId] = useState(null);

  const [page, setPage] = useState("employees");
  const [showLeave, setShowLeave] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);

  // Role & permissions from localStorage
  const role = localStorage.getItem("role");
  const employeeId = localStorage.getItem("employee_id");
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");

  // Derived permissions
  const canManageEmployees = permissions.some(p => p.permission_name === "Manage Employees");
  const canApproveLeave = permissions.some(p => p.permission_name === "Approve Leave");
  const canViewPayroll = permissions.some(p => p.permission_name === "View Payroll");
  const canGeneratePayroll = permissions.some(p => p.permission_name === "Generate Payroll");
  const canApplyLeave = permissions.some(p => p.permission_name === "Apply Leave");
  const canViewAttendance = permissions.some(p => p.permission_name === "View Attendance");

  // Fetch functions
  const fetchEmployees = useCallback(async () => {
    const res = await fetch(`http://localhost:3001/employees?role=${role}&employee_id=${employeeId}`);
    const data = await res.json();
    setEmployees(data);
  }, [role, employeeId]);

  const fetchDesignations = useCallback(async () => {
    const res = await fetch("http://localhost:3001/designations");
    const data = await res.json();
    setDesignations(data);
  }, []);

  const fetchRoles = useCallback(async () => {
    const res = await fetch("http://localhost:3001/roles");
    const data = await res.json();
    setRoles(data);
  }, []);
  // Fetch leave requests for logged-in employee
const fetchLeaveRequests = useCallback(async () => {
  if (!employeeId) return;
  try {
    const res = await fetch(`http://localhost:3001/leave-requests/${employeeId}`);
    const data = await res.json();
    setLeaveRequests(data);
  } catch (err) {
    console.error("Error fetching leave requests:", err);
  }
}, [employeeId]);

useEffect(() => {
  fetchEmployees();
  fetchDesignations();
  fetchRoles();

  if(employeeId){
    fetch(`http://localhost:3001/leave-balance/${employeeId}`)
      .then(res => res.json())
      .then(data => setLeaveBalance(data))
      .catch(err => console.error(err));

    // ✅ Fetch leave requests on load
    fetchLeaveRequests();
  }
}, [fetchEmployees, fetchDesignations, fetchRoles, employeeId, fetchLeaveRequests]);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.full_name || !formData.email || !formData.department_name || !formData.designation_id || !formData.role_id) {
      alert("Please fill all mandatory fields");
      return;
    }

    try {
      if (editId) {
        const res = await fetch(`http://localhost:3001/update-employee/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });

        const message = await res.text();
        alert(message);
        setEditId(null);
      } else {
        const res = await fetch("http://localhost:3001/add-employee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      
        const message = await res.text();
        alert(message);
      }

      setFormData({
        employee_id: "",
        full_name: "",
        email: "",
        password: "",
        department_name: "",
        designation_id: "",
        manager_id: "",
        role_id: "",
        communication_address: "",
        permanent_address: "",
        basic: "",       // new
        allowance: "",
        deduction: ""
      });

      await fetchEmployees();
    } catch (err) {
      console.error(err);
      alert("Error saving employee");
    }
  };

  const editEmployee = (emp) => {
    setEditId(emp.employee_id);
    setFormData({
      employee_id: emp.employee_id,
      full_name: emp.full_name,
      email: emp.email,
      password:"",
      department_name: emp.department_name,
      designation_id: emp.designation_id,
      manager_id: emp.manager_id || "",
      role_id: emp.role_id,
      communication_address: emp.communication_address,
      permanent_address: emp.permanent_address,
      basic: emp.basic || "",       // new
      allowance: emp.allowance || "", // new
      deduction: emp.deduction || ""  // new
    });
  };

  const deleteEmployee = async (id) => {
    await fetch(`http://localhost:3001/delete-employee/${id}`, { method: "DELETE" });
    fetchEmployees();
  };

  const checkIn = async (id) => {
    await fetch("http://localhost:3001/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: id })
    });
    alert("Check-in recorded");
  };

  const checkOut = async (id) => {
    await fetch(`http://localhost:3001/checkout/${id}`, { method: "PUT" });
    alert("Check-out recorded");
  };

  // Show login if not logged in
  if (!role) return <Login />;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Navigation */}
      <div style={{ background: "white", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
      <button onClick={() => setPage("profile")}>My Profile</button>
      <button onClick={()=>setPage("myattendance")}>My Attendance</button>
      <button onClick={() => setPage("auditlogs")}>Audit Trail</button>
        {canApproveLeave && <button onClick={() => setShowLeave(!showLeave)}>View Leave Requests</button>}
        {canApplyLeave && <button onClick={() => setShowApply(!showApply)}>Apply Leave</button>}
        {canViewAttendance && <button onClick={() => setShowAttendance(!showAttendance)}>View Attendance</button>}
        {canViewPayroll && <button onClick={() => setPage("payroll")}>Payroll</button>}
        {canManageEmployees && <button onClick={() => setPage("employees")}>Employee Management</button>}
        <button onClick={() => { localStorage.clear();window.location.reload();}}>Logout</button>
    </div>

      {/* Employee Form */}
      {canManageEmployees && page === "employees" && (
        <>
          <h2>{editId ? "Update Employee" : "Add Employee"}</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="employee_id" placeholder="Employee ID" value={formData.employee_id} onChange={handleChange} />
            <input type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} />
            <input type="number" name="basic" placeholder="Basic Salary" value={formData.basic} onChange={handleChange} />
            <input type="number" name="allowance" placeholder="Allowance" value={formData.allowance} onChange={handleChange} />
             <input type="number" name="deduction" placeholder="Deduction" value={formData.deduction} onChange={handleChange} />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            <input type="password"name="password" placeholder="Password" value={formData.password} onChange={handleChange}/>
            <input type="text" name="department_name" placeholder="Department" value={formData.department_name} onChange={handleChange} />
            <select name="designation_id" value={formData.designation_id} onChange={handleChange}>
              <option value="">Select Designation</option>
              {designations.map(d => <option key={d.designation_id} value={d.designation_id}>{d.designation_title}</option>)}
            </select>
            <select name="role_id" value={formData.role_id} onChange={handleChange}>
              <option value="">Select Role</option>
              {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
            </select>
            <select name="manager_id" value={formData.manager_id} onChange={handleChange}>
              <option value="">Select Manager</option>
              {employees.filter(e => e.role_name === "Manager").map(m => <option key={m.employee_id} value={m.employee_id}>{m.full_name}</option>)}
            </select>
            <textarea name="communication_address" placeholder="Communication Address" value={formData.communication_address} onChange={handleChange}></textarea>
            <textarea name="permanent_address" placeholder="Permanent Address" value={formData.permanent_address} onChange={handleChange}></textarea>
            <button type="submit">{editId ? "Update" : "Add"}</button>
          </form>

          {/* Employee Table */}
          <h2>Employee List</h2>
          <table border="1" cellPadding="8" style={{ width: "100%", background: "white" }}>
            <thead>
            <tr>
  <th>ID</th>
  <th>Name</th>
  <th>Email</th>
  <th>Dept</th>
  <th>Designation</th>
  <th>Role</th>
  <th>Manager</th>
  <th>Basic</th>      
  <th>Allowance</th>  
  <th>Deduction</th>  
  <th>Actions</th>
</tr>
            </thead>
            <tbody>
            {employees.map(emp => (
  <tr key={emp.employee_id}>
    <td>{emp.employee_id}</td>
    <td>{emp.full_name}</td>
    <td>{emp.email}</td>
    <td>{emp.department_name}</td>
    <td>{emp.designation_title}</td>
    <td>{emp.role_name}</td>
    <td>{emp.manager_name || "-"}</td>
    <td>{emp.basic || 0}</td>      {/* new */}
    <td>{emp.allowance || 0}</td>  {/* new */}
    <td>{emp.deduction || 0}</td>  {/* new */}
    <td>
      <button onClick={() => editEmployee(emp)}>Edit</button>
      <button onClick={() => deleteEmployee(emp.employee_id)}>Delete</button>
    </td>
  </tr>
))}
            </tbody>
          </table>
        </>
      )}

      {/* Leave Approval */}
      {canApproveLeave && showLeave && <LeaveApproval />}
      {/* Apply Leave */}
      {canApplyLeave && showApply && <ApplyLeave fetchLeaveRequests={fetchLeaveRequests} />}      {/* Attendance */}
      {canViewAttendance && showAttendance && <Attendance />}
      {/* Profile */}
      {page === "profile" && <Profile />}
      {page === "myattendance" && <MyAttendance />}
      {page === "auditlogs" && <AuditLogs/>}
      {/* Payroll */}
      {canViewPayroll && page === "payroll" && <Payroll canGenerate={canGeneratePayroll} />}
    </div>
  );
}

export default App;