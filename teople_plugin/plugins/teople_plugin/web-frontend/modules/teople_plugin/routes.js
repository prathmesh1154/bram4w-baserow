import { Route } from '@baserow/modules/core/router'
import TeamsPage from '@teoplePlugin/pages/TeamsPage'
import TeamDetailPage from '@teoplePlugin/pages/TeamDetailPage'
import MemberPage from '@teoplePlugin/pages/MemberPage'

export default [
  new Route({
    path: '/teams',
    name: 'teople-teams',
    component: TeamsPage,
    meta: { requiresAuth: true }
  }),
  new Route({
    path: '/teams/:teamId',
    name: 'teople-team-detail',
    component: TeamDetailPage,
    meta: { requiresAuth: true }
  }),
  new Route({
    path: '/members/:memberId',
    name: 'teople-member',
    component: MemberPage,
    meta: { requiresAuth: true }
  })
]