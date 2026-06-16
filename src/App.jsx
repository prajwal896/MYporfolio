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
import About from "./about/About";
import Projects from "./Projects/Projects";
import Services from './services/services';
import Contact from './contact/contact'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Background />
    <FogLayer />
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact" element={<Contact/>} />

    </Routes>
    </>
  )
}

export default App
