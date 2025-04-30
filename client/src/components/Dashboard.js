import React, { useEffect, useRef, useState } from "react";
import defaultProfilePic from "../images/user.png"; // Ensure path is correct
import { Button, Modal } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { add_complaint, get_all_complaints, get_my_complaints } from "../redux/complaintSlice";
import axios from "axios";
import { toast } from "react-toastify";
import Complaintcard from "./Complaintcard"; // Assumes this component adapts to dark theme via props or CSS
import Error from "./Error"; // Assumes this component adapts to dark theme via props or CSS
import { change_in_prof_img, redirect_to_dashboard } from "../redux/studentSlice";
import Footer from "./Footer"; // Assumes this component adapts to dark theme via props or CSS
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import Typography from '@mui/material/Typography';
import '../css/dashboard.css'; // Your CSS file is crucial for dark theme overrides

// StyledRating for dark theme (gold stars usually look good)
const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#ffb400', // Gold color for filled stars
  },
  '& .MuiRating-iconHover': {
    color: '#ffb400', // Gold color on hover
  },
   // Optional: Style empty icons if needed for contrast
  '& .MuiRating-iconEmpty': {
     color: '#666', // Darker gray for empty stars
   }
});


const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showFeedBack, setShowFeedback] = useState(false);
  const [ShowPayment, setShowPayment] = useState(false);
  const [ShowBill, setShowBill] = useState(false);
  const studentData = useSelector((state) => state.students);
  const [showMyComplaints, setShowMyComplaints] = useState(true);
  const [morningRating, setMorningRating] = useState(3);
  const [lunchRating, setLunchRating] = useState(3);
  const [eveningRating, setEveningRating] = useState(3);
  const [dinnerRating, setDinnerRating] = useState(3);
  const [amount, setAmount] = useState();
  const [stAmount, setstAmount] = useState();
  const [menu, setMenu] = useState('');
  const myComplaints = useSelector((state) => state.complaints.myComplaints);
  const allComplaints = useSelector((state) => state.complaints.complaints);

  const dispatch = useDispatch();

  const [title, settitle] = useState("");
  const [description, setDescription] = useState("");
  const [proofImage, setProofImage] = useState();
  const studentName = studentData.name;
  const studentEmail = studentData.email;

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const openMenu = () => {
    axios.get(`${process.env.REACT_APP_BACK_END_URL}/student/messMenu`, {
        headers: { 'Authorization': localStorage.getItem('token') }
    }).then(res => {
      if (res.data.status === 200 && res.data.data?.messMenu) {
        setMenu(res.data.data.messMenu);
      } else {
        console.log("Mess menu load error or no menu found:", res.data.message);
        setMenu('');
        toast.warn("Could not load mess menu.");
      }
    }).catch(err => {
      console.log("Mess menu fetch error:", err);
      setMenu('');
      toast.error("Error fetching mess menu.");
    });
    setShowMenu(true);
  };
  const closeMenu = () => setShowMenu(false);

  const openFeedback = () => setShowFeedback(true);
  const closeFeedback = () => setShowFeedback(false);

  const [profilePic, setProfilePic] = useState(studentData.profileImg || defaultProfilePic);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // handleImageChange remains the same logic
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      axios.post(`${process.env.REACT_APP_BACK_END_URL}/fileUpload/`, formData)
      .then(res => {
        if(res.data.status === 200 && res.data.data?.url){
          const newImage = res.data.data.url;
          const prof_image = { image_url: newImage };

          return axios.post(`${process.env.REACT_APP_BACK_END_URL}/student/uploadProfile`, prof_image, {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': localStorage.getItem('token')
              }
          });
        } else {
          throw new Error(res.data.message || "Failed to upload image file.");
        }
      })
      .then(res => {
         if (res.data.status === 200) {
            toast.success("Profile image updated successfully!");
            const newImageUrl = res.data.data?.profileImg || profilePic;
            setProfilePic(newImageUrl);
            dispatch(change_in_prof_img({ image: newImageUrl }));
         } else {
            toast.error(res.data.message || "Failed to save profile image link.");
         }
      })
      .catch(error => {
        console.error("Image Upload Error:", error);
        toast.error(error.message || "Failed to upload image. Please try again.");
      });

    } else {
      toast.warn("No file selected or invalid file.");
    }
  };


  // handleFeedback remains the same logic
  const handleFeedback = (e) => {
    e.preventDefault();
    const feedbackData = {
        ratings: [ morningRating, lunchRating, eveningRating, dinnerRating ]
    };
    axios.post(`${process.env.REACT_APP_BACK_END_URL}/student/giveFeedback`, feedbackData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token')
      }
    })
    .then((res) => {
      if(res.data.status===200) {
        toast.success("Feedback successfully submitted!");
        closeFeedback();
      } else {
        toast.error(res.data.message || "Could not submit feedback.");
      }
    })
    .catch((err) => {
      console.error("Feedback Error:", err);
      toast.error("Failed to submit feedback. Please try again.");
    });
  };

  const openPayment = () => setShowPayment(true);
  const closePayment = () => setShowPayment(false);

  const [bills,setBills] = useState([]);
  const [date,setDate] = useState("");

  const openBill = () => {
      setBills([]);
      setDate("");
      setShowBill(true);
  }
  const closeBill = () => setShowBill(false);

  // handleBills remains the same logic
  const handleBills = (e) =>{
    e.preventDefault();
    if (!date) {
        toast.warn("Please select a date to view bills.");
        return;
    }
    axios.post(`${process.env.REACT_APP_BACK_END_URL}/student/getBills`,
      { date: date },
      { headers: { 'Authorization': localStorage.getItem('token') } }
    ).then(res => {
      if (res.data.status === 200) {
          setBills(res.data.data || []);
          if (!res.data.data || res.data.data.length === 0) {
              toast.info("No bills found for the selected date.");
          }
      } else {
          setBills([]);
          toast.error(res.data.message || "Error fetching bills.");
      }
    })
    .catch(err => {
      console.error("Error fetching bills:", err);
      setBills([]);
      toast.error("Error in fetching bills. Please try again.");
    });
  }

  // useEffect for data fetching remains the same logic
  useEffect(() => {
     const fetchData = () => {
       const authToken = localStorage.getItem('token');
       if (!authToken) {
         console.log("No auth token found.");
         return;
       }
       axios.defaults.headers.common['Authorization'] = authToken;

       axios.get(`${process.env.REACT_APP_BACK_END_URL}/student/dashboard`)
         .then((response) => {
           if (response.data.status === 200) {
             const studentRespData = response.data.data;

             // Update profile pic state
             const currentImage = studentRespData.profileImg || defaultProfilePic;
             if (currentImage !== profilePic) {
                setProfilePic(currentImage);
                 dispatch(change_in_prof_img({ image: studentRespData.profileImg }));
             }

             // Calculate remaining amount
             if(studentRespData.feePaid === true){
               axios.get(`${process.env.REACT_APP_BACK_END_URL}/student/hostelExpensePerPerson`, { headers: { 'Authorization': authToken } })
                 .then((expenseResponse)=>{
                   if (expenseResponse.data.status === 200) {
                       let expense = expenseResponse.data.data.expense || 0;
                       let feeAmount = studentRespData.feeAmount || 0;
                       let amt = feeAmount - expense;
                       setstAmount(amt >= 0 ? amt : 0);
                   } else {
                       setstAmount(undefined);
                       // toast.warn("Could not fetch expense data."); // Maybe too noisy for interval refresh
                   }
                 }).catch((error)=>{
                   setstAmount(undefined);
                   console.log("Expense fetch error: "+error);
                   // toast.error("Error fetching expense data."); // Maybe too noisy
                 })
             } else {
               setstAmount(undefined);
             }

             // Dispatch student data
             dispatch(
               redirect_to_dashboard({
                 name : studentRespData.name,
                 email: studentRespData.email,
                 regNo: studentRespData.regNo,
                 hostelName: studentRespData.hostelName,
                 roomNo: studentRespData.roomNo,
                 token: authToken,
                 profileImg: studentRespData.profileImg
               })
             )

             // Dispatch complaints
             dispatch(
               get_all_complaints({ complaints: studentRespData.complaints || [] })
             );
             dispatch(
               get_my_complaints({ myComplaints: studentRespData.myComplaints || [] })
             );
           } else {
             // toast.error("Could not fetch dashboard data!"); // Maybe too noisy
             console.log("Error fetching dashboard data:", response.data.message);
           }
         })
         .catch((error) => {
           console.error("Error fetching student data:", error);
           // toast.error("Error fetching dashboard data. Check connection or login again."); // Maybe too noisy
         });
     };

     fetchData();
     const intervalId = setInterval(fetchData, 30000);

     return () => {
       clearInterval(intervalId);
       axios.defaults.headers.common['Authorization'] = null;
     };
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dispatch]); // Removed profilePic from deps

  // handleComplaint remains the same logic
   const handleComplaint = (e) => {
     e.preventDefault();
     closeModal();
     const complaintData = { title, description, studentName };

     const submitComplaint = (imageData = null) => {
        if (imageData) { complaintData.image_url = imageData.url; }
        axios.post(`${process.env.REACT_APP_BACK_END_URL}/student/addComplaint`, complaintData, {
          headers: { 'Authorization': localStorage.getItem('token') }
        })
        .then((res) => {
            if (res.data.status === 200 && res.data.data) {
                dispatch(add_complaint(res.data.data));
                toast.success("Complaint added successfully");
                settitle(""); setDescription(""); setProofImage(null);
            } else { toast.error(res.data.message || "Error adding complaint."); }
        })
        .catch((err) => {
            console.log("Add Complaint Error:", err);
            toast.error("Error in adding complaint. Please try again.");
        });
     };

     if(proofImage){
       const formData = new FormData();
       formData.append('file', proofImage);
       axios.post(`${process.env.REACT_APP_BACK_END_URL}/fileUpload/`, formData)
         .then(res => {
            if (res.data.status === 200 && res.data.data?.url) {
                submitComplaint({ url: res.data.data.url });
            } else { toast.error(res.data.message || "Failed to upload proof image."); }
         })
         .catch(err => {
           console.error("Proof Image Upload Error:", err);
           toast.error("Failed to upload proof image. Complaint not submitted.");
         })
     } else { submitComplaint(); }
   };


  // handlePayment remains the same logic, but update theme color
  const handlePayment = async (e) => {
    e.preventDefault();
    closePayment();
    if (!amount || amount <= 0) {
        toast.warn("Please enter a valid amount.");
        return;
    }
    try {
        const { data: { key } } = await axios.get(`${process.env.REACT_APP_BACK_END_URL}/getkey`);
        const { data: { order } } = await axios.post(`${process.env.REACT_APP_BACK_END_URL}/checkout`, { amount }, {
            headers: { 'Authorization': localStorage.getItem('token') }
        });
        if (!order) {
            toast.error("Could not create payment order. Please try again.");
            return;
        }
        const options = {
            key: key,
            amount: order.amount,
            currency: "INR",
            name: "Hostel Mess Payment",
            description: `Payment for ${studentData.hostelName}`,
            order_id: order.id,
            handler: async function(response) {
                const body = { ...response };
                try {
                    const validateResponse = await fetch(`${process.env.REACT_APP_BACK_END_URL}/paymentverification`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': localStorage.getItem('token')
                        },
                        body: JSON.stringify(body)
                    });
                    const jsonResponse = await validateResponse.json();
                    if (jsonResponse.status === 200 && jsonResponse.data?.success === true) {
                        toast.success(`Payment successful! Reference: ${response.razorpay_payment_id}`);
                        // Optionally trigger data refresh here
                    } else {
                        toast.error(jsonResponse.message || "Payment verification failed. Contact support if amount was debited.");
                    }
                } catch (verificationError) {
                    console.error("Verification Fetch Error:", verificationError);
                    toast.error("Error during payment verification. Contact support.");
                }
            },
            prefill: {
                name: studentName || "Student Name",
                email: studentEmail || "student@example.com",
                contact: ""
            },
            notes: { "address": "Hostel Management System" },
            theme: {
                // "color": "#1ABC9C" // Use a primary dark theme color (e.g., teal)
                 "color": "#121212" // Or match the background
            }
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response){
            console.error("Payment Failed:", response.error);
            toast.error(`Payment Failed: ${response.error.description} (Reason: ${response.error.reason})`);
        });
        paymentObject.open();
    } catch (error) {
        console.error("Payment Setup Error:", error);
        toast.error("Error setting up payment. Please try again later.");
    }
  }

  // ---- STYLES ---- (Dark Theme Adjustments)
  const pageStyle = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#121212", // Very dark gray/black background
    color: "#E0E0E0", // Light gray text
  };

  const headingStyle = {
    backgroundColor: "#1E1E1E", // Slightly lighter dark background
    padding: "20px",
    borderRadius: "8px",
    // boxShadow: "0 1px 3px rgba(255, 255, 255, 0.1)", // Subtle white shadow (optional)
    border: "1px solid #333", // Darker border
    color: "#FFFFFF", // White text for header elements
  };

  const profilePicStyle = {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #1ABC9C", // Use a bright accent color (Teal)
    cursor: "pointer",
  };

  // Style for inputs within modals for dark theme
  const modalInputStyle = {
    backgroundColor: "#2C2C2C", // Dark background for inputs
    color: "#E0E0E0", // Light text
    border: "1px solid #444", // Slightly lighter border than background
    borderRadius: '5px',
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
  };
   const modalTextAreaStyle = { ...modalInputStyle, minHeight: '100px'}; // Specific style for textarea if needed

  // ---- AUTH CHECK ----
  const isAuthenticatedStudent = useSelector((state) => state.students.token !== null);
  const authToken = localStorage.getItem('token');

  if (!authToken || !isAuthenticatedStudent) {
     // Ensure Error component is styled for dark theme too
    return <Error message="You are not logged in or your session has expired. Please log in again." />;
  }

  // ---- RENDER DASHBOARD ----
  return (
    <div style={pageStyle}>
      {/* Header Section */}
      <div className="container mt-4 mb-4 shadow-sm" style={headingStyle}> {/* Use shadow-sm or remove if contrast is enough */}
        <div className="row align-items-center">
          {/* Left Side: Profile Pic and Info */}
          <div className="col-md-6 d-flex align-items-center custom-left">
            <div className="profile-pic-container me-3" onClick={handleImageClick}>
              <img
                src={profilePic}
                alt="Profile"
                style={profilePicStyle}
              />
              {/* Ensure .update-overlay is styled for dark theme in dashboard.css */}
              <div className="update-overlay">Edit</div>
              <input
                type="file"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/png, image/jpeg, image/jpg"
              />
            </div>
            <div>
              <p style={{ marginBottom: '2px', fontWeight: 'bold', fontSize: '1.1em', color: '#FFFFFF' }}>{studentData.name || "Student Name"}</p>
              <p style={{ marginBottom: '0px', color: '#AAA' }}>{studentData.regNo || "Reg No N/A"}</p> {/* Lighter gray for less important info */}
            </div>
          </div>

          {/* Right Side: Hostel Info and Balance */}
          <div className="col-md-6 text-md-end custom-right">
             <p style={{ fontSize: "1.2em", marginBottom: '5px', color: '#FFFFFF' }}>
               {studentData.hostelName ? `Hostel: ${studentData.hostelName}` : "Hostel N/A"}
             </p>
             <p style={{ fontSize: "1em", marginBottom: '5px', color: '#AAA' }}>
               {studentData.roomNo ? `Room: ${studentData.roomNo}` : "Room N/A"}
             </p>
            <p style={{ fontSize: "1em", marginBottom: '0px', color: '#FFFFFF' }}>
                Balance: <span style={{color: '#2ECC71', fontWeight: 'bold'}}> {/* Bright Green for balance */}
                    {stAmount !== undefined ? `₹${stAmount.toFixed(2)}` : "N/A"}
                </span>
            </p>
          </div>
        </div>
      </div>

      {/* Button Bar Section */}
      {/* IMPORTANT: Bootstrap variants (primary, success etc.) NEED CSS overrides for dark theme */}
      {/* Provide data-bs-theme="dark" attribute to container OR override styles in dashboard.css */}
      <div className="container mb-4" data-bs-theme="dark"> {/* OPTION 1: Using Bootstrap's dark theme attribute */}
         <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
            <Button
                variant={!showMyComplaints ? "primary" : "outline-primary"} // Assumes variants are styled for dark theme
                onClick={() => setShowMyComplaints(false)}
                >
                All Complaints
            </Button>
            <Button
                variant={showMyComplaints ? "primary" : "outline-primary"}
                onClick={() => setShowMyComplaints(true)}
                >
                My Complaints
            </Button>
            <Button variant="info" onClick={openMenu}> {/* text-white might not be needed if variant is styled */}
                View Mess Menu
            </Button>
            <Button variant="success" onClick={openModal}>
                Add Complaint
            </Button>
            <Button variant="warning" onClick={openFeedback}>
                Add Feedback
            </Button>
             <Button variant="danger" onClick={openPayment}>
                Make Payment
             </Button>
             <Button variant="secondary" onClick={openBill}>
                See Bill
             </Button>
         </div>
      </div>

      {/* Complaints Section */}
      <div className="container mt-4 mb-5 flex-grow-1">
        <h2 className="text-center mb-4" style={{ color: "#1ABC9C" }}> {/* Teal heading */}
          {showMyComplaints ? "My Complaints" : "All Complaints"}
        </h2>
        <div className="row g-4">
          {showMyComplaints
            ? (myComplaints?.myComplaints && myComplaints.myComplaints.length > 0
              ? myComplaints.myComplaints.map((complaint) => (
                  <div key={complaint._id || complaint.id} className="col-md-6">
                    {/* Ensure Complaintcard is styled for dark theme */}
                    <Complaintcard
                      complaint={complaint}
                      showMyComplaints={showMyComplaints}
                    />
                  </div>
                ))
              : <p className='text-secondary text-center'>You haven't made any complaints yet.</p>) // text-secondary should map to a light gray in dark theme
            : (allComplaints?.complaints && allComplaints.complaints.length > 0
              ? allComplaints.complaints.map((complaint) => (
                  <div key={complaint._id || complaint.id} className="col-md-6">
                     {/* Ensure Complaintcard is styled for dark theme */}
                    <Complaintcard
                      complaint={complaint}
                      showMyComplaints={showMyComplaints}
                    />
                  </div>
                ))
              : <p className='text-secondary text-center'>No complaints available to display.</p>)
            }
        </div>
      </div>

      {/* ---- MODALS ---- */}
      {/* Add data-bs-theme="dark" to Modals or style manually */}

      {/* Add Complaint Modal */}
      <Modal show={showModal} onHide={closeModal} centered data-bs-theme="dark">
        <Modal.Header closeButton style={{backgroundColor:'#2C2C2C', color:'#FFFFFF', borderBottom: '1px solid #444'}}>
          <Modal.Title>Add New Complaint</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleComplaint}>
          <Modal.Body style={{backgroundColor:'#1E1E1E', color:'#E0E0E0'}}>
            <div className="mb-3">
                <label htmlFor="complaintTitle" className="form-label">Title:</label>
                <input
                    type="text" id="complaintTitle" required value={title}
                    onChange={(e) => settitle(e.target.value)}
                    placeholder="Brief title of the issue"
                    style={modalInputStyle} // Apply dark input style
                />
            </div>
            <div className="mb-3">
                <label htmlFor="complaintDesc" className="form-label">Description:</label>
                <textarea
                    id="complaintDesc" required value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of the problem"
                    rows={4}
                    style={modalTextAreaStyle} // Apply dark input style
                />
            </div>
            <div className="mb-3">
                <label htmlFor="imageUpload" className="form-label">Upload Image (Optional):</label>
                <input
                    type="file" id="imageUpload" accept="image/*"
                    onChange={(e) => setProofImage(e.target.files[0])}
                    className="form-control" // Use BS class, data-bs-theme should handle styling
                />
            </div>
          </Modal.Body>
          <Modal.Footer style={{backgroundColor:'#2C2C2C', borderTop: '1px solid #444'}}>
             <Button variant="secondary" onClick={closeModal}> Cancel </Button>
             <Button variant="primary" type="submit"> Submit Complaint </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Mess Menu Modal */}
      <Modal show={showMenu} onHide={closeMenu} size="lg" centered data-bs-theme="dark">
          <Modal.Header closeButton style={{backgroundColor:'#2C2C2C', color:'#FFFFFF', borderBottom: '1px solid #444'}}>
              <Modal.Title>Mess Menu</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{backgroundColor:'#1E1E1E', color:'#E0E0E0', textAlign: 'center'}}>
              <p style={{ marginBottom: '15px', fontSize: '1.1em' }}>
                  Mess Menu for {studentData.hostelName || "Your Hostel"}
              </p>
              {menu ? (
                  <img
                    src={menu}
                    alt="Mess Menu"
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#fff' }} // Added white BG for potentially transparent menu images
                    onError={(e) => { e.target.onerror = null; e.target.src=defaultProfilePic; e.target.alt="Menu image unavailable"; }}
                   />
              ) : (
                  <p className="text-secondary">Mess menu image is currently unavailable.</p>
              )}
          </Modal.Body>
          {/* Footer optional for menu */}
           <Modal.Footer style={{backgroundColor:'#2C2C2C', borderTop: '1px solid #444'}}>
             <Button variant="secondary" onClick={closeMenu}> Close </Button>
          </Modal.Footer>
      </Modal>

      {/* Feedback Modal */}
      <Modal show={showFeedBack} onHide={closeFeedback} centered data-bs-theme="dark">
          <Modal.Header closeButton style={{backgroundColor:'#2C2C2C', color:'#FFFFFF', borderBottom: '1px solid #444'}}>
              <Modal.Title>Provide Mess Feedback</Modal.Title>
          </Modal.Header>
          <form onSubmit={handleFeedback}>
              <Modal.Body style={{backgroundColor:'#1E1E1E', color:'#E0E0E0'}}>
                   {/* Using Box for spacing and Typography for labels */}
                  <Box mb={2}>
                      <Typography component="legend" color="inherit">Morning Breakfast:</Typography>
                      <StyledRating
                          name="morning" value={morningRating}
                          onChange={(event, newValue) => { setMorningRating(newValue === null ? 0 : newValue); }}
                          icon={<StarIcon fontSize="inherit" />} emptyIcon={<StarBorderIcon fontSize="inherit" />}
                      />
                  </Box>
                  <Box mb={2}>
                      <Typography component="legend" color="inherit">Lunch:</Typography>
                      <StyledRating
                           name="lunch" value={lunchRating}
                           onChange={(event, newValue) => { setLunchRating(newValue === null ? 0 : newValue); }}
                           icon={<StarIcon fontSize="inherit" />} emptyIcon={<StarBorderIcon fontSize="inherit" />}
                      />
                  </Box>
                   <Box mb={2}>
                      <Typography component="legend" color="inherit">Evening Snacks:</Typography>
                       <StyledRating
                           name="evening" value={eveningRating}
                           onChange={(event, newValue) => { setEveningRating(newValue === null ? 0 : newValue); }}
                           icon={<StarIcon fontSize="inherit" />} emptyIcon={<StarBorderIcon fontSize="inherit" />}
                       />
                   </Box>
                   <Box mb={2}>
                      <Typography component="legend" color="inherit">Dinner:</Typography>
                       <StyledRating
                           name="dinner" value={dinnerRating}
                           onChange={(event, newValue) => { setDinnerRating(newValue === null ? 0 : newValue); }}
                           icon={<StarIcon fontSize="inherit" />} emptyIcon={<StarBorderIcon fontSize="inherit" />}
                       />
                   </Box>
              </Modal.Body>
              <Modal.Footer style={{backgroundColor:'#2C2C2C', borderTop: '1px solid #444'}}>
                  <Button variant="secondary" onClick={closeFeedback}> Cancel </Button>
                  <Button variant="primary" type="submit"> Submit Feedback </Button>
              </Modal.Footer>
          </form>
      </Modal>

      {/* Payment Modal */}
       <Modal show={ShowPayment} onHide={closePayment} centered data-bs-theme="dark">
         <Modal.Header closeButton style={{backgroundColor:'#2C2C2C', color:'#FFFFFF', borderBottom: '1px solid #444'}}>
           <Modal.Title>Make Mess Fee Payment</Modal.Title>
         </Modal.Header>
         <form onSubmit={handlePayment}>
           <Modal.Body style={{backgroundColor:'#1E1E1E', color:'#E0E0E0'}}>
             <div className="mb-3">
                 <label htmlFor="paymentAmount" className="form-label">Amount (INR):</label>
                 <input
                     type="number" id="paymentAmount" required min="1" step="0.01"
                     onChange={(e) => setAmount(parseFloat(e.target.value))}
                     placeholder="Enter amount to pay"
                     style={modalInputStyle} // Apply dark input style
                 />
             </div>
           </Modal.Body>
           <Modal.Footer style={{backgroundColor:'#2C2C2C', borderTop: '1px solid #444'}}>
             <Button variant="secondary" onClick={closePayment}> Cancel </Button>
             <Button variant="success" type="submit"> Proceed to Pay </Button>
           </Modal.Footer>
         </form>
       </Modal>

      {/* See Bill Modal */}
       <Modal show={ShowBill} onHide={closeBill} centered size="lg" data-bs-theme="dark">
         <Modal.Header closeButton style={{ backgroundColor: '#2C2C2C', color: '#FFFFFF', borderBottom: '1px solid #444' }}>
           <Modal.Title>View Hostel Bills</Modal.Title>
         </Modal.Header>
         <Modal.Body style={{backgroundColor:'#1E1E1E', color:'#E0E0E0'}}>
           <form onSubmit={handleBills}>
              {/* Styling the date selection part for dark theme */}
              <div className="d-flex justify-content-center align-items-center gap-3 mb-3 p-3 rounded" style={{backgroundColor: '#2C2C2C', border: '1px solid #444'}}>
                 <label htmlFor="billDate" className="form-label mb-0">Select Date:</label>
                 <input
                   type="date" id="billDate" required value={date}
                   onChange={e => setDate(e.target.value)}
                   className="form-control" // BS class should adapt via data-bs-theme
                   style={{maxWidth: '200px', filter: 'invert(1) hue-rotate(180deg)'}} // Quick invert filter for date picker appearance
                 />
                 <Button variant="primary" type="submit">Show Bills</Button>
              </div>
            </form>

           {/* Bill Display Area */}
           <div style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
             {bills.length > 0 ? (
               bills.map((bill, index) => (
                 <div key={bill._id || index} style={{ padding: '15px', backgroundColor: '#2C2C2C', marginBottom: '10px', borderRadius: '5px', border: '1px solid #444' }}>
                   <p><strong>Amount:</strong> ₹{bill.amount ? bill.amount.toFixed(2) : 'N/A'}</p>
                   <p><strong>Date:</strong> {bill.date ? new Date(bill.date).toLocaleDateString() : 'N/A'}</p>
                   <p><strong>Item/Reason:</strong> {bill.description || 'N/A'}</p>
                   {bill.image_url && (
                       <p><strong>Receipt:</strong> <a href={bill.image_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info">View Image</a></p> // Using outline-info
                   )}
                 </div>
               ))
             ) : (
                date && <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No bills found for the selected date.</p> // Lighter gray for empty message
             )}
           </div>
         </Modal.Body>
         <Modal.Footer style={{backgroundColor:'#2C2C2C', borderTop: '1px solid #444'}}>
             <Button variant="secondary" onClick={closeBill}> Close </Button>
         </Modal.Footer>
       </Modal>

      {/* Ensure Footer is styled for dark theme */}
      <Footer />
    </div>
  );
};

export default Dashboard;