import { useEffect, useState } from "react";

function Profile() {

  const [employee, setEmployee] = useState({});

  useEffect(() => {
    const employee_id = localStorage.getItem("employee_id");
  
    fetch(`http://localhost:3001/employee/${employee_id}`)
      .then(res => res.json())
      .then(data => setEmployee(data));
  }, []);

  return (

    <div style={{ padding: "20px" }}>

      <h2>My Profile</h2>

      <p><b>Name:</b> {employee.full_name}</p>
      <p><b>Department:</b> {employee.department_name}</p>
      <p><b>Designation:</b> {employee.designation_title}</p>
      <p><b>Communication Address:</b> {employee.communication_address}</p>
      <p><b>Permanent Address:</b> {employee.permanent_address}</p>

    </div>

  );

}

export default Profile;