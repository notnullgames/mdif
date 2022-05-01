import React from 'react'
import ReactDOM from 'react-dom/client'
import MdIF from './MdIF.jsx'

globalThis.React = React

const md = await fetch('/assets/example.md').then(r => r.text())

const App = () => (
  <MdIF md={md} dialog="start"></MdIF>
)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
