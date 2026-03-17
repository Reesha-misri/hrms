import { useState } from "react";

function MyAttendance(){

const employee_id = localStorage.getItem("employee_id");
const [message,setMessage] = useState("");

const checkIn = async ()=>{

const res = await fetch("http://localhost:3001/checkin",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({employee_id})
});

const data = await res.text();
setMessage(data);

};

const checkOut = async ()=>{

const res = await fetch(`http://localhost:3001/checkout/${employee_id}`,{
method:"PUT"
});

const data = await res.text();
setMessage(data);

};

return(

<div style={{marginTop:"30px"}}>

<h2>My Attendance</h2>

<button onClick={checkIn}>Check In</button>

<button onClick={checkOut} style={{marginLeft:"10px"}}>
Check Out
</button>

<p>{message}</p>

</div>

);

}

export default MyAttendance;