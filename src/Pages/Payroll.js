import { useState, useEffect } from "react";

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

<div style={{marginTop:"30px"}}>

  {canGenerate && (
    <>
      <h2>Generate Payroll</h2>

      <input
        type="number"
        placeholder="Employee ID"
        value={employeeId}
        onChange={(e)=>setEmployeeId(e.target.value)}
      />

      <br/><br/>

      <input
        type="text"
        placeholder="Month"
        value={month}
        onChange={(e)=>setMonth(e.target.value)}
      />

      <br/><br/>

      <button onClick={generatePayroll}>
        Generate Payroll
      </button>

      <p>{message}</p>
    </>
  )}

<h2>Payroll Records</h2>

<table border="1" cellPadding="10">

<thead>
<tr>
<th>ID</th>
<th>Employee</th>
<th>Month</th>
<th>Total Salary</th>
<th>Generated Date</th>
</tr>
</thead>

<tbody>

{payroll.map((p)=>(
<tr key={p.payroll_id}>

<td>{p.payroll_id}</td>
<td>{p.employee_id}</td>
<td>{p.month}</td>
<td>{p.total_salary}</td>
<td>{p.generated_date}</td>
<td>
<button onClick={() => window.print()}>
Download Payslip
</button>
</td>

</tr>
))}

</tbody>

</table>

</div>

);

}

export default Payroll;