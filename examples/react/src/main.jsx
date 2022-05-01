import React from 'react'
import ReactDOM from 'react-dom/client'
import MdIF from './MdIF.jsx'

globalThis.React = React

const md = await fetch('/assets/example.md').then(r => r.text())

const konsumer = {
  scared: false
}

const player = {
  inventory: [],
  name: 'Lucy'
}

const App = () => (
  <MdIF md={md} dialog="start" variables={{konsumer, player}}></MdIF>
)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
