import { React, useState } from 'react'
import SeatMap from './components/SeatMap'
import Checkout from './components/Checkout'
import './App.css'

function App() {
  
  const [holdId, setHoldId] = useState(null);
  return (
    <div style={{ padding: 24 }}>
    <h1> Event Ticketing System</h1>
    <SeatMap eventId={1} sectionId={1} onHold={setHoldId} />
    <Checkout holdId={holdId} />
    </div>
    
  )
}

export default App
