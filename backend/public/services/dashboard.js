import { $, closeSession, renderCards } from '/services/functions.js'

const $closeSession = $('#close-session')

const allFestsRes = await fetch('/fests/')

await renderCards(allFestsRes)
$closeSession.addEventListener('click', closeSession)
