import { MDBBtn, MDBContainer, MDBInput } from "mdb-react-ui-kit";
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
  const [open, setOpen] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const handleOpenCreate = () => setOpen(true);
  const handleCloseCreate = () => setOpen(false);
  const handleOpenJoin = () => setOpenJoin(true);
  const handleCloseJoin = () => setOpenJoin(false);
  const [activityname, setactivityname] = useState("");
  const [newActivityCode, setnewActivityCode] = useState("");
  const [joinActivitystate, setjoinActivitystate] = useState("");
  const [activityDescription, setactivityDescription] = useState("");
  const [activityStartTime, setactivityStartTime] = useState("");
  const [activities, setActivities] = useState([]);

  const handleFeedback = async (emojiName) => {
    const timestamp = new Date().toISOString();
    const feedback = {
      feedbackMsg: emojiName,
      timestamp: timestamp,
      _id: location.state._id,
    };

    try {
      await axios.post('http://localhost:3000/api/activityFeedback', feedback);
      setFeedbacks(prevFeedbacks => [...prevFeedbacks, feedback]);
      alert('Feedback sent successfully');
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('Failed to send feedback');
    }
  };

  async function endSession() {
    await axios.patch('http://localhost:3000/api/activityEnd/${location.state._id}')
      .then(res => {
        alert('Session ended successfully');
      })
      .catch(err => {
        console.error('Error ending session:', err);
        alert('Failed to end session');
      });
  }

  async function createActivityApi() {
    await axios.post(`http://localhost:3000/api/activity`, {
      activityname: activityname,
      activityDescription: activityDescription,
      startTime: activityStartTime.slice(0, activityStartTime.indexOf("GMT")),
      createdBy: location.state._id
    })
      .then(res => {
        alert("Activity Created");
        setnewActivityCode(res.data.activityCode);
        setOpen(false);
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
  }

  async function joinActivity() {
    console.log(`http://localhost:3000/api/activityAccess/${joinActivitystate}/${location.state._id}`);
    await axios.get(`http://localhost:3000/api/activityAccess/${joinActivitystate}/${location.state._id}`)
      .then(res => {
        console.log(res);
        if (res.data.msg == "Activity found and it's available") {
          alert("Activity found and it's available");
          setOpenJoin(false);
        } else alert("Activity found but it's not available");
      })
      .catch(err => {
        alert(err.response.data.msg);
        console.log(err);
      });
  }

  useEffect(() => {
    if (location.state.userRole == "Teacher") {
      axios.get(`http://localhost:3000/api/activitiesPerUser/${location.state._id}`)
        .then(res => {
          setActivities(res.data);
          console.log(res);
        })
        .catch(err => {
          alert(err.response.data.msg);
          console.log(err);
        });
    } else {
      axios.get(`http://localhost:3000/api/activitiesPerStudent/${location.state._id}`)
        .then(res => {
          setActivities(res.data);
          console.log(res);
        })
        .catch(err => {
          alert(err.response.data.msg);
          console.log(err);
        });
    }
  }, [location.state._id, location.state.userRole]);

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, textAlign: 'center', borderBottom: '1px solid black' }}>
        <h1>{location.state?.userRole === "Student" ? "Student Page" : "Teacher Page"}</h1>

        {location.state?.userRole == "Teacher" && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <MDBBtn className="mb-4" onClick={handleOpenCreate}>
              Create
            </MDBBtn>
          </div>
        )}
        {location.state?.userRole === "Student" && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <MDBBtn className="mb-4" onClick={handleOpenJoin}>
              Join
            </MDBBtn>
          </div>
        )}

        {/* This is the modal for creating an activity */}
        <Modal
          open={open}
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
                  setactivityStartTime(e.$d.toString());
                }} label="Closing Date" />
              </DemoContainer>
            </LocalizationProvider>
            <br />
            <MDBBtn className="mb-4" onClick={createActivityApi}>
              Create
            </MDBBtn>
          </Box>
        </Modal>

        {/* This is the modal that pops up when a student wants to join an activity */}
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
              Join
            </MDBBtn>
          </Box>
        </Modal>
        
        <Box>
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
        </Box>

        {/* This is the end session button */}
        {location.state?.userRole === "Teacher" && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <MDBBtn className="mb-4" onClick={endSession}>
              End session
            </MDBBtn>
          </div>
        )}

        {/* This is the feedback section */}
        {location.state?.userRole === "Student" && (
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
        )}

        {/* This is the feedback display section */}
        {location.state?.userRole === "Teacher" && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <Card sx={{ width: '80%', maxWidth: '50%', border: 1, margin: 2 }}>
            <CardContent sx={{ maxHeight: 200, overflowY: 'auto' }}>
              {feedbacks.map((feedback, index) => (
                <Typography key={index} variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                  Anonymous reacted {feedback.emoji} at {feedback.timestamp}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Box>
        )};
      </div>
    </div>
  );
}

export default MainPage;