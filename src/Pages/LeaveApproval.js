import { useEffect, useState } from "react";
import API_URL from "../api";
import "./LeaveApproval.css";

function LeaveApproval(){
  const [leaves,setLeaves] = useState([]);
  const loggedInEmployeeId = sessionStorage.getItem("employee_id");

  const fetchLeaves = async () => {
    const res = await fetch(`${API_URL}/leaves`);
    const data = await res.json();
    setLeaves(data);
  };

  useEffect(()=>{
    fetchLeaves();
  }, []);

  const approveLeave = async(id)=>{
    await fetch(`${API_URL}/approve-leave/${id}`,{
      method:"PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approver_id: loggedInEmployeeId })
    });
    fetchLeaves();
  };

  const rejectLeave = async(id)=>{
    await fetch(`${API_URL}/reject-leave/${id}`,{
      method:"PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approver_id: loggedInEmployeeId })
    });
    fetchLeaves();
  };

  return(
    <div className="approval-container">
      <div className="attendance-card">
        <h2 className="payroll-title" style={{ marginBottom: "24px" }}>Leave Requests for Approval</h2>
        <div className="payroll-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l)=>(
                <tr key={l.leave_id}>
                  <td>
                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{l.full_name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>ID: {l.employee_id}</div>
                  </td>
                  <td>
                    <span style={{ padding: "4px 8px", background: "#f1f5f9", borderRadius: "4px", fontSize: "13px" }}>
                      {l.leave_type}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: "14px" }}>{new Date(l.start_date).toLocaleDateString()}</div>
                    <div style={{ color: "#94a3b8", fontSize: "12px" }}>to {new Date(l.end_date).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${l.status === 'Approved' ? 'status-present' : l.status === 'Rejected' ? 'status-absent' : 'status-present'}`} style={{ background: l.status === 'Pending' ? '#fef9c3' : '', color: l.status === 'Pending' ? '#854d0e' : '' }}>
                      {l.status}
                    </span>
                  </td>
                  <td>
                    {l.status === "Pending" && Number(l.employee_id) !== Number(loggedInEmployeeId) ? (
                      <div className="action-buttons">
                        <button className="approve-btn" onClick={() => approveLeave(l.leave_id)}>Approve</button>
                        <button className="reject-btn" onClick={() => rejectLeave(l.leave_id)}>Reject</button>
                      </div>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "13px" }}>None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LeaveApproval;