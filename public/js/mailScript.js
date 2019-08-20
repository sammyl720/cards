// const ge = (id) => document.getElementById(id)
const mailer = ge('mailer')
const mailerForm = ge('mailer-form')
mailerForm.addEventListener('submit', (event)=> {
  event.preventDefault()
  const email = event.target.email.value
  const cardId = event.target.id.value
  console.log(`email: ${email}\ncardId: ${cardId}`)
  fetch('/email-card', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cardId: cardId,
      email: email
    })
  }).then(res => res.json()).then(jsonData => {
    console.log(jsonData)
    if (jsonData.success) {
      mailer.innerHTML = `<h4>Message Sent</h4><div class="mailer-form">Your message sent Successfuly</div>`
    }
    alert(jsonData.msg)
  }).catch(err => console.log(err))
})
