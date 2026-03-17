import { useEffect, useState } from "react";

function Attendance(){

const [attendance,setAttendance] = useState([]);
const [date,setDate] = useState("");

const fetchAttendance = async () => {

const role = localStorage.getItem("role");
const employee_id = localStorage.getItem("employee_id");

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

<div style={{marginTop:"30px"}}>

<div style={{marginBottom:"10px"}}>

<input
type="date"
value={date}
onChange={(e)=>setDate(e.target.value)}
/>

<button onClick={fetchAttendance}>
Filter
</button>

</div>

<h2>Attendance</h2>

<table border="1" cellPadding="10">

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
<td>{a.employee_id}</td>
<td>{a.check_in ? a.check_in : "-"}</td>
<td>{a.check_out ? a.check_out : "-"}</td>

<td>
{a.attendance_date
? new Date(a.attendance_date).toLocaleDateString()
: "N/A"}
</td>

<td>{a.status}</td>

</tr>
))}

</tbody>

</table>

</div>

);

}

export default Attendance;