import { useState } from 'react'
import './App.css'
import VideoUpload from './VideoUpload'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <VideoUpload />
    </>
  )
}

export default App