import { useEffect, useState } from "react";
import "./Attendance.css";

function Attendance(){
  const [attendance,setAttendance] = useState([]);
  const [date,setDate] = useState("");
  const [title, setTitle] = useState("Attendance");

  const fetchAttendance = async () => {
    const role = localStorage.getItem("role");
    const employee_id = localStorage.getItem("employee_id");
    setTitle(role === "Manager" ? "Team Attendance" : "Company Attendance");
    
    let url = `http://localhost:3001/attendance?role=${role}&employee_id=${employee_id}`;
    if(date){
      url += `&date=${date}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    setAttendance(data);
  };

  useEffect(()=>{
    fetchAttendance();
  },[]);

  return(
    <div className="attendance-container">
      <div className="attendance-card">
        <div className="attendance-header">
          <h2 className="attendance-title">{title}</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="date"
              className="date-picker"
              value={date}
              onChange={(e)=>setDate(e.target.value)}
            />
            <button className="payroll-btn" style={{ padding: "8px 16px" }} onClick={fetchAttendance}>
              Filter
            </button>
          </div>
        </div>

        <div className="payroll-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a)=>(
                <tr key={a.attendance_id}>
                  <td>{a.attendance_id}</td>
                  <td>
                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{a.full_name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>ID: {a.employee_id}</div>
                  </td>
                  <td>{a.check_in ? new Date(a.check_in).toLocaleTimeString() : "-"}</td>
                  <td>{a.check_out ? new Date(a.check_out).toLocaleTimeString() : "-"}</td>
                  <td>
                    {a.attendance_date
                      ? new Date(a.attendance_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <span className={`status-badge ${a.status === 'Present' ? 'status-present' : 'status-absent'}`}>
                      {a.status}
                    </span>
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

export default Attendance;