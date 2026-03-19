import { useState, useEffect, useCallback } from "react";
import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import Login from "./Pages/Login";
import LeaveApproval from "./Pages/LeaveApproval";
import ApplyLeave from "./Pages/ApplyLeave";
import Attendance from "./Pages/Attendance";
import Payroll from "./Pages/Payroll";
import Profile from "./Pages/Profile";
import MyAttendance from "./Pages/MyAttendance";
import AuditLogs from "./Pages/AuditLogs";

function App() {
  const navigate = useNavigate();
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
    basic: "",
    allowance: "",
    deduction: ""
  });
  const [editId, setEditId] = useState(null);

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
    if (role) {
      fetchEmployees();
      fetchDesignations();
      fetchRoles();
      fetchLeaveRequests();

      fetch(`http://localhost:3001/leave-balance/${employeeId}`)
        .then(res => res.json())
        .then(data => setLeaveBalance(data))
        .catch(err => console.error(err));
    }
  }, [fetchEmployees, fetchDesignations, fetchRoles, employeeId, fetchLeaveRequests, role]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.full_name || !formData.email || !formData.department_name || !formData.designation_id || !formData.role_id) {
      alert("Please fill all mandatory fields");
      return;
    }

    try {
      let res;
      if (editId) {
        res = await fetch(`http://localhost:3001/update-employee/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      } else {
        res = await fetch("http://localhost:3001/add-employee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      }

      const message = await res.text();
      alert(message);

      if (res.ok) {
        setEditId(null);
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
          basic: "",
          allowance: "",
          deduction: ""
        });
        await fetchEmployees();
      }
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
      password: "",
      department_name: emp.department_name,
      designation_id: emp.designation_id,
      manager_id: emp.manager_id || "",
      role_id: emp.role_id,
      communication_address: emp.communication_address,
      permanent_address: emp.permanent_address,
      basic: emp.basic || "",
      allowance: emp.allowance || "",
      deduction: emp.deduction || ""
    });
  };

  const deleteEmployee = async (id) => {
    await fetch(`http://localhost:3001/delete-employee/${id}`, { method: "DELETE" });
    fetchEmployees();
  };

  // Show login if not logged in
  if (!role) return <Login />;

  const navLinkStyle = ({ isActive }) => ({
    padding: "10px 15px",
    marginRight: "10px",
    textDecoration: "none",
    color: isActive ? "white" : "black",
    background: isActive ? "#007bff" : "#eee",
    borderRadius: "4px",
    display: "inline-block"
  });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Navigation */}
      <div style={{ background: "white", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
        <NavLink to="/profile" style={navLinkStyle}>My Profile</NavLink>
        <NavLink to="/myattendance" style={navLinkStyle}>My Attendance</NavLink>
        <NavLink to="/audit-logs" style={navLinkStyle}>Audit Trail</NavLink>
        {canApproveLeave && <NavLink to="/leave-requests" style={navLinkStyle}>View Leave Requests</NavLink>}
        {canApplyLeave && <NavLink to="/apply-leave" style={navLinkStyle}>Apply Leave</NavLink>}
        {canViewAttendance && <NavLink to="/attendance" style={navLinkStyle}>View Attendance</NavLink>}
        {canViewPayroll && <NavLink to="/payroll" style={navLinkStyle}>Payroll</NavLink>}
        {canManageEmployees && <NavLink to="/employees" style={navLinkStyle}>Employee Management</NavLink>}
        <button 
          onClick={() => { localStorage.clear(); window.location.href = "/"; }}
          style={{ padding: "10px 15px", marginLeft: "10px", background: "#f8f9fa", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>

      <Routes>
        <Route path="/employees" element={
          canManageEmployees ? (
            <>
              <h2>{editId ? "Update Employee" : "Add Employee"}</h2>
              <form onSubmit={handleSubmit}>
                <input type="text" name="employee_id" placeholder="Employee ID" value={formData.employee_id} onChange={handleChange} readOnly={!!editId} style={{ backgroundColor: editId ? "#eee" : "white" }} />
                <input type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} />
                <input type="number" name="basic" placeholder="Basic Salary" value={formData.basic} onChange={handleChange} />
                <input type="number" name="allowance" placeholder="Allowance" value={formData.allowance} onChange={handleChange} />
                <input type="number" name="deduction" placeholder="Deduction" value={formData.deduction} onChange={handleChange} />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
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

              <h2>Employee List</h2>
              <table border="1" cellPadding="8" style={{ width: "100%", background: "white" }}>
                <thead>
                  <tr>
                    <th>ID</th><th>Name</th><th>Email</th><th>Dept</th><th>Designation</th><th>Role</th><th>Manager</th><th>Basic</th><th>Allowance</th><th>Deduction</th><th>Actions</th>
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
                      <td>{emp.basic || 0}</td>
                      <td>{emp.allowance || 0}</td>
                      <td>{emp.deduction || 0}</td>
                      <td>
                        <button onClick={() => editEmployee(emp)}>Edit</button>
                        <button onClick={() => deleteEmployee(emp.employee_id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : <Navigate to="/profile" />
        } />
        <Route path="/profile" element={<Profile />} />
        <Route path="/myattendance" element={<MyAttendance />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/leave-requests" element={canApproveLeave ? <LeaveApproval /> : <Navigate to="/profile" />} />
        <Route path="/apply-leave" element={canApplyLeave ? <ApplyLeave fetchLeaveRequests={fetchLeaveRequests} /> : <Navigate to="/profile" />} />
        <Route path="/attendance" element={canViewAttendance ? <Attendance /> : <Navigate to="/profile" />} />
        <Route path="/payroll" element={canViewPayroll ? <Payroll canGenerate={canGeneratePayroll} /> : <Navigate to="/profile" />} />
        <Route path="/" element={<Navigate to={canManageEmployees ? "/employees" : "/profile"} />} />
      </Routes>
    </div>
  );
}

export default App;