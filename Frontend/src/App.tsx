import "./App.css";
import { ProcessFlow } from "./pages/membership/ProcessFlow";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage/HomePage";
import AboutPage from "./pages/about/AboutPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/membership" element={<ProcessFlow />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/" element={<Homepage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
