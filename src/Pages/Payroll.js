import { useState, useEffect } from "react";
import "./Payroll.css";

function Payroll({ canGenerate }){
  const [employeeId,setEmployeeId] = useState("");
  const [month,setMonth] = useState("");
  const [message,setMessage] = useState("");
  const [payroll,setPayroll] = useState([]);

  const role = localStorage.getItem("role");
  const loggedInEmpId = localStorage.getItem("employee_id");

  const generatePayroll = async () => {
    const res = await fetch("http://localhost:3001/generate-payroll",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        employee_id:employeeId,
        month:month
      })
    });

    const data = await res.text();
    setMessage(data);
    fetchPayroll(); // refresh table
  };

  const fetchPayroll = async ()=>{
    const res = await fetch(`http://localhost:3001/payroll?role=${role}&employee_id=${loggedInEmpId}`);
    const data = await res.json();
    setPayroll(data);
  };

  useEffect(()=>{
    fetchPayroll();
  },[]);

  return(
    <div className="payroll-container">
      {canGenerate && (
        <div className="payroll-card">
          <h2 className="payroll-title">Generate Monthly Payroll</h2>
          <div className="payroll-form">
            <input
              type="number"
              className="payroll-input"
              placeholder="Employee ID"
              value={employeeId}
              onChange={(e)=>setEmployeeId(e.target.value)}
            />
            <input
              type="text"
              className="payroll-input"
              placeholder="Month (e.g. March 2024)"
              value={month}
              onChange={(e)=>setMonth(e.target.value)}
            />
            <button className="payroll-btn" onClick={generatePayroll}>
              Generate
            </button>
          </div>
          {message && (
            <p style={{ marginTop: "15px", color: message.includes("success") ? "#059669" : "#dc2626", fontWeight: "500" }}>
              {message}
            </p>
          )}
        </div>
      )}

      <div className="payroll-card">
        <h2 className="payroll-title">Payroll Records</h2>
        <div className="payroll-table-container">
          <table className="payroll-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>Month</th>
                <th>Total Salary</th>
                <th>Generated Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payroll.map((p)=>(
                <tr key={p.payroll_id} className="payroll-row">
                  <td>{p.payroll_id}</td>
                  <td><b>{p.employee_id}</b></td>
                  <td>{p.month}</td>
                  <td><span style={{ color: "#059669", fontWeight: "700" }}>₹{p.total_salary}</span></td>
                  <td>{new Date(p.generated_date).toLocaleDateString()}</td>
                  <td>
                    <button className="payslip-btn" onClick={() => window.print()}>
                      Download Payslip
                    </button>
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

export default Payroll;