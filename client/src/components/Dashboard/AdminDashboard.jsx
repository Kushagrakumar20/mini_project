import React, { useEffect, useState } from "react";
import { Button, Modal, Card } from "react-bootstrap"; // Added Card for explicit styling
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Error from "../Error"; // NOTE: This component needs theme update
import Footer from "../Footer"; // NOTE: This component needs theme update
// import defaultProfilePic from "../../images/user.png"; // Unused import
import { toast } from "react-toastify";
import { create_warden } from "../../redux/wardenSlice"; // Assuming get_unassigned_wardens is used elsewhere or needed later
import { get_hostels_data } from "../../redux/hostelSlice";

// Default styles for dark mode inputs
const darkInputStyle = {
  border: "none",
  borderBottom: "2px solid #666", // Lighter gray border for dark background
  backgroundColor: "#333", // Dark background for input
  color: "#fff", // White text
  outline: "none",
  width: "100%",
  marginBottom: "15px", // Increased spacing
  padding: "8px 5px", // Added padding
  borderRadius: '4px' // Slightly rounded corners
};

// Default styles for dark mode select dropdown
const darkSelectStyle = {
    ...darkInputStyle, // Inherit base styles
    appearance: 'none', // Remove default browser appearance
    backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`, // White dropdown arrow
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight: '30px' // Make space for the arrow
};

const AdminDashboard = () => {
  // --- State Variables ---
  const [showWardenPopup, setshowWardenPopup] = useState(false);
  const [showHostelPopup, setshowHostelPopup] = useState(false);
  // const [HostelList, setHostelList] = useState(true); // Unused state
  // const [unassignedWardensClicked, setUnassignedWardensClicked] = useState(false); // Unused state
  const [hostelsClicked, setHostelsClicked] = useState(true); // Default to show hostels
  // const [selectedHostel, setSelectedHostel] = useState(null); // Unused state

  // Warden Form State
  const [wardenName, setWardenName] = useState('');
  const [wardenEmail, setWardenEmail] = useState('');
  const [wardenRecoveryEmail, setWardenRecoveryEmail] = useState('');

  // Hostel Form State
  const [hostelWardenEmail, setHostelWardenEmail] = useState(''); // Email selected/entered for the new hostel
  const [hostelName, setHostelName] = useState('');

  // Data from Redux
  const chiefWardenData = useSelector((state) => state.chiefwardens);
  const allHostelData = useSelector((state) => state.hostels.hostels || []); // Default to empty array
  const wardenOptions = useSelector((state) => state.wardens.unassignedWardens || []); // Assuming unassigned wardens are fetched elsewhere
  const isAuthenticatedChiefWarden = useSelector((state) => state.chiefwardens.token !== null);
  // const complaints = useSelector((state) => state.complaints); // Unused selector

  const dispatch = useDispatch();
  const authToken = localStorage.getItem('token'); // Get token once

  // --- Effects ---

  // Fetch initial hostel data on mount
  useEffect(() => {
    if (isAuthenticatedChiefWarden) {
        // Set auth token for subsequent requests
        axios.defaults.headers.common['Authorization'] = authToken;
        dispatch(get_hostels_data());
        // TODO: Dispatch action to fetch unassigned wardens if needed for the dropdown
        // dispatch(get_unassigned_wardens());
    }
  }, [dispatch, isAuthenticatedChiefWarden, authToken]);


  // --- Event Handlers ---

  // Warden Registration
  const registerWarden = (e) => {
    e.preventDefault();
    // Basic validation
    if (!wardenName || !wardenEmail || !wardenRecoveryEmail) {
        toast.warn("Please fill in all warden details.");
        return;
    }
    axios.post(`${process.env.REACT_APP_BACK_END_URL}/chiefWarden/registerWarden`, {
      name: wardenName,
      email: wardenEmail,
      recoveryEmail: wardenRecoveryEmail,
    })
    .then((res) => {
      // console.log(res);
      if (res.data.status === 200) { // Check for success status from *your* backend logic
        toast.success("Warden registered successfully!");
        dispatch(create_warden({ // Dispatch action with registered data (adjust payload as needed)
          name: wardenName,
          email: wardenEmail,
          recoveryEmail: wardenRecoveryEmail,
          // Potentially add ID or other data from response if available: res.data.data.wardenId
        }));
        // Clear form and close popup
        setWardenName('');
        setWardenEmail('');
        setWardenRecoveryEmail('');
        closeWardenPopup();
        // TODO: Optionally re-fetch unassigned wardens list if needed
      } else {
         toast.error(res.data.message || "Warden registration failed.");
      }
    })
    .catch((err) => {
      // console.error("Warden Registration Error:", err);
      toast.error(err.response?.data?.message || "Cannot register the warden. Please try again.");
    });
  };

  // Hostel Registration
  const registerHostel = (e) => {
    e.preventDefault();
     // Basic validation
    if (!hostelName || !hostelWardenEmail) {
        toast.warn("Please provide hostel name and select a warden.");
        return;
    }
    axios.post(`${process.env.REACT_APP_BACK_END_URL}/chiefWarden/registerHostel`, {
      hostelName,
      warden: hostelWardenEmail, // Send selected warden email
      messMenu: "demo", // Default or leave empty? Consider if this should be set later
    })
    .then((res) => {
       if (res.data.status === 200) { // Check for success status
            toast.success("Hostel registered successfully!");
            // Clear form and close popup
            setHostelName('');
            setHostelWardenEmail('');
            closeHostelPopup();
            // Re-fetch hostel list to show the new one
            dispatch(get_hostels_data());
            // TODO: Optionally re-fetch unassigned wardens if the assigned one should be removed from the list
       } else {
           toast.error(res.data.message || "Hostel registration failed.");
       }
    })
    .catch((err) => {
      // console.error("Hostel Registration Error:", err);
      toast.error(err.response?.data?.message || "Cannot register the hostel. Please try again.");
    });
  };

  // Toggle visibility handlers (if needed later)
  // const openUnassignedWardens = () => {
  //   setUnassignedWardensClicked(true);
  //   setHostelsClicked(false);
  // };
  // const openHostels = () => {
  //   setHostelsClicked(true);
  //   setUnassignedWardensClicked(false);
  //   // Optionally dispatch fetch hostels here if not done in useEffect
  //   // dispatch(get_hostels_data());
  // };

  // Popup handlers
  const openWardenPopup = () => setshowWardenPopup(true);
  const closeWardenPopup = () => {
      setshowWardenPopup(false);
      // Reset form fields on close
      setWardenName('');
      setWardenEmail('');
      setWardenRecoveryEmail('');
  }

  const openHostelPopup = () => setshowHostelPopup(true);
  const closeHostelPopup = () => {
      setshowHostelPopup(false);
      // Reset form fields on close
      setHostelName('');
      setHostelWardenEmail('');
  }

  // --- Styles ---
  const pageStyle = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#000000", // Black background
    color: "#ffffff", // White text
  };

  const headingStyle = {
    backgroundColor: "rgba(50, 50, 50, 0.7)", // Darker semi-transparent background
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #444", // Subtle border
    color: "#ffffff", // Ensure text is white
  };

  // --- Render Logic ---

  // Redirect or show error if not authenticated
  if (!authToken || !isAuthenticatedChiefWarden) {
    // Consider using useNavigate() hook from react-router-dom for redirection
    // return <Navigate to="/login" />; // Example redirection
    return <Error message="Access Denied. Please log in as Chief Warden." />; // Show error component
  }

  // Main component render
  return (
    <div style={pageStyle}>
      {/* Header Info */}
      <div className="container mt-5" style={headingStyle}>
        <div className="row">
          <div className="col-md-12"> {/* Full width on medium screens */}
            <span style={{ fontSize: '1.1rem' }}> {/* Slightly smaller font */}
                Chief Warden Email: {chiefWardenData.email || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="container mt-4">
        <div className="row justify-content-center"> {/* Center buttons */}
           {/* Button to toggle Hostel view (optional) */}
          {/* <div className="col-auto p-1">
             <button
                id="hostelButton"
                className={`btn ${hostelsClicked ? 'btn-light' : 'btn-outline-light'} m-1`} // Highlight active view
                onClick={openHostels}
              >
                Hostels
              </button>
           </div> */}
          <div className="col-auto p-1">
            <button className="btn btn-outline-light m-1" onClick={openWardenPopup}>
              Add Warden
            </button>
          </div>
          <div className="col-auto p-1">
            <button className="btn btn-outline-light m-1" onClick={openHostelPopup}>
              Add Hostel
            </button>
          </div>
           {/* Button to toggle Unassigned Wardens view (optional) */}
          {/* <div className="col-auto p-1">
             <button
                className={`btn ${unassignedWardensClicked ? 'btn-light' : 'btn-outline-light'} m-1`} // Highlight active view
                onClick={openUnassignedWardens}
             >
                Unassigned Wardens
             </button>
          </div> */}
        </div>
      </div>


      {/* Hostel List Display */}
      {hostelsClicked && (
        <div className="container mt-4 mb-5 flex-grow-1"> {/* Added mb-5 and flex-grow-1 */}
          <h4 style={{ borderBottom: '1px solid #555', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Registered Hostels
          </h4>
          {allHostelData.length === 0 ? (
            <p>No hostels registered yet.</p>
          ) : (
            <div className="row">
              {allHostelData.map((hostel, index) => (
                <div key={hostel._id || index} className="col-md-6 mb-3"> {/* Use unique ID if available */}
                   <Card bg="dark" text="white" className="h-100"> {/* Dark card, ensure full height */}
                     <Card.Body>
                       <Card.Title>
                         {/* Handle potential object data safely */}
                         {typeof hostel.hostelName === 'object' ? JSON.stringify(hostel.hostelName) : hostel.hostelName || "Unnamed Hostel"}
                       </Card.Title>
                       <Card.Text>
                         Warden: {typeof hostel.warden === 'object' ? JSON.stringify(hostel.warden) : hostel.warden || "Not Assigned"}
                       </Card.Text>
                       <Card.Text>
                         Mess Menu:
                         {typeof hostel.messMenu === 'string' && hostel.messMenu.startsWith('http') ? ( // Check if it's a likely URL
                           <a
                             href={hostel.messMenu}
                             target="_blank"
                             rel="noopener noreferrer"
                             style={{ marginLeft: '10px' }}
                             title="View Mess Menu"
                           >
                             <img
                               src={hostel.messMenu}
                               alt="Mess Menu Thumbnail"
                               style={{ width: '80px', height: 'auto', objectFit: 'cover', cursor: 'pointer', border: '1px solid #555', borderRadius: '4px' }}
                               onError={(e) => { e.target.style.display = 'none'; /* Hide if image fails */ }}
                             />
                           </a>
                         ) : (
                           <span style={{ fontStyle: 'italic', color: '#aaa' }}>
                             &nbsp;Not Available
                           </span>
                         )}
                       </Card.Text>
                        {/* Add more details or actions here if needed */}
                     </Card.Body>
                   </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Placeholder for Unassigned Wardens (if feature is enabled) */}
      {/* {unassignedWardensClicked && (
        <div className="container mt-3">
          <h4>Unassigned Wardens</h4>
          <p>List of unassigned wardens would go here.</p>
           // Map through unassignedWardens data here
        </div>
      )} */}


      {/* --- Modals --- */}

      {/* Add Warden Modal */}
      <Modal show={showWardenPopup} onHide={closeWardenPopup} centered>
        <form onSubmit={registerWarden}>
          <Modal.Header closeButton style={{ backgroundColor: '#222', color: '#fff', borderBottom: '1px solid #444' }}>
            <Modal.Title>Add New Warden</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: '#333', color: '#fff' }}>
            <label htmlFor="wardenEmail" className="form-label">Warden Email:</label>
            <input
              id="wardenEmail"
              type="email"
              placeholder="Enter warden's email"
              style={darkInputStyle}
              required
              value={wardenEmail}
              onChange={(e) => setWardenEmail(e.target.value)}
            />
            <label htmlFor="wardenRecoveryEmail" className="form-label">Recovery Email:</label>
            <input
              id="wardenRecoveryEmail"
              type="email"
              placeholder="Enter recovery email"
              style={darkInputStyle}
              required
               value={wardenRecoveryEmail}
              onChange={(e) => setWardenRecoveryEmail(e.target.value)}
            />
             <label htmlFor="wardenName" className="form-label">Warden Name:</label>
            <input
              id="wardenName"
              type="text"
              placeholder="Enter warden's full name"
              style={darkInputStyle}
              required
              value={wardenName}
              onChange={(e) => setWardenName(e.target.value)}
            />
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: '#222', color: '#fff', borderTop: '1px solid #444' }}>
             <Button variant="secondary" onClick={closeWardenPopup}>Cancel</Button>
            <Button variant="light" type="submit"> {/* Use light button for primary action on dark */}
              Register Warden
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Add Hostel Modal */}
      <Modal show={showHostelPopup} onHide={closeHostelPopup} centered>
        <form onSubmit={registerHostel}>
          <Modal.Header closeButton style={{ backgroundColor: '#222', color: '#fff', borderBottom: '1px solid #444' }}>
            <Modal.Title>Add New Hostel</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: '#333', color: '#fff' }}>
             <label htmlFor="hostelName" className="form-label">Hostel Name:</label>
            <input
              id="hostelName"
              type="text"
              placeholder="Enter new hostel name"
              style={darkInputStyle}
              required
              value={hostelName}
              onChange={(e) => setHostelName(e.target.value)}
            />
             <label htmlFor="hostelWardenEmail" className="form-label">Assign Warden:</label>
             {/* Option 1: Input field for warden email */}
             {/* <input
               id="hostelWardenEmail"
               type="email"
               placeholder="Enter assigned warden's email"
               style={darkInputStyle}
               required
               value={hostelWardenEmail}
               onChange={(e) => setHostelWardenEmail(e.target.value)}
             /> */}

             {/* Option 2: Dropdown for selecting unassigned warden (Requires wardenOptions state to be populated) */}
             <select
                id="hostelWardenEmail"
                value={hostelWardenEmail}
                onChange={(e) => setHostelWardenEmail(e.target.value)}
                style={darkSelectStyle} // Apply dark style
                required
             >
                <option value="" disabled style={{color: '#888'}}>-- Select an available Warden --</option>
                {wardenOptions && wardenOptions.length > 0 ? (
                    wardenOptions.map((warden) => (
                    <option key={warden._id || warden.email} value={warden.email} style={{backgroundColor: '#333', color: '#fff'}}>
                        {warden.name} ({warden.email})
                    </option>
                    ))
                ) : (
                    <option value="" disabled style={{color: '#888'}}>No unassigned wardens found</option>
                )}
             </select>

          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: '#222', color: '#fff', borderTop: '1px solid #444' }}>
             <Button variant="secondary" onClick={closeHostelPopup}>Cancel</Button>
            <Button variant="light" type="submit"> {/* Use light button */}
              Register Hostel
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Footer */}
      <Footer /> {/* Ensure Footer component also supports dark theme */}
    </div>
  );
};

export default AdminDashboard;
