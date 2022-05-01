import { useEffect, useState } from 'react'
import { runDialog } from '../../../index.js' // 'mdif'

export default function MdIF ({ md, dialog, variables = {} }) {
  const [line, setLine] = useState({})
  const [options, setoptions] = useState([])
  const [position, setPosition] = useState(0)

  useEffect(() => {
    openDialog(dialog)()
  }, [md, dialog, position])

  const openDialog = d => e => {
    if (e?.preventDefault) {
      e.preventDefault()
    }
    const screen = runDialog(md, d.replace(/^#/, ''), variables, position)
    if (Array.isArray(screen)) {
      setLine({})
      setoptions(screen)
    } else {
      if (screen.ending === 'prompt') {
        setoptions(runDialog(md, d.replace(/^#/, ''), variables, position + 1))
      } else {
        setoptions([])
      }
      setLine(screen)
    }
  }

  const incrementPosition = () => {
    setPosition(position + 1)
    openDialog(dialog)
  }

  return (
    <div className='dialog'>
      {line.who && (
        <>
          <div className='who'>
            {line.who}
          </div>
          <img src={`/assets/images/${line.who}.png`} alt='' className='whoImage' />
        </>
      )}
      {line.text && (
        <div className='text'>
          {line.text}
        </div>
      )}
      {options && !!options.length && (
        <ul className='options'>
          {options.map((o, i) => (
            <li key={i}>
              <a href={o.dialog} onClick={openDialog(o.dialog)}>
                {o.text}
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className={`prompt ${line?.ending}`} />
    </div>
  )
}
