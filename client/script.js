import bot from './assets/bot.svg'
import user from './assets/user.svg'
import { v4 as uuidv4 } from 'uuid'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

function loader(element){
  element.textContent = ''

  loadInterval = setInterval(()=>{
    element.textContent += '.'
    if(element.textContent === '....'){
      element.textContent=''
    }
  },300)
}

function typeText(element,text){
  let index = 0

  let interval = setInterval(()=>{
    if(index < text.length){
      element.innerHTML += text.charAt(index)
      index++
    }else{
      clearInterval(interval)
    }
  },20)
}

function chatStripe(isBot,value,id){
  return(
    `
    <div class="wrapper ${isBot && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img
          src="${isBot ? bot : user}"
          alt="${isBot ? 'bot' : 'user'}"
          />
        </div>
        <div class="message" id=${id}>${value}</div>
      </div>
    </div>
    `
  )
}

const handleSubmit = async (e)=>{
  e.preventDefault()
  const data = new FormData(form)

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false,data.get('prompt'))
  form.reset()

  // bot's chatstripe
  const uniqueId = uuidv4()
  chatContainer.innerHTML += chatStripe(true," ",uniqueId)
  chatContainer.scrollTop = chatContainer.scrollHeight
  const messageDiv = document.getElementById(uniqueId)
  loader(messageDiv)

  // fetch data from server
  const response = await fetch('https://codex-chat-gpt-2-0.vercel.app/',{
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval)

  messageDiv.innerHTML = ''

  if(response.ok){
    const data = await response.json()
    const parsedData = data.bot.trim()

    typeText(messageDiv,parsedData)
  }else{
    const err = await response.text()
    messageDiv.innerHTML = "Something went wrong"
    alert(err)
  }
}

form.addEventListener('submit',handleSubmit)
form.addEventListener('keyup',(e)=>{
  if(e.keyCode === 13){
    handleSubmit(e)
  }
})
