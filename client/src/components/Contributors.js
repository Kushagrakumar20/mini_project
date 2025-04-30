import React from 'react';
import styled, { keyframes } from 'styled-components';
import githubImg from '../images/github.png';
import linkedinImg from '../images/Linkedin.png';
import Footer from './Footer';
import img from '../images/user.png';
import pic1 from '../images/pic1.jpg';
import pic3 from '../images/pic3.jpg';
import pic4 from '../images/pic4.jpg';
import pic2 from '../images/pic2.jpg';

import '../css/dashboard.css';

// Define the keyframe animation
const hoverAnimation = keyframes`
  0% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(255, 255, 255, 0.1);
  }
  100% {
    background-color: transparent;
  }
`;

const CardContainer = styled.div`
  background-color: transparent;
  border-radius: 20px;
  box-shadow: inset 0 0 6px 0px rgb(210, 214, 191);
  animation: ${hoverAnimation} 4s infinite; 
  margin: 1rem;
  padding: 2rem;
  flex: 1 1 300px; // Flex basis of 300px but able to grow and shrink
`;

const Contributor = ({ name, contribution, linkedin, github, imageSrc }) => {
  return (
    <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12 card_changes">
      <CardContainer className="text-center">
        <img src={imageSrc} alt={name} style={{ width: '50%', height: 'auto', borderRadius: '50%' }} />
        <h3 className="p-2">{name}</h3>
        <p>{contribution}</p>
        <p className="m-4">
          <a href={linkedin} target="_blank" rel="noopener noreferrer" className="m-2">
            <img src={linkedinImg} alt="LinkedIn" style={{ width: '30px', height: '30px' }} />
          </a>
          <span>&nbsp;</span>
          <a href={github} target="_blank" rel="noopener noreferrer" className="m-2">
            <img src={githubImg} alt="GitHub" style={{ width: '30px', height: '30px' }} />
          </a>
        </p>
      </CardContainer>
    </div>
  );
};

const Contributors = () => {
    return (
      <div>
        <div className="container-fluid shadow-lg contributor_container">
          <div className="row">
            <div className="col-md-12 text-center text-light mt-2">
              <h1 className="m-5" style={{ backgroundColor: '#50C878', padding: '10px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                Contributors Corner
              </h1>
            </div>
          </div>
          <div className="row justify-content-center text-light">
            <Contributor
              name="Kushagra Kumar"
              contribution="Backend Developer, Crafting Robust APIs"
              linkedin="https://www.linkedin.com/in/kushagrakumar20/"
              github="https://github.com/Kushagrakumar20"
              imageSrc={pic2}
            />
            {/* Add more Contributor components as needed */} 
            <Contributor
              name="Khushi Verma"
              contribution="Backend Developer, Managing data"
              linkedin=""
              github=""
              imageSrc={pic1}
            />
            <Contributor
              name="Utkarsh Awasthi"
              contribution="Frontend Engineer, React componenets"
              linkedin=""
              github=""
              imageSrc={pic3}
            />
            <Contributor
              name="Om prakash"
              contribution="UI Design and Redux-Managed Data Integration"
              linkedin=""
              github=""
              imageSrc={pic4}
            />
            
          
          </div>
        </div>
        <Footer />
      </div>
    );
  };
  
  export default Contributors;
  