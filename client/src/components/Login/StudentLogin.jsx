import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { redirect_to_dashboard, logoutStudent ,change_fee} from '../../redux/studentSlice';
import { get_all_complaints, get_my_complaints } from '../../redux/complaintSlice';
import Footer from '../Footer';

const StudentLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.students.token !== null);
  useSelector((state)=>{
    console.log(state);
  })

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    console.log("kdjjkf=",process.env.BACK_END_URL)
    axios.post(`${process.env.REACT_APP_BACK_END_URL}/loginStudent`, {
      email,
      password,
    })
      .then((res) => {
        console.log(res.data.status);
        if(res.data.status===301){
          console.log("hi")
          axios.post(`${process.env.REACT_APP_BACK_END_URL}/student/verify`,{
            email
          }).then((res)=>{
            toast.error('Check your email to verify your account');
          })
          return;
        }
        const token = res.data.data.token;
        // console.log("Token is : "+token);
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `${token}`;
        
        


        // Fetch student data after successful login
        axios.get(`${process.env.REACT_APP_BACK_END_URL}/student/dashboard`)
          .then((response) => {
            // console.log(response.data.data.complaints);
            // console.log(response.data.data.myComplaints);
            if(response.data.status===200){
              const studentData = response.data.data;
              console.log("dkowo====",studentData);
              dispatch(redirect_to_dashboard({
                name : studentData.name,
                email: studentData.email,
                feeAmount: studentData.feeAmount,
                regNo: studentData.regNo,
                hostelName: studentData.hostelName,
                roomNo: studentData.roomNo,
                token: studentData.token 
              }));
              dispatch(get_all_complaints({
                complaints : studentData.complaints
              }))
              dispatch(get_my_complaints({
                myComplaints : studentData.myComplaints
              }))
              
              
              axios.get(`${process.env.REACT_APP_BACK_END_URL}/student/hostelExpensePerPerson`)
                .then((response) => {
                  console.log("Data received:", response.data);
                  const receivedAmount = response.data.data.expense;
                  const numericAmount = Number(receivedAmount);
                  console.log("Received amount (raw):", receivedAmount);
                  console.log("Received amount (converted to number):", numericAmount);
              
                  if (!isNaN(numericAmount)) {
                    const Amount = 25000 - numericAmount;
                    console.log("Calculated feeAmount:", Amount);
                    dispatch(change_fee({
                      Amount: Amount,
                    }));
                    navigate('/dashboard');
                  } else {
                    console.error("Received data is not convertible to number.");
                  }
                })
                .catch((error) => {
                  console.error('Error fetching bill data:', error);
                  // toast.error('Error fetching bill data');
                });

              
              // navigate('/dashboard')
            }else toast.error('Cant log in!');
          })
          .catch((error) => {
            console.error('Error fetching student data:', error);
            toast.error('Error fetching student data');
          });
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
    axios.defaults.headers.common['Authorization'] = undefined;
    console.log("Logging out");
    dispatch(logoutStudent());

    localStorage.removeItem('token');
    console.log(localStorage.getItem('token'));
    navigate('/');
  };

  return (
    <>
      <FormContainer>
        
          <form onSubmit={handleLogin}>
            <div className="brand">
              <h3 style={{color : "skyblue"}}>STUDENT LOGIN</h3>
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
            <span>
              Don't have an account? <Link to="/register">Register</Link>
            </span>
          </form>
       
      </FormContainer>
      <Footer/>
      <ToastContainer />
    </>
  );
};

const FormContainer = styled.div`
  height: 110%;
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
      width: 100%;  // Use full width for very small devices
      padding: 1rem 1rem;  // Further reduce padding
      font-size: 90%;  // Adjust font size slightly
    }
    @media (max-width: 480px) {
      width: 84%;  // Use full width for very small devices
      padding: 1rem 1rem;  // Further reduce padding
      font-size: 90%;  // Adjust font size slightly
    }
  }
`;

export default StudentLogin;