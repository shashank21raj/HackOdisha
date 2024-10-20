import React from 'react'
import {UserProfileContainer } from './components/userprofile'
import { BrowserRouter as Router, Route, Routes} from'react-router-dom'
import { Testing } from './components/testing'
import Navbar from './components/navbar'
import Login from './components/Login'
import Signup from './components/Signup'
import ProtectedRoute from './components/protectedRoute'

function App() {
  return (
    <Router>
    <div>
      <Navbar/>
      <Routes>
        <Route path='/' element={<ProtectedRoute element={UserProfileContainer}/>} />
        <Route path='/test' element={<ProtectedRoute element={Testing}/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
    </Router>
  )
}

export default App
