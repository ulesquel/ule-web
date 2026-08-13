import { $, refreshToken } from '/services/functions.js'

const accessToken = window.localStorage.getItem('accessToken')

const $tbody = $('tbody')
const $addNewUser = $('#add-new-user')
const $addNewUserDialog = $('#add-new-user-dialog')

const allUsersRes = await fetch('/users/', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
})

if (allUsersRes.status === 401) {
  await refreshToken()
}

const renderUserTable = async (usersResponse) => {
  if (usersResponse.status === 404 || usersResponse.status === 403) {
    const { message } = await usersResponse.json()
    $tbody.textContent = message
    return
  }

  const users = await usersResponse.json()

  if (!Array.isArray(users)) {
    $tbody.textContent = 'Usuarios no validos, algo malo ocurrió'
  }

  users.map((user) => {
    const { id_user, username, role } = user

    $tbody.innerHTML += `
      <tr>
        <td id="${id_user}" title="${id_user}">${id_user}</td>
        <td>${username}</td>
        <td data-${role}>${role}</td>
        <td>
          <div>
            <button>Editar datos</button>  
            <button>Eliminar usuario</button>  
          </div>  
        </td>
      </tr>
    `
  })

  return
}

await renderUserTable(allUsersRes)

$addNewUser.addEventListener('click', () => $addNewUserDialog.showModal())

window.addEventListener('submit', () => window.navigation.reload())
