export type ViewName = 'inicio' | 'explorar' | 'trilhas' | 'memoria' | 'perfil' | 'schole' | 'rotina' | 'poiesis' | 'studium'

/** Loads a view before it is selected, so navigation can feel instantaneous. */
export function preloadView(view: ViewName) {
  switch (view) {
    case 'inicio': return import('../views/DashboardView')
    case 'explorar': return import('../views/ExploreView')
    case 'trilhas': return import('../components/Trilhas')
    case 'memoria': return import('../views/TimelineView')
    case 'perfil': return import('../views/ProfileView')
    case 'schole': return import('../views/ScholeView')
    case 'rotina': return import('../views/RoutineView')
    case 'poiesis': return import('../views/PoiesisView')
    case 'studium': return import('../views/StudiumView')
  }
}
