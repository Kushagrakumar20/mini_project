import React, { useState } from "react";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WardenLogin from "./WardenLogin";          // Assuming these components exist
import ChiefWardenLogin from "./ChiefWardenLogin"; // Assuming these components exist
import AccountantLogin from "./AccountantLogin";   // Assuming these components exist

function AdminLogin() {
  const [values, setValues] = useState({
    userId: "",
    password: "",
  });

  const [selectedTab, setSelectedTab] = useState("Warden");

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark", // Keeps the toast notifications dark themed
  };

  // Basic validation (unchanged, but could be part of handleSubmit logic instead)
  const handleValidation = () => {
    const { password } = values;

    if (password.length < 8) {
      toast.error("Password should be at least 8 characters.", toastOptions);
      return false;
    }
    return true;
  };

  // Form submission handler (unchanged logic)
  const handleSubmit = (event) => {
    event.preventDefault();
    if (handleValidation()) {
        // Add your actual login logic here based on selectedTab
        console.log(`Attempting login for ${selectedTab} with:`, values);
        // Example: Call an API
    }
  };


  const handlechange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  // Renders the appropriate login form based on the selected tab
  const renderSelectedTab = () => {
    // NOTE: The child components (WardenLogin, etc.) might also need
    // their internal styles updated to match the black/white theme.
    switch (selectedTab) {
      case "Warden":
        return <WardenLogin values={values} handlechange={handlechange} handleSubmit={handleSubmit} />;
      case "ChiefWarden":
        return <ChiefWardenLogin values={values} handlechange={handlechange} handleSubmit={handleSubmit} />;
      case "Accountant":
        return <AccountantLogin values={values} handlechange={handlechange} handleSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Tab Navigation */}
      <TabsContainer>
        <Tab
          onClick={() => setSelectedTab("Warden")}
          isActive={selectedTab === "Warden"} // Pass active state
        >
          Warden Login
        </Tab>
        <Tab
          onClick={() => setSelectedTab("ChiefWarden")}
          isActive={selectedTab === "ChiefWarden"} // Pass active state
        >
          Chief Warden Login
        </Tab>
        <Tab
          onClick={() => setSelectedTab("Accountant")}
          isActive={selectedTab === "Accountant"} // Pass active state
        >
          Accountant Login
        </Tab>
      </TabsContainer>

      {/* Rendered Login Form Area */}
      {renderSelectedTab()}

      {/* Toast Notifications Container */}
      <ToastContainer />
    </>
  );
}

// Styled component for the container holding the tabs
const TabsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  background-color: #000000; /* Black background */
  padding: 1rem;
  font-weight: bold;
  border-bottom: 1px solid #444; /* Optional border */
`;

// Styled component for individual tabs
// It now accepts an `isActive` prop to change styles
const Tab = styled.div`
  cursor: pointer;
  /* Dynamically set background and text color based on isActive prop */
  color: ${(props) => (props.isActive ? '#000000' : '#ffffff')}; /* Black text if active, White text if inactive */
  background-color: ${(props) => (props.isActive ? '#ffffff' : '#333333')}; /* White background if active, Dark gray if inactive */
  font-size: 1.2rem;
  padding: 0.8rem 1.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.3s, color 0.3s; /* Smooth transition for color and background */
  text-align: center;

  &:hover {
     /* Slightly lighter gray on hover for inactive tabs, slightly darker white for active tab */
    background-color: ${(props) => (props.isActive ? '#eeeeee' : '#555555')};
    /* Keep text color consistent on hover based on active state */
    color: ${(props) => (props.isActive ? '#000000' : '#ffffff')};
  }
`;

export default AdminLogin;