import { useEffect, useState } from "react";
import API_URL from "../api";
import "./AuditLogs.css";

function AuditLogs() {
  const [logs,setLogs] = useState([]);

  useEffect(()=>{
    fetchLogs();
  },[]);

  const fetchLogs = async () => {
    const res = await fetch(`${API_URL}/audit-logs`);
    const data = await res.json();
    setLogs(data);
  };

  return(
    <div className="audit-container">
      <div className="audit-card">
        <h2 className="attendance-title" style={{ marginBottom: "24px" }}>System Audit Trail</h2>
        <div className="audit-list">
          {logs.map((log)=>(
            <div key={log.log_id} className="audit-item">
              <div className="audit-time">
                {new Date(log.log_time).toLocaleString()}
              </div>
              <div className="audit-action">
                {log.action}
              </div>
              <div className="audit-user">
                Performed by: <b>{log.full_name || 'System'}</b>
                <span style={{ marginLeft: "10px", fontSize: "12px" }}>(ID: {log.employee_id})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;