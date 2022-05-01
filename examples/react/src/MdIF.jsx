import { useEffect, useState } from 'react'
import { runDialog, getASTInfo } from '../../../index.js' // 'mdif'

export default function MdIF ({ md, dialog, state = {} }) {
  const [currentDialog, setDialog] = useState(dialog)
  const [line, setLine] = useState({})
  const [options, setOptions] = useState([])
  const [dialogPosition, setdialogPosition] = useState(0)

  useEffect(() => {
    linkHandler(dialog)({ preventDefault: () => {} })
  }, [md, dialog])

  const linkHandler = d => e => {
    e.preventDefault()
    const screen = runDialog(md, d, state, dialogPosition)
    if (Array.isArray(screen)) {
      setLine({})
      setOptions(screen)
    } else {
      setDialog(d)
      setLine(screen)
      if (screen.ending === 'prompt') {
        setOptions(runDialog(md, d, state, dialogPosition + 1))
      } else {
        setOptions([])
      }
    }
  }

  return (
    <>
      <pre>
        {JSON.stringify(line, null, 2)}
      </pre>
      <ul>
        {options.map((o, i) => (
          <li key={i}><a onClick={linkHandler(o.dialog.replace(/^#/, ''))} href={o.dialog}>{o.text}</a></li>
        ))}
      </ul>
      {line.ending === 'more' && (
        <button onClick={() => setdialogPosition(dialogPosition + 1)}>more</button>
      )}
    </>
  )
}
