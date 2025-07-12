import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faCog, faQuestionCircle, faComments, faBroom } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

function Sidebar({ onMenuItemClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="hamburger" onClick={toggleSidebar}>
        ☰
      </button>
      <nav className={`menu ${isOpen ? 'expanded' : ''}`}>
        <ul>
          <li onClick={() => onMenuItemClick("newChat")}>
            <FontAwesomeIcon icon={faComments} /> New Chat
          </li>
          <li onClick={() => onMenuItemClick('dataCleaning')}>
            <FontAwesomeIcon icon={faBroom} /> Data Cleaning
          </li>
          <li onClick={() => onMenuItemClick("home")}>
            <FontAwesomeIcon icon={faHome} /> Home
          </li>
          <li onClick={() => onMenuItemClick("profile")}>
            <FontAwesomeIcon icon={faUser} /> Profile
          </li>
          <li onClick={() => onMenuItemClick("settings")}>
            <FontAwesomeIcon icon={faCog} /> Settings
          </li>
          <li onClick={() => onMenuItemClick("help")}>
            <FontAwesomeIcon icon={faQuestionCircle} /> Help & Feedback
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
