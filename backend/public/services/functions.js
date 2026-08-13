export const $ = (el) => document.querySelector(el)
export const $$ = (el) => document.querySelectorAll(el)

const $cardsSection = $('#cards')
const $addNewCardDialog = $('#add-new-card-dialog')

const createAddCardButton = () => {
  const $button = document.createElement('button')
  $button.id = 'add-new-card'
  $button.textContent = '+ Agregar una nueva tarjeta'
  $button.onclick = () => $addNewCardDialog.showModal()

  return $button
}

export const refreshToken = async () => {
  const newAccessTokenRes = await fetch('/users/refresh', { method: 'post' })
  const newAccessToken = await newAccessTokenRes.json()
  window.localStorage.setItem('accessToken', newAccessToken.accessToken)
  window.navigation.reload()
  return
}

export const renderCards = async (cardsResponse) => {
  if (cardsResponse.status === 404) {
    const $addNewCardsButton = createAddCardButton()
    const $span = document.createElement('span')
    $span.textContent =
      'Agrega una nueva para comenzar a mostrarlas a los usuarios ↴'

    const { message } = await cardsResponse.json()
    $cardsSection.textContent = `${message}`
    $cardsSection.appendChild($span)
    $cardsSection.appendChild($addNewCardsButton)
    return
  }

  const fests = await allFestsRes.json()
  fests.map((fest) => {
    const {
      id_fest,
      name,
      frequency,
      objective,
      description,
      init_date,
      end_date,
      address,
      fest_type,
      img,
    } = fest
    $cardsSection.innerHTML += `
      <article id="${id_fest}" class="card">
        <img src="${img}" />
        <h4>${name}</h4>
        <span class="badge">${fest_type}</span>
        <p>${description}</p>
        <h5>Objetivo:</h5>
        <p>${objective}</p>
        <div class="dates">
          <h5>Horarios</h5>
          <time datetime="${init_date}">${init_date.split('T')[0]}, ${init_date.split('T')[1]}</time>
          -
          <time datetime="${end_date}">${end_date.split('T')[0]}, ${end_date.split('T')[1]}</time>
        </div>
        <h5>Lugar de encuentro:</h5>
        <address>${address}</address>
        <span>Frecuencia: ${frequency}</span>
      </article>
      `
  })
  return
}

export const closeSession = () => {
  const confirmation = confirm('¿Querés cerrar la sesión?')
  if (confirmation) {
    fetch('/users/logout')
      .then((res) => res.json())
      .then((data) => {
        const { message } = data
        alert(message)
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      })
      .catch((error) => {
        const { message } = data.json()
        alert(message)
      })
    return
  }
  return
}
