import "./App.css";
import { ProcessFlow } from "./pages/membership/ProcessFlow";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage/HomePage";
import LogInPage from "./pages/login/LogInPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LogInPage/>} />
          <Route path="/membership" element={<ProcessFlow />} />
          <Route path="/" element={<Homepage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
