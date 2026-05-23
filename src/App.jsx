import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Background from './Front/background'
import Navbar from './Front/Navbar'
import HeroText from './Front/HeroText'
import FogLayer from './Front/FogLayer'
import { Routes, Route } from "react-router-dom";

import Home from "./Front/home";
import About from "./about/about";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
    </>
  )
}

export default App
