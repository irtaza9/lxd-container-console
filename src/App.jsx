import { useState } from 'react'
import './App.css'
import InstanceTextConsole from './components/InstanceConsole'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <InstanceTextConsole />
    </>
  )
}

export default App
