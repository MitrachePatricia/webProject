import {
    MDBContainer,
    MDBInput,
    MDBBtn,
  
  }
  from 'mdb-react-ui-kit';
  import { useState } from 'react';
  import axios from 'axios';
  import { useNavigate } from "react-router-dom";
function FormActivity() {
  const navigate = useNavigate();
  const [activityname, setactivityname] = useState("");
  const [activityDescription,setactivityDescription] = useState("");
  // async function createActivityApi() {

  // }
    return (
        
      <MDBContainer className="p-3 my-5 d-flex flex-column w-50" >
      <p>Enter activity name:</p>
      <MDBInput wrapperClass='mb-4' label='Name' id='form1' type='name' onChange={e=>{
        setactivityname(e.target.value);
      }}/>
      <p>Enter your password:</p>
      <MDBInput wrapperClass='mb-4' label='Short Description' id='form2' type='name' onChange={e=>{
        setactivityDescription(e.target.value);
        }}
      />
      </MDBContainer>
    )
  }

  export default FormActivity;