export type ViewName = 'descobrir' | 'inicio' | 'explorar' | 'trilhas' | 'memoria' | 'perfil' | 'schole' | 'rotina' | 'poiesis' | 'studium' | 'cinema' | 'formacoes' | 'series' | 'cursos'

/** Loads a view before it is selected, so navigation can feel instantaneous. */
export function preloadView(view: ViewName) {
  switch (view) {
    case 'descobrir': return import('../views/DiscoverView')
    case 'inicio': return import('../views/DashboardView')
    case 'explorar': return import('../views/ExploreView')
    case 'trilhas': return import('../components/Trilhas')
    case 'memoria': return import('../views/TimelineView')
    case 'perfil': return import('../views/ProfileView')
    case 'schole': return import('../views/ScholeView')
    case 'rotina': return import('../views/RoutineView')
    case 'poiesis': return import('../views/PoiesisView')
    case 'formacoes': return import('../views/ClassicalFormationsView')
    case 'series': return import('../views/SeriesView')
    case 'cursos': return import('../views/CoursesView')
    case 'cinema': return import('../views/CinemaView')
    case 'studium': return import('../views/StudiumView')
  }
}
