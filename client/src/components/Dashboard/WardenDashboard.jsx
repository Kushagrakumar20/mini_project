import React, { useEffect, useRef, useState } from 'react';
import defaultProfilePic from '../../images/user.png';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { get_all_complaints } from '../../redux/complaintSlice'; // Assuming add_complaint, get_my_complaints might be used elsewhere or needed later
import { change_in_image_dash, menu_uploaded } from '../../redux/wardenSlice';
import axios from 'axios';
// import Error from '../Error'; // Uncomment if needed
import Complaintcard from '../Complaintcard'; // NOTE: This component needs theme update
import { toast } from 'react-toastify';
// import { Typography } from '@mui/material'; // Unused import
// import { blueGrey } from '@mui/material/colors'; // Unused import
import Char from '../Char'; // NOTE: This component needs theme update
import '../../css/dashboard.css'; // NOTE: Check this CSS for conflicting styles (backgrounds, colors)
import Footer from '../Footer'; // NOTE: This component needs theme update


const WardenDashboard = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [updateMenu, setUpdateMenu] = useState(false);
  const [messMenuImageUrl, setMessMenuImageUrl] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const wardenData = useSelector((state) => state.wardens);
  const [showAllComplaints] = useState(true); // Removed setShowAllComplaints as it wasn't used
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [profilePic, setProfilePic] = useState(defaultProfilePic);
  const fileInputRef = useRef(null);

  const allComplaints = useSelector((state) => state.complaints.complaints);
  const authToken = localStorage.getItem('token'); // Get token once
  const dispatch = useDispatch();

  // Set default auth token for axios requests
  axios.defaults.headers.common['Authorization'] = authToken;

  const fetchComplaintData = () => {
    // No need to get token again, it's set in defaults
    axios
      .get(`${process.env.REACT_APP_BACK_END_URL}/warden/dashboard`)
      .then((response) => {
        if (response.data.data.profileImg) {
          dispatch(
            change_in_image_dash({
              image: response.data.data.profileImg,
            })
          );
          setProfilePic(response.data.data.profileImg);
        } else {
            setProfilePic(defaultProfilePic); // Reset to default if no image comes from backend
        }
        dispatch(
          get_all_complaints({
            complaints: response.data.data.complaints || [], // Ensure complaints is always an array
          })
        );
      })
      .catch((err) => {
        // console.error("Fetch Complaint Error:", err); // Log error for debugging
        // toast.error("Failed to fetch dashboard data."); // User-friendly error
      });
  };


  useEffect(() => {
    fetchComplaintData(); // Initial fetch
    const intervalId = setInterval(fetchComplaintData, 5000); // Fetch every 5 seconds (adjust as needed)
    return () => {
      clearInterval(intervalId); // Cleanup interval on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]); // Add dispatch to dependency array


  // State for Update Menu Modal
  const [file, setFile] = useState(null); // Use null as initial state for file
  const [isLoading, setIsLoading] = useState(false);

  // Menu updatation
  const uploadImg = (e) => {
    e.preventDefault();
    if (!file) {
       toast.warn('Please select an image file first.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    // 1. Upload image file
    axios.post(`${process.env.REACT_APP_BACK_END_URL}/fileUpload/`, formData)
      .then(res => {
        if (res.data.status === 200 && res.data.data.url) {
           // 2. Update menu URL in warden data
          return axios.post(`${process.env.REACT_APP_BACK_END_URL}/warden/uploadMenu`, { menu_url: res.data.data.url });
        } else {
          throw new Error(res.data.message || 'File upload failed.');
        }
      })
      .then(res2 => {
        if (res2.data.status === 200) {
          dispatch(menu_uploaded(res2.data.menuUrl)); // Assuming backend returns the URL used
          setUpdateMenu(false);
          setFile(null); // Clear file input state
          toast.success('Menu updated successfully');
        } else {
          throw new Error(res2.data.message || 'Menu update failed.');
        }
      })
      .catch(err => {
        // console.error("Menu Upload Error:", err);
        toast.error(err.message || 'Menu update failed. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // State and handler for Feedback Modal
  const [feedBacks, setFeedBacks] = useState([]);
  const handleFetchFeedback = (e) => {
    e.preventDefault();
     setIsLoading(true); // Show loading state
    axios.post(`${process.env.REACT_APP_BACK_END_URL}/getFeedback`, { // Send dates in request body
      fromDate,
      toDate
    })
    .then(res => {
       if (res.data.status === 200) {
          setFeedBacks(res.data.data.feedbacks || []);
       } else {
           toast.error(res.data.message || "Could not fetch feedback.");
           setFeedBacks([]);
       }
    })
    .catch(err => {
        // console.error("Feedback Fetch Error:", err);
        toast.error("Error fetching feedback data.");
        setFeedBacks([]);
    })
    .finally(() => {
        setIsLoading(false); // Hide loading state
    });
  };

  // --- Page Styling ---
  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#000000', // Black background
    color: '#ffffff', // White text
    justifyContent: 'space-between',
  };

  const profilePicStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #555' // Add a subtle border
  };

  // Input field styling for dark mode
   const darkInputStyle = {
       backgroundColor: '#444',
       color: '#fff',
       border: '1px solid #666',
       padding: '0.375rem 0.75rem', // Mimic bootstrap padding
       borderRadius: '0.25rem' // Mimic bootstrap border radius
   };
   const darkFileInputStyle = { // Basic styling for file input button text color
       color: '#ccc' // Light grey color for the button text
   };


  // --- Modal Control Functions ---
  const openMenu = () => {
    setShowMenu(true);
    setIsLoading(true);
    axios.get(`${process.env.REACT_APP_BACK_END_URL}/warden/messMenu`)
      .then(res => {
        if (res.data.status === 200 && res.data.data.messMenu) {
          setMessMenuImageUrl(res.data.data.messMenu);
        } else {
          // console.log("Mess menu load info:", res.data.message);
          setMessMenuImageUrl(''); // Set to empty if not found or error
          toast.info(res.data.message || "Mess menu not available.");
        }
      })
      .catch(err => {
        // console.error("Mess Menu Fetch Error:", err);
        setMessMenuImageUrl('');
        toast.error("Could not load mess menu.");
      })
      .finally(() => {
         setIsLoading(false);
      });
  };
  const closeMenu = () => setShowMenu(false);
  const openFeedback = () => setShowFeedback(true);
  const closeFeedback = () => {
      setShowFeedback(false);
      setFeedBacks([]); // Clear feedbacks when closing modal
      // Reset dates if needed
      // setFromDate(new Date().toISOString().split('T')[0]);
      // setToDate(new Date().toISOString().split('T')[0]);
  }
  const openUpdateMenu = () => {
      setUpdateMenu(true);
      setFile(null); // Reset file state when opening modal
  }
  const closeUpdateMenu = () => setUpdateMenu(false);
  const openBill = () => {
      setShowBill(true);
      setBillFile(null); // Reset file state
      setBillAmount(""); // Reset amount state
  }
  const closeBill = () => setShowBill(false);

  // --- Bill Upload State and Function ---
  const [billAmount, setBillAmount] = useState("");
  const [billFile, setBillFile] = useState(null);

  const uploadBill = (e) => {
    e.preventDefault();
    if (!billFile || !billAmount) {
      toast.error("Please provide both bill amount and image file.");
      return;
    }
    // Basic validation for amount
    if (isNaN(billAmount) || Number(billAmount) <= 0) {
       toast.error("Please enter a valid positive bill amount.");
       return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', billFile);

    // 1. Upload bill image file
    axios.post(`${process.env.REACT_APP_BACK_END_URL}/fileUpload/`, formData)
      .then(res => {
         if (res.data.status === 200 && res.data.data.url) {
            const fileUrl = res.data.data.url;
            // 2. Send bill data (URL and amount) to backend
            const billData = {
              billFile: fileUrl,
              billAmount: Number(billAmount) // Ensure amount is sent as number
            };
            return axios.post(`${process.env.REACT_APP_BACK_END_URL}/warden/uploadBill`, billData); // No need for extra headers if defaults are set
         } else {
             throw new Error(res.data.message || "Bill file upload failed.");
         }
      })
      .then(response => {
          if (response.data.status === 200) {
              toast.success('Bill added successfully');
              setShowBill(false); // Close modal on success
          } else {
              throw new Error(response.data.message || "Failed to add bill.");
          }
      })
      .catch(err => {
        // console.error("Bill Upload Error:", err);
        toast.error(err.message || 'Error uploading bill. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // --- Profile Image Upload ---
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
        const imageFile = event.target.files[0];
        setIsLoading(true); // Indicate loading during upload
        const formData = new FormData();
        formData.append('file', imageFile);

        // 1. Upload profile image file
        axios.post(`${process.env.REACT_APP_BACK_END_URL}/fileUpload/`, formData)
            .then(res => {
                if (res.data.status === 200 && res.data.data.url) {
                    const newImage = res.data.data.url;
                    // 2. Update profile image URL in warden data
                    const prof_image = { image_url: newImage };
                    return axios.post(`${process.env.REACT_APP_BACK_END_URL}/warden/uploadFile`, prof_image);
                } else {
                    throw new Error(res.data.message || "Image upload failed.");
                }
            })
            .then(res => {
                if (res.data.status === 200) {
                    toast.success("Profile image updated successfully");
                    // Optionally trigger fetchComplaintData() again to refresh UI immediately
                    fetchComplaintData();
                } else {
                     throw new Error(res.data.message || "Failed to update profile image URL.");
                }
            })
            .catch(error => {
                // console.error("Profile Image Upload Error:", error);
                toast.error(error.message || "Failed to upload image. Please try again.");
            })
             .finally(() => {
                setIsLoading(false);
            });
    } else {
        toast.warn("No file selected or file input cancelled.");
    }
     // Reset file input visually
     if(fileInputRef.current) {
       fileInputRef.current.value = "";
     }
  };

  // --- Render Logic ---
  const complaintsToDisplay = allComplaints?.complaints || []; // Use optional chaining and default to empty array


  return (
    <div style={pageStyle}>
      <div className="container mt-5 warden-container"> {/* Check warden-container styles in CSS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {/* Profile Section */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="profile-pic-container" onClick={handleImageClick} style={{cursor: 'pointer'}}>
              <img
                src={profilePic}
                alt="Profile"
                style={profilePicStyle}
                onError={(e) => { e.target.onerror = null; e.target.src = defaultProfilePic; }} // Fallback for broken image links
              />
              <div className="overlay-update-warden">Edit</div> {/* Check overlay styles in CSS */}
              <input
                type="file"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>
            <h3 className='ward-text ms-3'>Warden: {wardenData.name || 'N/A'}</h3> {/* Check ward-text styles */}
          </div>
          {/* Hostel Section */}
          <div className='hostel_name text-end' style={{ marginBottom: '1rem' }}> {/* Check hostel_name styles */}
            <h2 className='ward-text fs-5'>Hostel:</h2> {/* Adjusted font size */}
            <h3 className='ward-text fs-4'>{wardenData.hostel || 'N/A'}</h3> {/* Adjusted font size */}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="container mb-4">
        <div className="row justify-content-center"> {/* Centered buttons */}
          <div className="col-auto p-1">
            <button className='btn btn-outline-light m-1' onClick={openMenu}>View Mess Menu</button>
          </div>
          <div className="col-auto p-1">
             <button className='btn btn-outline-light m-1' onClick={openUpdateMenu}>Update Mess Menu</button>
           </div>
          <div className="col-auto p-1">
            <button className='btn btn-outline-light m-1' onClick={openFeedback}>Feedbacks</button>
          </div>
          <div className="col-auto p-1">
             <button className='btn btn-outline-light m-1' onClick={openBill}>Add Bill</button>
          </div>
        </div>
      </div>

      {/* Complaints Section */}
      <div className="container mb-5 flex-grow-1">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
          <p style={{ fontWeight: 500, fontSize: '1.25rem', borderBottom: '1px solid white', paddingBottom: '0.25rem' }}>All Complaints</p>
        </div>
        <div className="row">
          {complaintsToDisplay.length > 0 ? (
            complaintsToDisplay.map((complaint) => ( // Use complaint._id or another unique key if available
              <div key={complaint._id || complaint.title + complaint.createdAt} className="col-md-6 mb-3">
                 {/* Pass necessary props, ensure Complaintcard handles dark theme */}
                <Complaintcard complaint={complaint} /* Pass other needed props like allComplaints if card uses it */ />
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p>No complaints to display at the moment.</p>
             </div>
          )}
        </div>
      </div>

      {/* --- Modals --- */}

      {/* View Mess Menu Modal */}
      <Modal show={showMenu} onHide={closeMenu} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#222', color: '#fff', borderBottom: '1px solid #444' }}>
          <Modal.Title>Mess Menu</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#333', color: '#fff' }}>
          {isLoading ? (
              <div className="text-center"><Spinner animation="border" variant="light" /></div>
          ) : messMenuImageUrl ? (
               <img src={messMenuImageUrl} alt="Mess Menu" style={{ width: '100%', height: 'auto' }} />
           ) : (
               <p>No mess menu image available.</p>
           )}
        </Modal.Body>
         <Modal.Footer style={{ backgroundColor: '#222', color: '#fff', borderTop: '1px solid #444' }}>
            <Button variant="secondary" onClick={closeMenu}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Update Mess Menu Modal */}
      <Modal show={updateMenu} onHide={closeUpdateMenu} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#222', color: '#fff', borderBottom: '1px solid #444' }}>
          <Modal.Title>Update Mess Menu</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#333', color: '#fff' }}>
          <label htmlFor="menu-file-input" className="form-label">Upload image of new mess menu:</label>
          <input
                id="menu-file-input"
                className="form-control" // Use bootstrap class for consistency
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                style={darkInputStyle} // Apply dark style
           />
          {file && <p className="mt-2 text-muted">Selected: {file.name}</p>}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#222', color: '#fff', borderTop: '1px solid #444' }}>
          <Button variant="secondary" onClick={closeUpdateMenu} disabled={isLoading}>Cancel</Button>
           <Button variant="light" disabled={isLoading || !file} onClick={uploadImg}>
            {isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Updating...</> : 'Update'}
           </Button>
        </Modal.Footer>
      </Modal>

      {/* Feedback Modal */}
      <Modal show={showFeedback} onHide={closeFeedback} centered size="lg"> {/* Larger modal for chart */}
        <form onSubmit={handleFetchFeedback}>
          <Modal.Header closeButton style={{ backgroundColor: '#222', color: '#fff', borderBottom: '1px solid #444' }}>
            <Modal.Title style={{ fontSize: '1.2rem' }}>Daily Ratings</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: '#333', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <label htmlFor="fromDate" className="form-label mb-0">From:</label>
              <input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                style={darkInputStyle} // Apply dark style
                className="form-control" // Bootstrap class
                style={{maxWidth: '150px'}} // Limit width
              />
              <label htmlFor="toDate" className="form-label mb-0">To:</label>
              <input
                id="toDate"
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                style={darkInputStyle} // Apply dark style
                className="form-control" // Bootstrap class
                style={{maxWidth: '150px'}} // Limit width
                min={fromDate} // Prevent ToDate from being before FromDate
               />
                 <Button type="submit" variant="light" disabled={isLoading} size="sm">
                    {isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Loading...</> : 'Show Ratings'}
                 </Button>
            </div>
            <hr style={{borderColor: '#555'}}/>
             {/* Ensure Char component can handle dark theme or pass props */}
            <Char feedbacks={feedBacks} />
          </Modal.Body>
           <Modal.Footer style={{ backgroundColor: '#222', color: '#fff', borderTop: '1px solid #444' }}>
            <Button variant="secondary" onClick={closeFeedback}>Close</Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Add Bill Modal */}
      <Modal show={showBill} onHide={closeBill} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#222', color: '#fff', borderBottom: '1px solid #444' }}>
          <Modal.Title>Add Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#333', color: '#fff' }}>
          <form onSubmit={uploadBill}>
            <div className="mb-3">
                 <label htmlFor="billAmount" className="form-label">Bill Amount:</label>
                 <input
                    id="billAmount"
                    type="number"
                    value={billAmount}
                    onChange={e => setBillAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="form-control" // Bootstrap class
                    style={darkInputStyle} // Apply dark style
                    min="0.01" // Minimum amount
                    step="0.01" // Allow decimals
                 />
            </div>
             <div className="mb-3">
                <label htmlFor="billFile" className="form-label">Upload Bill Image/PDF:</label>
                 <input
                    id="billFile"
                    type="file"
                    accept="image/*,application/pdf" // Accept images and PDF
                    onChange={e => setBillFile(e.target.files[0])}
                    className="form-control" // Bootstrap class
                    style={darkInputStyle} // Apply dark style
                 />
                 {billFile && <p className="mt-2 text-muted">Selected: {billFile.name}</p>}
             </div>
            <Modal.Footer style={{ backgroundColor: '#333', color: '#fff', borderTop: '1px solid #555', padding: '0.75rem 0 0 0' }}> {/* Adjust padding */}
                 <Button variant="secondary" onClick={closeBill} disabled={isLoading}>Cancel</Button>
                 <Button variant="light" type="submit" disabled={isLoading || !billFile || !billAmount}>
                    {isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Adding...</> : 'Add Bill'}
                 </Button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>

      {/* Footer Component (Ensure it also adapts to dark theme) */}
      <Footer />
    </div>
  );
};

export default WardenDashboard;