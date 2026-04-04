import { useState, useEffect } from "react";
import "./MyAttendance.css";
import { Clock, Calendar, Filter, CheckCircle, XCircle } from "lucide-react";

function MyAttendance() {
  const employee_id = localStorage.getItem("employee_id");
  const role = localStorage.getItem("role");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [filterDate, setFilterDate] = useState("");

  const fetchHistory = async () => {
    try {
      let url = `http://localhost:3001/attendance?role=Employee&employee_id=${employee_id}`;
      if (filterDate) {
        url += `&date=${filterDate}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching attendance history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [employee_id]);

  const checkIn = async () => {
    const res = await fetch("http://localhost:3001/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id })
    });
    const data = await res.text();
    setMessage(data);
    fetchHistory(); // Refresh history after action
  };

  const checkOut = async () => {
    const res = await fetch(`http://localhost:3001/checkout/${employee_id}`, {
      method: "PUT"
    });
    const data = await res.text();
    setMessage(data);
    fetchHistory(); // Refresh history after action
  };

  return (
    <div className="my-attendance-container">
      <div className="attendance-layout">
        {/* ACTION CARD */}
        <div className="attendance-card action-card">
          <h2 className="section-title"><Clock size={20}/> Daily Attendance</h2>
          <div className="emp-badge">Employee ID: <strong>{employee_id}</strong></div>
          
          <div className="check-actions">
            <button className="check-btn check-in-btn" onClick={checkIn}>
              <CheckCircle size={18}/> Check In
            </button>
            <button className="check-btn check-out-btn" onClick={checkOut}>
              <XCircle size={18}/> Check Out
            </button>
          </div>

          {message && (
            <div className={`attendance-message ${message.toLowerCase().includes('success') || message.toLowerCase().includes('recorded') ? 'message-success' : 'message-error'}`}>
              {message}
            </div>
          )}
        </div>

        {/* HISTORY CARD */}
        <div className="attendance-card history-card">
          <div className="history-header">
            <h2 className="section-title"><Calendar size={20}/> Attendance History</h2>
            <div className="filter-group">
              <input 
                type="date" 
                className="date-picker" 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)}
              />
              <button className="filter-btn" onClick={fetchHistory}>
                <Filter size={16}/> Filter
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((record) => (
                    <tr key={record.attendance_id}>
                      <td>{new Date(record.attendance_date).toLocaleDateString()}</td>
                      <td>{record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</td>
                      <td>{record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</td>
                      <td>
                        <span className={`status-badge ${record.status === 'Present' ? 'status-present' : 'status-absent'}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>No records found for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyAttendance;