import { useEffect, useState } from "react";

function LeaveApproval(){

const [leaves,setLeaves] = useState([]);

const fetchLeaves = async () => {

const res = await fetch("http://localhost:3001/leaves");
const data = await res.json();

setLeaves(data);

};

const loggedInEmployeeId = localStorage.getItem("employee_id");

useEffect(()=>{
fetchLeaves();
},[]);


const approveLeave = async(id)=>{

await fetch(`http://localhost:3001/approve-leave/${id}`,{
method:"PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ approver_id: loggedInEmployeeId })
});

fetchLeaves();

};

const rejectLeave = async(id)=>{

await fetch(`http://localhost:3001/reject-leave/${id}`,{
method:"PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ approver_id: loggedInEmployeeId })
});

fetchLeaves();

};


return(

<div style={{padding:"20px"}}>

<h2>Leave Requests</h2>

<table border="1" cellPadding="10">

<thead>

<tr>
<th>ID</th>
<th>Employee</th>
<th>Leave Type</th>
<th>Start</th>
<th>End</th>
<th>Status</th>
<th>Approve</th>
<th>Reject</th>
</tr>

</thead>

<tbody>

{leaves.map((l)=>(
<tr key={l.leave_id}>

<td>{l.leave_id}</td>
<td>{l.full_name}</td>
<td>{l.leave_type}</td>
<td>{new Date(l.start_date).toLocaleDateString()}</td>
<td>{new Date(l.end_date).toLocaleDateString()}</td>
<td>{l.status}</td>

<td>
{l.status === "Pending" && Number(l.employee_id) !== Number(loggedInEmployeeId) && (
<button onClick={() => approveLeave(l.leave_id)}>Approve</button>
)}
</td>

<td>
{l.status === "Pending" && Number(l.employee_id) !== Number(loggedInEmployeeId) && (
<button onClick={() => rejectLeave(l.leave_id)}>Reject</button>
)}
</td>

</tr>
))}

</tbody>

</table>

</div>

);

}

export default LeaveApproval;