import React, { useState, useEffect }from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
// import Logo from "../assets/logo.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { redirect_to_dashboard,logoutWarden } from "../../redux/wardenSlice";
import Footer from "../Footer";

function WardenLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.wardens.token !== null);

  // useSelector((state)=>{
  //   console.log(state);
  // })

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    axios.post(`${process.env.REACT_APP_BACK_END_URL}/warden/login`, {
      email,
      password,
    })
      .then((res) => {

        if(res.data.status===200){
          console.log(res);
          const token = res.data.data.token;
          const name = res.data.data.warden.name;
          const hostel = res.data.data.warden.hostelName;
          console.log("Token is : "+token);
          localStorage.setItem('token', token);
          axios.defaults.headers.common['authorization'] = `${token}`;
          console.log(token)
          dispatch(redirect_to_dashboard({
            email : email,
            token: token,
            name: name,
            hostel: hostel,
          }));
        }
        navigate("/warden");
      })
      .catch((err) => {
        if (
          err.response &&
          err.response.data &&
          err.response.data.message === 'password mismatch'
        ) {
          toast.error('Password mismatch. Please check your credentials and try again.');
        } else {
          toast.error('Login failed. Wrong credentials!');
        }
      });
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logoutWarden());
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div>
         <FormContainer>
          <form onSubmit={handleLogin}>
            <div className="brand">
              <h3 style={{color : "skyblue"}}>WARDEN LOGIN</h3>
            </div>
            <input
              type="text"
              placeholder="Email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
        
      </FormContainer>
      <ToastContainer />
      <Footer/>
    </div>
  )
}


const FormContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  background-color: #2C2C2C;
  overflow: hidden;
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    h3 {
      color: yellow;
      text-transform: uppercase;
    }
  }
  form {
    width: 45%;
    height: 100%;
    margin-top: 4rem;
    margin-bottom: 4rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: #00000076;
    border-radius: 2rem;
    padding: 2rem 7rem;
    padding-bottom: 5rem;
    input,
    select {
      background-color: transparent;
      padding: 1rem;
      border: 0.1rem solid skyblue;
      border-radius: 0.5rem;
      color: white;
      width: 100%;
      font-size: 90%;
      &:focus {
        border: 0.1rem solid blue;
        outline: none;
      }
    }
    button {
      background-color: #997af0;
      color: white;
      padding: 0.3rem;
      border: none;
      font-weight: bold;
      cursor: pointer;
      border-radius: 0.4rem;
      font-size: 1.7rem;
      text-transform: uppercase;
      transition: 0.5s ease-in-out;
      &:hover {
        background-color: green;
      }
    }
    span {
      color: white;
      font-size: 100%;
      text-transform: uppercase;
      a {
        color: #4e0eff;
        text-decoration: none;
        font-weight: bold;
      }
      word-spacing: 2px;
    }

    @media (max-width: 1054px) {
      width: 60%;  // Use more of the screen on smaller devices
      padding: 2rem 2rem;  // Reduce padding
    }

    @media (max-width: 768px) {
      width: 90%;  // Use more of the screen on smaller devices
      padding: 2rem 2rem;  // Reduce padding
    }

    @media (max-width: 480px) {
      width: 84%;  // Use full width for very small devices
      padding: 1rem 1rem;  // Further reduce padding
      font-size: 90%;  // Adjust font size slightly
    }
  }
`;


export default WardenLogin;
 