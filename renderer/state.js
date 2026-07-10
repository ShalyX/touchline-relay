function createInitialState() {
  return {
    room: '',
    pendingRoom: '',
    peerCount: 0,
    p2pStatus: 'idle',
    translationStatus: 'idle',
    preview: null,
    history: [],
    fixtureHistory: [],
    lastPublishedId: null,
    error: ''
  }
}

function reduceState(state, action) {
  switch (action.type) {
    case 'room/joining':
      return {
        ...state,
        pendingRoom: action.room,
        p2pStatus: 'joining',
        error: ''
      }
    case 'room/joined':
      return {
        ...state,
        room: action.room,
        pendingRoom: '',
        peerCount: action.peers,
        p2pStatus: 'joined',
        error: ''
      }
    case 'room/status':
      return { ...state, peerCount: action.peers, p2pStatus: action.status || state.p2pStatus }
    case 'composer/translating':
      return { ...state, translationStatus: 'loading', error: '' }
    case 'composer/translated':
      return {
        ...state,
        translationStatus: 'ready',
        preview: { original: action.original, translated: action.translated, status: 'ready' },
        error: ''
      }
    case 'composer/edited':
      if (!state.preview || state.preview.original === action.original) return state
      return { ...state, preview: { ...state.preview, status: 'stale' } }
    case 'composer/published':
      return {
        ...state,
        lastPublishedId: action.id,
        preview: state.preview ? { ...state.preview, status: 'published' } : state.preview,
        error: ''
      }
    case 'announcement/published':
      return { ...state, lastPublishedId: action.id, error: '' }
    case 'announcement/received':
      if (state.history.some((item) => item.id === action.announcement.id)) return state
      return { ...state, history: [action.announcement, ...state.history].slice(0, 50) }
    case 'fixture/shown':
      return { ...state, fixtureHistory: [action.announcement] }
    case 'error':
      return { ...state, error: action.message }
    default:
      return state
  }
}

if (typeof module !== 'undefined') {
  module.exports = { createInitialState, reduceState }
}

if (typeof window !== 'undefined') {
  window.TouchlineState = { createInitialState, reduceState }
}
