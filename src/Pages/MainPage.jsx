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
  const handleOpenEdit = (activity) => {
    setCurrentActivity(activity);
    setactivityname(activity.activityname);
    setactivityDescription(activity.activityDescription);
    setactivityStartTime(activity.startTime);
    setOpenEdit(true);
  };
  const handleCloseEdit = () => setOpenEdit(false);

  const handleFeedback = async (emojiName) => {
    const timestamp = new Date().toISOString();
    const feedback = {
      emoji: emojiName,
      timestamp: timestamp,
      _id: location.state._id,
    };

    try {
      await axios.post('http://localhost:3000/api/feedback', feedback); // idk where to send it 
      alert('Feedback sent successfully');
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('Failed to send feedback');
    }
  };


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
        setOpenCreate(false);
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
  }

  async function joinActivity() {
    await axios.get(`http://localhost:3000/api/activityAccess/${joinActivitystate}`)
      .then(res => {
        if (res.data.msg === "Activity found and it's available") {
          alert("Activity joined successfully");
          setOpenJoin(false);

          setActivities(prevActivities => [
            ...prevActivities,
            res.data.activity
          ]);
          setSelectedActivity(res.data.activity);
        } else {
          alert("Activity found but it's not available anymore.");
        }
      })
      .catch(err => {
        alert(err.response.data.msg);
        console.log(err);
      });
  }

  async function editActivityApi() {
    await axios.put(`http://localhost:3000/api/activity/${currentActivity._id}`, {
      activityname: activityname,
      activityDescription: activityDescription,
      startTime: activityStartTime.slice(0, activityStartTime.indexOf("GMT")),
    }).then(res => {
      alert("Activity update successfully");
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
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <h1>MainPage</h1>

        {
          (location.state?.userRole == "Teacher") &&
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <MDBBtn className="mb-4" onClick={handleOpenCreate}>
              Create
            </MDBBtn>
          </div>

        }
        {
          (location.state?.userRole === "Student") &&
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <MDBBtn className="mb-4" onClick={handleOpenJoin}>
              Join
            </MDBBtn>
          </div>
        }

        {/*This is the modal for creating an activity*/}
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
            <p>Upload a file: </p>
            <input type="file" id="file" name="file" accept=".ppt, .pptx, .doc, .docx, .zip, .pdf"
              onChange={e => {
                const file = e.target.files[0];
                setSelectedFile(file);
                console.log(file);
              }} />
            <p></p>
            <p>Enter a closing date: </p>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DateTimePicker']}>
                <DateTimePicker onAccept={e => {
                  setactivityStartTime(e.$d.toString())
                }} label="Closing Date" />
              </DemoContainer>
            </LocalizationProvider>
            <br />
            <MDBBtn className="mb-4" onClick={createActivityApi}>
              Create</MDBBtn>
          </Box>
        </Modal>

        {/*This is the modal that pops up when a student wants to join an activity*/}
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

        {/*This is the modal that pops up when a teacher wants to edit an activity*/}
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
                <DateTimePicker onAccept={e => {
                  setactivityStartTime(e.$d.toString())
                }} label="Closing Date" />
              </DemoContainer>
            </LocalizationProvider>
            <br />
            <MDBBtn className="mb-4" onClick={editActivityApi}>
              Edit</MDBBtn>
          </Box>
        </Modal>

        {/*This is what the student sees when he joins an activity*/}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          {activities.map(item => {
            return (
              <CardActionArea key={item._id} sx={{ width: '100%', maxWidth: '100%', margin: 2 }}>
                <Card sx={{ width: '100%', height: 400, border: 1 }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                    <Typography gutterBottom variant="h5" component="div" sx={{ textAlign: 'center' }}>
                      {item.activityname}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                      {item.activityDescription}
                    </Typography>
                    <Typography variant="body3" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                      {item.startTime}
                    </Typography>
                    <Typography variant="body3" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                      {item.activityCode}
                    </Typography>
                  </CardContent>
                </Card>
              </CardActionArea>
            );
          })}
        </Box>

        {/*This is the feedback section*/}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          {activities.map(item => {
            return (
              <Card key={item._id} sx={{ width: '80%', maxWidth: '50%', border: 1, margin: 2 }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 200 }}>
                  <CardActionArea onClick={() => handleFeedback('smile')} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: 1, width: 120, height: 120 }}>
                    <img src={`/emoticons/smile.png`} alt="smile" style={{ width: '100%', height: '100%' }} />
                  </CardActionArea>
                  <CardActionArea onClick={() => handleFeedback('frowny')} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: 1, width: 120, height: 120 }}>
                    <img src={`/emoticons/frowny.png`} alt="frowny" style={{ width: '100%', height: '100%' }} />
                  </CardActionArea>
                  <CardActionArea onClick={() => handleFeedback('confused')} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: 1, width: 120, height: 120 }}>
                    <img src={`/emoticons/confused.png`} alt="confused" style={{ width: '100%', height: '100%' }} />
                  </CardActionArea>
                  <CardActionArea onClick={() => handleFeedback('surprised')} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: 1, width: 120, height: 120 }}>
                    <img src={`/emoticons/surprised.png`} alt="surprised" style={{ width: '100%', height: '100%' }} />
                  </CardActionArea>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/*This is what a teacher is supposed to see*/}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          {activities.map(item => {
            return (
              <CardActionArea key={item._id} onClick={() => handleOpenEdit(item)} sx={{ width: '100%', maxWidth: '100%', margin: 2 }}>
                <Card sx={{ width: '100%', height: 400, border: 1 }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                    <Typography gutterBottom variant="h5" component="div" sx={{ textAlign: 'center' }}>
                      {item.activityname}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                      {item.activityDescription}
                    </Typography>
                    <Typography variant="body3" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                      {item.startTime}
                    </Typography>
                    <Typography variant="body3" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                      {item.activityCode}
                    </Typography>
                  </CardContent>
                </Card>
              </CardActionArea>
            );
          })}
        </Box>

        {/*This is the feedback section for the teacher*/}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          {activities.map(item => {
            return (
              <Card key={item._id} sx={{ width: '80%', maxWidth: '50%', border: 1, margin: 2 }}>
                <CardContent sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {/* {feedbacks.map((feedback, index) => (
                    <Typography key={index} variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                      Anonymous reacted {feedback.emoji} at {feedback.timestamp}
                    </Typography>
                  ))} */}

                {/* need to add the feedback route, this is just a mock rn */}
                </CardContent>
              </Card>
            );
          })}
        </Box>

      </div>

      {/* <div style={{ flex: 1, marginLeft: '20px' }}>
        {selectedActivity && (
          <Card sx={{ maxWidth: 345, border: 1, marginBottom: 2 }}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {selectedActivity.activityname}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {selectedActivity.activityDescription}
              </Typography>
              <Typography variant="body3" sx={{ color: 'text.secondary' }}>
                {selectedActivity.startTime}
              </Typography>
              <Typography variant="body3" sx={{ color: 'text.secondary' }}>
                {selectedActivity.activityCode}
              </Typography>
            </CardContent>
          </Card>
        )}
      </div> */}
    </div>
  )
}

export default MainPage;