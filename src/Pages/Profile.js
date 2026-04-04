import { useEffect, useState } from "react";
import "./Profile.css";
import { User, Mail, Briefcase, Shield, UserCheck, MapPin, CreditCard } from "lucide-react";

function Profile() {
  const [employee, setEmployee] = useState({});

  useEffect(() => {
    const employee_id = localStorage.getItem("employee_id");
  
    fetch(`http://localhost:3001/employee/${employee_id}`)
      .then(res => res.json())
      .then(data => setEmployee(data))
      .catch(err => console.error("Error fetching profile:", err));
  }, []);

  const initials = employee.full_name ? employee.full_name.split(' ').map(n => n[0]).join('') : "?";

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {initials}
          </div>
          <div className="profile-main-info">
            <h1>{employee.full_name}</h1>
            <p className="subtitle">{employee.designation_title} • {employee.department_name}</p>
          </div>
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h3 className="section-title"><User size={18}/> Personal Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Employee ID</label>
                <div>{employee.employee_id}</div>
              </div>
              <div className="detail-item">
                <label>Email Address</label>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><Mail size={14}/> {employee.email}</div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3 className="section-title"><Briefcase size={18}/> Employment Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Department</label>
                <div>{employee.department_name}</div>
              </div>
              <div className="detail-item">
                <label>Designation</label>
                <div>{employee.designation_title}</div>
              </div>
              <div className="detail-item">
                <label>Role</label>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><Shield size={14}/> {employee.role_name}</div>
              </div>
              <div className="detail-item">
                <label>Reporting Manager</label>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><UserCheck size={14}/> {employee.manager_name || "None"}</div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3 className="section-title"><MapPin size={18}/>Addresses</h3>
            <div className="detail-grid" style={{ gridTemplateColumns: "1fr" }}>
              <div className="detail-item">
                <label>Communication Address</label>
                <div>{employee.communication_address || "N/A"}</div>
              </div>
              <div className="detail-item">
                <label>Permanent Address</label>
                <div>{employee.permanent_address || "N/A"}</div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3 className="section-title"><CreditCard size={18}/> Salary Configuration</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Basic Pay</label>
                <div className="currency">₹{employee.basic}</div>
              </div>
              <div className="detail-item">
                <label>Allowances</label>
                <div className="currency">₹{employee.allowance}</div>
              </div>
              <div className="detail-item">
                <label>Deductions</label>
                <div className="currency" style={{ color: "#ef4444" }}>-₹{employee.deduction}</div>
              </div>
              <div className="detail-item">
                <label>Net Monthly Pay</label>
                <div className="currency total">₹{(Number(employee.basic)||0) + (Number(employee.allowance)||0) - (Number(employee.deduction)||0)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;