// applyleave.js
import { useState, useEffect } from "react";

function ApplyLeave() {
  const [formData, setFormData] = useState({
    employee_id: localStorage.getItem("employee_id"),
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [balance, setBalance] = useState(null);
  useEffect(() => {
    const employeeId = localStorage.getItem("employee_id");
  
    fetch(`http://localhost:3001/leave-balance/${employeeId}`)
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
      const res = await fetch("http://localhost:3001/apply-leave", {
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
  
      // Reset form but keep employee_id for future use
      setFormData({
        ...formData,
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: ""
      });
  
      // ✅ Optional: update leave request table immediately
      // fetchLeaveRequests(); // Function not defined, removed to fix "success then error" bug
    } catch (err) {
      console.error(err);
      alert("Error applying leave");
    }
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Apply Leave</h2>
      {balance && (
  <div style={{ marginBottom: "15px", padding: "10px", background: "#eef" }}>
    <b>Total Leaves:</b> {balance.total_leaves} |
    <b> Used:</b> {balance.used_leaves} |
    <b> Remaining:</b> {balance.remaining_leaves}
  </div>
   )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="employee_id"
          placeholder="Employee ID"
          value={formData.employee_id}
          readOnly
          style={{ backgroundColor: "#eee" }}
        />

        <select name="leave_type" value={formData.leave_type} onChange={handleChange}>
          <option value="">Select Leave Type</option>
          <option value="Sick">Sick Leave</option>
          <option value="Casual">Casual Leave</option>
          <option value="Annual">Annual Leave</option>
        </select>

        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} />

        <input
          type="text"
          name="reason"
          placeholder="Reason"
          value={formData.reason}
          onChange={handleChange}
        />

        <button type="submit">Apply Leave</button>
      </form>
    </div>
  );
}

export default ApplyLeave;