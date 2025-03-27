import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ProcessFlow } from './pages/membership/ProcessFlow'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Homepage from './pages/homepage/homepage'

function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <Router>
        <Routes>
          <Route path="/membership" element={<ProcessFlow />} />
          <Route path="/" element={<Homepage/>} />  
         
        </Routes>
      </Router>
    </>
  )
  
}

export default App
