import { createApp } from "./app.js"
import { state } from "./effect.js"
import { element } from "./render.js"

const Box = () => {
  const [style, setStyle] = state(`width:100px;`)
  let width = 100
  return element('div', {
    props: {
      style, class: 'box', onclick() {
        width += 100;
        setStyle(`width:${width}px;`)
      }
    },
  })
}
const App = () => {
  const [count, setCount] = state(1)
  const Button = element('button', {
    props: {
      onclick() {
        setCount(n => n + 1)
      }
    }
  }, "+1")
  return element(
    'div',
    null,
    [
      "Hello World",
      element('br'),
      Button,
      element('br'),
      `count:`,
      count,
      Box()
    ]
  )
}

createApp(App).mount(document.querySelector('#app'))
