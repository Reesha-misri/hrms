import { useEffect, useState } from "react";

function AuditLogs() {

  const [logs,setLogs] = useState([]);

  useEffect(()=>{
    fetchLogs();
  },[]);

  const fetchLogs = async () => {
    const res = await fetch("http://localhost:3001/audit-logs");
    const data = await res.json();
    setLogs(data);
  };

  return(
    <div style={{marginTop:"30px"}}>
      <h2>Audit Trail</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Log ID</th>
            <th>Employee</th>
            <th>Action</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>

          {logs.map((log)=>(
            <tr key={log.log_id}>
              <td>{log.log_id}</td>
              <td>{log.full_name}</td>
              <td>{log.action}</td>
              <td>{log.log_time}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default AuditLogs;