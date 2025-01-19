import {
  MDBBtn, MDBContainer,
  MDBInput,
} from "mdb-react-ui-kit"
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
function MainPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [activityname, setactivityname] = useState("");
  const [activityCode, setnewActivityCode] = useState("");
  const [joinActivitystate, setjoinActivitystate] = useState("");
  const [activityDescription, setactivityDescription] = useState("");
  const [activityStartTime, setactivityStartTime] = useState("");
  const [activities, setActivities] = useState([]);

  const handleOpenCreate = () => setOpenCreate(true);
  const handleCloseCreate = () => setOpenCreate(false);
  const handleOpenJoin = () => setOpenJoin(true);
  const handleCloseJoin = () => setOpenJoin(false);
  const handleOpenEdit = activity => {
    setCurrentActivity(activity);
    setactivityname(activity.activityname); setactivityDescription(activity.activityDescription);
    setactivityStartTime(activity.startTime); setOpenEdit(true);
  };
  const handleCloseEdit = () => setOpenEdit(false);

  function generateRandomCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }


  async function createActivityApi() {

    const activityCode = generateRandomCode(6);

    await axios.post(`http://localhost:3000/api/activity`, {
      activityname: activityname,
      activityCode: activityCode,
      activityDescription: activityDescription,
      startTime: activityStartTime.slice(0, activityStartTime.indexOf("GMT")),
      createdBy: location.state._id

    })
      .then(res => {
        alert("Activity Created.\n Activity code: " + activityCode)
        setOpen(false);
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
  }

  async function joinActivity() {

    await axios.get(`http://localhost:3000/api/activityAccess/${joinActivitystate}`)
      .then(res => {

        console.log(res)
        if (res.data.msg == "Activity found and it's available") {
          alert("Activity found and it's available")
          setOpenJoin(false);
        }
        else alert("Activity found but it's not available")
      })
      .catch(err => {
        alert(err.response.data.msg)
        console.log(err)
      })
  }

  async function editActivityApi() {
    await axios.put(`http://localhost:3000/api/activity/${currentActivity._id}`, {
      activityname: activityname,
      activityDescription: activityDescription,
      startTime: activityStartTime.slice(0, activityStartTime.indexOf("GMT")),
    }).then(res => {
      alert("Activity update sucessfully");
      setOpenEdit(false);
      setCurrentActivity(null);
      console.log(res)
      axios.get(`http://localhost:3000/api/activitiesPerUser/${location.state._id}`)
        .then(res => {
          setActivities(res.data);
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        });
      console.log(res);
    })
      .catch(err => {
        console.log(err);
      });
  }

  useEffect(() => {

    axios.get(`http://localhost:3000/api/activitiesPerUser/${location.state._id}`)
      .then(res => {
        setActivities(res.data)
        console.log(res)
      })
      .catch(err => {
        alert(err.response.data.msg)
        console.log(err)
      })
  }, [location.state._id]);

  return (
    <div>
      <h1>MainPage</h1>

      {
        (location.state?.userRole == "Teacher") &&
        <div>
          <MDBBtn className="mb-4" onClick={handleOpenCreate}>
            Create
          </MDBBtn>
        </div>
      }
      {
        (location.state?.userRole === "Student") &&
        <MDBBtn className="mb-4" onClick={handleOpenJoin}>Join</MDBBtn>  // need to change it so the student can click on the card to access the activity
      }

      <div>
        <MDBBtn className="mb-4" onClick={handleOpenJoin}>
          Join</MDBBtn></div>

      <Modal
        open={openCreate}
        onClose={handleCloseCreate}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2>Create Activity</h2>
          <p>Enter activity name:</p>
          <MDBInput wrapperClass='mb-4' label='Name' id='form1' type='name' onChange={e => {
            setactivityname(e.target.value);
          }} />
          <p>Enter a short description:</p>
          <MDBInput wrapperClass='mb-4' label='Short Description' id='form2' type='text' onChange={e => {
            setactivityDescription(e.target.value);


          }} />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DateTimePicker']}>
              <DateTimePicker
                value={activityStartTime}
                onChange={date => setactivityStartTime(date.$d)}  //need to change here cause it doesnt make sense
               label="Deadline" />
            </DemoContainer>
          </LocalizationProvider>
          <br />
          <MDBBtn className="mb-4" onClick={createActivityApi}>
            Create</MDBBtn>
        </Box>
      </Modal>


      <Modal
        open={openJoin}
        onClose={handleCloseJoin}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>

          <h2>Join Activity</h2>
          <p>Enter activity code:</p>
          <MDBInput wrapperClass='mb-4' label='Code' id='form1' type='name' onChange={e => {
            setjoinActivitystate(e.target.value);
          }} />

          <MDBBtn className="mb-4" onClick={joinActivity}>
            Join</MDBBtn>
        </Box>
      </Modal>

      <Modal
        open={openEdit}
        onClose={handleCloseEdit}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2>Edit Activity</h2>
          <p>Enter activity name:</p>
          <MDBInput wrapperClass='mb-4' label='Name' id='form1' type='name' value={activityname} onChange={e => {
            setactivityname(e.target.value);
          }} />
          <p>Enter a short description:</p>
          <MDBInput wrapperClass='mb-4' label='Short Description' id='form2' type='text' value={activityDescription} onChange={e => {
            setactivityDescription(e.target.value);
          }} />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DateTimePicker']}>
            <DateTimePicker
                value={activityStartTime}
                onChange={date => setactivityStartTime(date.$d)}  //need to change here cause it doesnt make sense
               label="Deadline"/>
            </DemoContainer>
          </LocalizationProvider>
          <br />
          <MDBBtn className="mb-4" onClick={editActivityApi}>
            Edit</MDBBtn>
        </Box>
      </Modal>
      <Box>
        {
          (location.state?.userRole == "Teacher") && activities?.map(item => {
            return (
              <Card key={item._id} sx={{ maxWidth: 345, border: 1, marginLeft: 2 }}>
                <CardActionArea>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {item.activityname}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {item.activityDescription}
                    </Typography>
                    <Typography variant="body3" sx={{ color: 'text.secondary' }}>
                      {item.startTime}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })
        }
      </Box>
    </div>



  )

}
export default MainPage;