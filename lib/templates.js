const MATCHDAY_TEMPLATES = [
  {
    id: 'kickoff-delay',
    label: 'Kickoff delay',
    venue: 'Pitch 2',
    priority: 'urgent',
    body: 'Kickoff moves to Pitch 2 at 14:30. Meet at the north gate.'
  },
  {
    id: 'gate-change',
    label: 'Gate change',
    venue: 'Main Gate',
    priority: 'important',
    body: 'Entry moves to Main Gate. Bring accreditation and matchday wristband.'
  },
  {
    id: 'volunteer-brief',
    label: 'Volunteer briefing',
    venue: 'North Touchline',
    priority: 'important',
    body: 'Volunteer briefing at North Touchline in 10 minutes. Bring radios.'
  },
  {
    id: 'weather-hold',
    label: 'Weather hold',
    venue: 'Pitch 1',
    priority: 'urgent',
    body: 'Weather hold on Pitch 1. Players remain in the dugout until further notice.'
  },
  {
    id: 'med-station',
    label: 'Medical station',
    venue: 'Main Gate',
    priority: 'routine',
    body: 'Medical station is open beside Main Gate. Report incidents to pitch marshals first.'
  }
]

const VENUES = ['North Touchline', 'Pitch 1', 'Pitch 2', 'Main Gate']

function listTemplates() {
  return MATCHDAY_TEMPLATES.map((item) => ({ ...item }))
}

function getTemplate(id) {
  return MATCHDAY_TEMPLATES.find((item) => item.id === id) || null
}

module.exports = { MATCHDAY_TEMPLATES, VENUES, listTemplates, getTemplate }
