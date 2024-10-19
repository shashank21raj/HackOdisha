import React from 'react'
import {UserProfileContainer } from './components/userprofile'
import { BrowserRouter as Router, Route, Routes} from'react-router-dom'
import { Testing } from './components/testing'
import Navbar from './components/navbar'

function App() {
  return (
    <Router>
    <div>
      <Navbar/>
      <Routes>
        <Route path="/" element={<UserProfileContainer/>} />
        <Route path='/test' element={<Testing/>}/>
      </Routes>
    </div>
    </Router>
  )
}

export default App
