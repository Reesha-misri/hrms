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
import ForgotPassword from "./Pages/ForgotPassword";
import Dashboard from "./Pages/Dashboard";
import "./App.css";
import { LayoutDashboard, Users, Calendar, FileText, LogOut, Plus, X, Menu } from "lucide-react";
import API_URL from "./api";


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
  const [showNewDesignation, setShowNewDesignation] = useState(false);
  const [showNewRole, setShowNewRole] = useState(false);
  const [newDesignation, setNewDesignation] = useState("");
  const [newRole, setNewRole] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Role & permissions from sessionStorage
  const role = sessionStorage.getItem("role");
  const employeeId = sessionStorage.getItem("employee_id");
  const permissions = JSON.parse(sessionStorage.getItem("permissions") || "[]");

  // Derived permissions
  const canManageEmployees = permissions.some(p => p.permission_name === "Manage Employees");
  const canApproveLeave = permissions.some(p => p.permission_name === "Approve Leave");
  const canViewPayroll = permissions.some(p => p.permission_name === "View Payroll") || role === "HR Manager" || role === "Admin";
  const canGeneratePayroll = permissions.some(p => p.permission_name === "Generate Payroll") || role === "HR Manager" || role === "Admin";
  const canApplyLeave = permissions.some(p => p.permission_name === "Apply Leave");
  const canViewAttendance = permissions.some(p => p.permission_name === "View Attendance") || role === "Manager" || role === "HR Manager" || role === "Admin";
  const canViewDashboard = role === "HR Manager" || role === "Admin";

  // Fetch functions
  const fetchEmployees = useCallback(async () => {
    const res = await fetch(`${API_URL}/employees?role=${role}&employee_id=${employeeId}`);
    const data = await res.json();
    setEmployees(data);
  }, [role, employeeId]);

  const fetchDesignations = useCallback(async () => {
    const res = await fetch(`${API_URL}/designations`);
    const data = await res.json();
    setDesignations(data);
  }, []);

  const fetchRoles = useCallback(async () => {
    const res = await fetch(`${API_URL}/roles`);
    const data = await res.json();
    setRoles(data);
  }, []);

  const fetchLeaveRequests = useCallback(async () => {
    if (!employeeId) return;
    try {
      const res = await fetch(`${API_URL}/leave-requests/${employeeId}`);
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

      fetch(`${API_URL}/leave-balance/${employeeId}`)
        .then(res => res.json())
        .then(data => setLeaveBalance(data))
        .catch(err => console.error(err));
    }
  }, [fetchEmployees, fetchDesignations, fetchRoles, employeeId, fetchLeaveRequests, role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "designation_id" && value === "ADD_NEW") {
      setShowNewDesignation(true);
    } else if (name === "role_id" && value === "ADD_NEW") {
      setShowNewRole(true);
    } else {
      if (name === "designation_id") setShowNewDesignation(false);
      if (name === "role_id") setShowNewRole(false);
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setEditId(null);
    setIsFormVisible(false);
    setShowNewDesignation(false);
    setShowNewRole(false);
    setNewDesignation("");
    setNewRole("");
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Correctly validate Designation and Role when ADD_NEW is used
    const isDesignationValid = showNewDesignation ? !!newDesignation : !!formData.designation_id;
    const isRoleValid = showNewRole ? !!newRole : !!formData.role_id;

    if (!formData.employee_id || !formData.full_name || !formData.email || !formData.department_name || !isDesignationValid || !isRoleValid) {
      alert("Please fill all mandatory fields");
      return;
    }

    try {
      let finalFormData = { ...formData };

      // Add new designation if needed
      if (showNewDesignation && newDesignation) {
        const dRes = await fetch(`${API_URL}/add-designation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ designation_title: newDesignation })
        });
        const dData = await dRes.json();
        finalFormData.designation_id = dData.designation_id;
      }

      // Add new role if needed
      if (showNewRole && newRole) {
        const rRes = await fetch(`${API_URL}/add-role`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role_name: newRole })
        });
        const rData = await rRes.json();
        finalFormData.role_id = rData.role_id;
      }

      let res;
      if (editId) {
        res = await fetch(`${API_URL}/update-employee/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalFormData)
        });
      } else {
        res = await fetch(`${API_URL}/add-employee`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalFormData)
        });
      }

      const message = await res.text();
      alert(message);

      if (res.ok) {
        resetForm();
        await fetchEmployees();
        await fetchDesignations();
        await fetchRoles();
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
    setIsFormVisible(true);
  };

  const deleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      await fetch(`${API_URL}/delete-employee/${id}`, { method: "DELETE" });
      fetchEmployees();
    }
  };

  // Show login/forgot-password if not logged in
  if (!role) {
    return (
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      {isSidebarOpen && window.innerWidth <= 768 && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>HRMS</h2>
          <button className="mobile-close-btn" onClick={toggleSidebar}><X size={20}/></button>
        </div>
        {canViewDashboard && <NavLink to="/dashboard" onClick={() => setIsSidebarOpen(false)}><LayoutDashboard size={16}/> Dashboard</NavLink>}
        <NavLink to="/profile" onClick={() => setIsSidebarOpen(false)}><Users size={16}/> Profile</NavLink>
        <NavLink to="/myattendance" onClick={() => setIsSidebarOpen(false)}><Calendar size={16}/> Attendance</NavLink>
        {role === "Admin" && ( <NavLink to="/audit-logs" onClick={() => setIsSidebarOpen(false)}> <FileText size={16}/> Audit </NavLink> )}
        {canApproveLeave && <NavLink to="/leave-requests" onClick={() => setIsSidebarOpen(false)}>Leave Requests</NavLink>}
        {canApplyLeave && <NavLink to="/apply-leave" onClick={() => setIsSidebarOpen(false)}>Apply Leave</NavLink>}
        
        {/* ATTENDANCE FOR MANAGERS/HR/ADMIN */}
        {(role === "Manager" || role === "HR" || role === "Admin") && (
          <NavLink to="/attendance" onClick={() => setIsSidebarOpen(false)}>
            <Users size={16}/> {role === "Manager" ? "Team Attendance" : "All Attendance"}
          </NavLink>
        )}

        {canViewPayroll && <NavLink to="/payroll" onClick={() => setIsSidebarOpen(false)}>Payroll</NavLink>}
        {canManageEmployees && <NavLink to="/employees" onClick={() => setIsSidebarOpen(false)}><Users size={16}/> Employees</NavLink>}

        <button
          className="logout-btn"
          onClick={() => {
            sessionStorage.clear();
            window.location.href = "/";
          }}
        >
          <LogOut size={16}/> Logout
        </button>
      </div>

      <div className="main-content">
        <div className="topbar" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button className="hamburger-btn" onClick={toggleSidebar}><Menu size={20}/></button>
          Welcome, {role} 👋
        </div>

        <Routes>
          {/* EMPLOYEE PAGE */}
          <Route path="/employees" element={
            canManageEmployees ? (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h2 style={{ margin: 0 }}>Employee Management</h2>
                  <button className="primary-btn" style={{ display: "flex", alignItems: "center", gap: "8px" }} onClick={() => setIsFormVisible(!isFormVisible)}>
                    {isFormVisible ? <X size={16} /> : <Plus size={16} />}
                    {isFormVisible ? "Close Form" : "Add Employee"}
                  </button>
                </div>

                <div className={`form-container ${isFormVisible ? "" : "hidden"}`}>
                  <h3>{editId ? "Update Employee" : "Add New Employee"}</h3>
                  <form className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-group">
                    <label>Employee ID</label>
                    <input name="employee_id" value={formData.employee_id} onChange={handleChange} readOnly={!!editId} />
                    </div>                    
                    <div className="form-group">
                    <label>Full Name</label>
                    <input name="full_name" placeholder="Enter full name" value={formData.full_name} onChange={handleChange} />
                    </div>      
                    <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} />
                    </div>                    
                    <div className="form-group">
                    <label>Department</label>
                    <input name="department_name" value={formData.department_name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                    <label>Designation</label>
                    <select name="designation_id" value={formData.designation_id} onChange={handleChange} >
                    <option value="">Select Designation</option>
                    {designations.map((d) => (
                    <option key={d.designation_id} value={d.designation_id}> {d.designation_title} </option>))}
                    <option value="ADD_NEW">+ Add New Designation</option>
                    </select>
                    {showNewDesignation && (
                    <input className="sub-input" placeholder="Enter new designation" value={newDesignation} onChange={(e) => setNewDesignation(e.target.value)}/>
                    )}</div>
                    <div className="form-group">
                    <label>Role</label>
                    <select name="role_id" value={formData.role_id} onChange={handleChange}>
                    <option value="">Select Role</option>
                    {roles.map((r) => ( <option key={r.role_id} value={r.role_id}> {r.role_name} </option>))}
                    <option value="ADD_NEW">+ Add New Role</option>
                    </select>
                    {showNewRole && (
                    <input className="sub-input" placeholder="Enter new role" value={newRole} onChange={(e) => setNewRole(e.target.value)}/>
                    )}</div>
                    <div className="form-group">
                    <label>Manager</label>
                    <select name="manager_id" value={formData.manager_id} onChange={handleChange} >
                    <option value="">Select Manager</option>
                    {employees .filter(e => e.role_name === "Manager") .map(m => (
                    <option key={m.employee_id} value={m.employee_id}> {m.full_name} </option>))}
                    </select>
                    </div>
                    <div className="salary-group">
                    <div className="form-group">
                    <label>Basic Salary</label>
                    <input type="text" name="basic" value={formData.basic} onChange={handleChange}/>
                    </div>
                    <div className="form-group">
                    <label>Allowance</label>
                    <input type="text" name="allowance" value={formData.allowance} onChange={handleChange}/>
                    </div>
                    <div className="form-group">
                    <label>Deduction</label>
                    <input type="text" name="deduction" value={formData.deduction} onChange={handleChange}/>
                    </div>
                    </div>
                    <div className="form-group full-width">
                    <label>Communication Address</label>
                    <textarea name="communication_address" value={formData.communication_address} onChange={handleChange}/>
                    </div>
                    <div className="form-group full-width">
                    <label>Permanent Address</label>
                    <textarea name="permanent_address" value={formData.permanent_address} onChange={handleChange}/>
                    </div>
                    <div style={{ gridColumn: "span 3", display: "flex", gap: "10px" }}>
                      <button type="submit" className="primary-btn" style={{ flex: 1 }}>
                        {editId ? "Update Employee" : "Save Employee"}
                      </button>
                      <button type="button" className="primary-btn" style={{ background: "#6c757d" }} onClick={resetForm}>Cancel</button>
                    </div>
                  </form>
                </div>

                <h3>Employee List</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Name</th><th>Email</th><th>Dept</th><th>Role</th><th>Basic</th><th>Allowance</th><th>Deduction</th><th>Total</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.employee_id}>
                        <td>{emp.employee_id}</td>
                        <td style={{ fontWeight: 600 }}>{emp.full_name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.department_name}</td>
                        <td>{emp.role_name}</td>
                        <td>{emp.basic}</td>
                        <td>{emp.allowance}</td>
                        <td>{emp.deduction}</td>
                        <td style={{ color: "#28a745", fontWeight: 700 }}>₹{(Number(emp.basic)||0) + (Number(emp.allowance)||0) - (Number(emp.deduction)||0)}</td>
                        <td>
                          <button className="action-btn edit-btn" onClick={() => editEmployee(emp)}>Edit</button>
                          <button className="action-btn delete-btn" onClick={() => deleteEmployee(emp.employee_id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <Navigate to="/profile" />
          } />

          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={canViewDashboard ? <Dashboard /> : <Navigate to="/profile" />} />
          <Route path="/myattendance" element={<MyAttendance />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/leave-requests" element={canApproveLeave ? <LeaveApproval /> : <Navigate to="/profile" />} />
          <Route path="/apply-leave" element={canApplyLeave ? <ApplyLeave fetchLeaveRequests={fetchLeaveRequests} /> : <Navigate to="/profile" />} />
          <Route path="/attendance" element={canViewAttendance ? <Attendance /> : <Navigate to="/profile" />} />
          <Route path="/payroll" element={canViewPayroll ? <Payroll canGenerate={canGeneratePayroll} /> : <Navigate to="/profile" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Navigate to={canManageEmployees ? "/employees" : "/profile"} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;