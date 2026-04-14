// applyleave.js
import { useState, useEffect } from "react";
import API_URL from "../api";
import "./ApplyLeave.css";

function ApplyLeave() {
  const [formData, setFormData] = useState({
    employee_id: sessionStorage.getItem("employee_id"),
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const employeeId = sessionStorage.getItem("employee_id");
  
    fetch(`${API_URL}/leave-balance/${employeeId}`)
      .then(res => res.json())
      .then(data => setBalance(data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.employee_id || !formData.leave_type || !formData.start_date || !formData.end_date) {
      alert("Please fill all mandatory fields");
      return;
    }
  
    try {
      const res = await fetch(`${API_URL}/apply-leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          from_date: formData.start_date,
          to_date: formData.end_date
        }),
      });
  
      const data = await res.json();
  
      if (data.error) {
        alert(data.error);
        return;
      }
  
      alert(data.message);
  
      setFormData({
        ...formData,
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: ""
      });
    } catch (err) {
      console.error(err);
      alert("Error applying leave");
    }
  };

  return (
    <div className="apply-leave-container">
      <h2 className="apply-leave-title">Apply Leave</h2>
      {balance && (
        <div className="leave-message message-success" style={{ marginBottom: "20px" }}>
          <b>Total Leaves:</b> {balance.total_leaves} |
          <b> Used:</b> {balance.used_leaves} |
          <b> Remaining:</b> {balance.remaining_leaves}
        </div>
      )}
      <form onSubmit={handleSubmit} className="leave-form-grid">
        <div style={{ gridColumn: "span 2" }}>
           <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", display: "block" }}>Employee ID</label>
           <input
            type="text"
            name="employee_id"
            className="leave-input"
            value={formData.employee_id}
            readOnly
            style={{ backgroundColor: "#f8fafc" }}
          />
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", display: "block" }}>Leave Type</label>
          <select name="leave_type" className="leave-select" value={formData.leave_type} onChange={handleChange}>
            <option value="">Select Leave Type</option>
            <option value="Sick">Sick Leave</option>
            <option value="Casual">Casual Leave</option>
            <option value="Annual">Annual Leave</option>
          </select>
        </div>

        <div>&nbsp;</div>

        <div>
           <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", display: "block" }}>Start Date</label>
           <input type="date" name="start_date" className="leave-input" value={formData.start_date} onChange={handleChange} />
        </div>
        <div>
           <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", display: "block" }}>End Date</label>
           <input type="date" name="end_date" className="leave-input" value={formData.end_date} onChange={handleChange} />
        </div>

        <textarea
          name="reason"
          placeholder="Reason for leave..."
          className="leave-textarea"
          value={formData.reason}
          onChange={handleChange}
        />

        <button type="submit" className="leave-button">Apply Leave</button>
      </form>
    </div>
  );
}

export default ApplyLeave;