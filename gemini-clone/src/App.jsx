import { useState, useEffect } from 'react';
import './App.css';
import './Sidebar.css';
import { FaFileUpload, FaCog, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import Papa from 'papaparse';
import Sidebar from './Sidebar';

function App() {
  const [activePage, setActivePage] = useState("home");
  const [cleanedData, setCleanedData] = useState(null);
  const [filename, setFilename] = useState('');
  const [progress, setProgress] = useState(0);
  const [isCleaning, setIsCleaning] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [data, setData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Settings States
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState('16px');
  const [preferredFormat, setPreferredFormat] = useState('csv');
  const [autoSave, setAutoSave] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [defaultLandingPage, setDefaultLandingPage] = useState('home');
  const [language, setLanguage] = useState('en');
  const [securityMode, setSecurityMode] = useState('password');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.fontSize = fontSize;
  }, [theme, fontSize]);

  useEffect(() => {
    setActivePage(defaultLandingPage);
  }, [defaultLandingPage]);

  async function generateAnswer() {
    if (!data) {
      setAnswer("Please upload a dataset first.");
      return;
    }
  
    if (!question.trim()) {
      setAnswer("Please enter a question.");
      return;
    }
  
    setAnswer("Loading....");
  
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${import.meta.env.VITE_API_KEY}`,
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          contents: [
            {
              parts: [
                {
                  text: `Analyze the dataset: ${JSON.stringify(data)} and answer the question: ${question}`,
                },
              ],
            },
          ],
        },
      });
  
      const generatedAnswer =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response text available.";
  
      const cleanAnswer = generatedAnswer
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/[*]/g, "")
        .replace(/\n/g, "<br />");
  
      setAnswer(cleanAnswer);
    } catch (error) {
      console.error("Error generating answer:", error);
  
      if (error.response) {
        console.error("API Response Error:", error.response);
        setAnswer(`API Error: ${error.response.status} - ${error.response.data.error.message || "Unknown error"}`);
      } else if (error.request) {
        console.error("No response from server:", error.request);
        setAnswer("No response from the server. Please check your network connection.");
      } else {
        setAnswer(`Unexpected Error: ${error.message}`);
      }
    }
  }   

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setData(results.data);
          setAnswer("");
        },
        error: (error) => {
          console.error("Error parsing file:", error);
          setAnswer("Error parsing file.");
        }
      });
    }
  }

  function cleanData() {
    if (!data) {
      alert('Please upload a dataset first.');
      return;
    }

    setIsCleaning(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);

          const cleaned = data.filter((row) => Object.values(row).every((val) => val !== null && val !== ''));
          const uniqueData = Array.from(new Set(cleaned.map(JSON.stringify))).map(JSON.parse);
          setCleanedData(uniqueData);

          setIsCleaning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  }

  function downloadCleanedData() {
    if (!cleanedData) {
      alert('Please clean the data first.');
      return;
    }

    const csvContent = Papa.unparse(cleanedData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename || 'cleaned_data.csv';
    link.click();
  }

  function handleResetSettings() {
    if (window.confirm("Are you sure you want to reset all settings to default?")) {
      setTheme('dark');
      setFontSize('16px');
      setPreferredFormat('csv');
      setAutoSave(true);
      setEmailNotifications(true);
      setPushNotifications(false);
      setDefaultLandingPage('home');
      setLanguage('en');
      setSecurityMode('password');
      alert("Settings have been reset to default.");
    }
  }

  function handleLogout() {
    if (window.confirm("Are you sure you want to logout?")) {
      alert("Logged out successfully!");
      window.location.reload();
    }
  }

  const renderContent = () => {
    switch (activePage) {
      case "home":
        return (
          <div className="home-container">
            <h1>Welcome to DataGlow</h1>
            <p>
              Unlock the potential of your data with <em>DataGlow</em>, where AI-powered analysis transforms your datasets into actionable insights. 
              Upload your CSV files, ask questions, and watch as your data comes to life.
            </p>
            <div className="features">
              <h2>Key Features</h2>
              <ul>
                <li><strong>🌟 Effortless Data Upload:</strong> Seamlessly upload your datasets in CSV format and start analyzing within minutes.</li>
                <li><strong>🤖 AI-Driven Insights:</strong> Ask questions, and get quick, AI-generated answers based on your dataset.</li>
                <li><strong>✨ Glowing Data Visualization:</strong> Transform your raw data into vibrant, interactive visualizations that reveal trends, correlations, and patterns.</li>
                <li><strong>🔒 Privacy First:</strong> Your data is processed securely, ensuring confidentiality and protection.</li>
                <li><strong>⚡ Real-Time Data Cleaning:</strong> Automatically clean your data with one click, removing errors, duplicates, and missing values.</li>
              </ul>
            </div>
            <div className="call-to-action">
              <h2>Get Started with DataGlow</h2>
              <p>
                Ready to see the magic of your data? Upload a dataset now, and watch it glow with insightful analysis!
              </p>
              <button onClick={() => setActivePage('newChat')} className="cta-button">
                Get Started
              </button>
            </div>
          </div>
        );
      case "newChat":
        return (
          <div className="new-chat-container">
            <h1>Data Analysis AI</h1>
            <label htmlFor="file-upload" className="custom-file-upload">
              <FaFileUpload className="upload-icon" /> Upload CSV File
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              cols="30"
              rows="10"
              placeholder="Ask a question about your dataset..."
            />
            <button onClick={generateAnswer} className="generate-button">Generate Answer</button>
            <div className="dynamic-html-container" dangerouslySetInnerHTML={{ __html: answer }} />
          </div>
        );
      case 'dataCleaning':
        return (
          <div className="data-cleaning-container">
            <h1>🧹 Data Cleaning</h1>
            <p>
              <strong>Transform Your Data with Ease!</strong> Use our tools to refine your dataset for accurate analysis.
              Remove missing values and duplicates in just a few clicks.
            </p>
      
            <div className="file-upload-section">
              <label htmlFor="file-upload" className="custom-file-upload">
                <FaFileUpload className="upload-icon" /> Upload CSV File
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
      
            <div className="action-buttons">
              <button className="clean-button" onClick={cleanData} disabled={isCleaning}>
                {isCleaning ? 'Cleaning Data...' : 'Clean Data'}
              </button>
              <button
                className="download-button"
                onClick={downloadCleanedData}
                disabled={isCleaning || !cleanedData}
              >
                Download Cleaned Data
              </button>
            </div>
      
            {isCleaning && (
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                <p>{progress}%</p>
              </div>
            )}
      
            {cleanedData && (
              <div className="cleaned-summary">
                <h2>Cleaned Data Summary</h2>
                <p>✅ <strong>Unique Rows:</strong> {cleanedData.length}</p>
                <p>🚀 <strong>Quality Boost:</strong> Your data is ready for deeper analysis!</p>
              </div>
            )}
      
            <div className="insights-section">
              <p>After cleaning, explore correlations, trends, and more by uploading the cleaned dataset to the analysis tool!</p>
            </div>
      
            <div className="call-to-action">
              <p>✨ Start cleaning your data and see the magic unfold!</p>
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="profile-container">
            <h1>Profile Information</h1>
            <p>
              Due to ongoing beta testing, the profile section is currently exclusive to admins only. We’re working hard to enhance this feature, and it will be made available to all users in the upcoming update. Stay tuned for more exciting updates!
              <br /><br />
              This version emphasizes the exclusivity while ensuring the user understands it's a temporary situation, building anticipation for the future release.
            </p>
          </div>
        );
      case "settings":
        return null;
      case "help":
        return (
          <div className="help">
            <h1>Help & FAQs</h1>
            <h2>Getting Started</h2>
            <p>To begin using our tool, upload a CSV file containing your data, then ask questions related to your dataset.</p>
            <h2>Data Privacy and Security</h2>
            <p>We prioritize your privacy. Your data is processed securely and is never shared with third parties.</p>
            <h2>Data Format Requirements</h2>
            <p>Please ensure your dataset is in CSV format for optimal analysis. Other formats may not be supported.</p>
            <h2>Error Handling</h2>
            <p>If you encounter errors during file upload, ensure the file format is correct and try again. If issues persist, contact support.</p>
            <h2>Contact Support</h2>
            <p>If you need further assistance, please reach out to our support team via the contact page.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`app-container ${theme}`}>
      <Sidebar
        onMenuItemClick={(page) => {
          if (page === "settings") setShowSettings(true);
          else setActivePage(page);
        }}
      />
      <div className="content">
        {renderContent()}
      </div>

      {showSettings && (
        <div className="settings-dialog">
          <div className="dialog-content">
            <button className="close-button" onClick={() => setShowSettings(false)}>
              <FaTimes />
            </button>
            <h2>Settings</h2>
            <div className="settings-section">
              <h3>Display & Theme</h3>
              <div className="setting-item">
                <span>Font Size</span>
                <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                  <option value="14px">Small</option>
                  <option value="16px">Medium</option>
                  <option value="18px">Large</option>
                  <option value="20px">Extra Large</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <h3>Data Settings</h3>
              <div className="setting-item">
                <span>Preferred File Format</span>
                <select value={preferredFormat} onChange={(e) => setPreferredFormat(e.target.value)}>
                  <option value="csv">CSV</option>
                  <option value="xlsx">XLSX</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div className="setting-item">
                <span>Auto-Save</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={() => setAutoSave(prev => !prev)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div className="settings-section">
              <h3>Security Settings</h3>
              <div className="setting-item">
                <span>Security Mode</span>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="security"
                      value="password"
                      checked={securityMode === 'password'}
                      onChange={() => setSecurityMode('password')}
                    />
                    Password Only
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="security"
                      value="2fa"
                      checked={securityMode === '2fa'}
                      onChange={() => setSecurityMode('2fa')}
                    />
                    Two-Factor Authentication
                  </label>
                </div>
              </div>
              {/* Placeholder for Change Password */}
              <button onClick={() => alert("Change Password functionality coming soon!")} className="action-button">
                Change Password
              </button>
              {/* Placeholder for Enable 2FA */}
              {securityMode === '2fa' && (
                <button onClick={() => alert("Enable 2FA functionality coming soon!")} className="action-button">
                  Enable 2FA
                </button>
              )}
            </div>

            <div className="settings-section">
              <h3>Notification Settings</h3>
              <div className="setting-item">
                <span>Email Notifications</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications(prev => !prev)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="setting-item">
                <span>Push Notifications</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={() => setPushNotifications(prev => !prev)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div className="settings-section">
              <h3>Application Behavior</h3>
              <div className="setting-item">
                <span>Default Landing Page</span>
                <select value={defaultLandingPage} onChange={(e) => setDefaultLandingPage(e.target.value)}>
                  <option value="home">Home</option>
                  <option value="newChat">New Chat</option>
                  <option value="dataCleaning">Data Cleaning</option>
                </select>
              </div>
              <div className="setting-item">
                <span>Language</span>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <h3>Reset & Logout</h3>
              <button onClick={handleResetSettings} className="reset-button">Reset to Default</button>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
