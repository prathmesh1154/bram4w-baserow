// import { createStoreModule } from '@baserow/modules/core/store'

// export const TeopleStore = createStoreModule('teople', {
//   actions: {
//     async fetchTeams({ commit }) {
//       try {
//         const response = await this.$client.get('/api/teople/teams/')
//         return response
//       } catch (error) {
//         console.error('Failed to fetch teams', error)
//         throw error
//       }
//     }
//   }
// })

import { createStoreModule } from '@baserow/modules/core/store'

export const TeopleStore = createStoreModule('teople', {
  state: () => ({
    teams: [],
    currentTeam: null,
    teamMembers: []
  }),
  mutations: {
    SET_TEAMS(state, teams) {
      state.teams = teams
    },
    SET_CURRENT_TEAM(state, team) {
      state.currentTeam = team
    },
    SET_TEAM_MEMBERS(state, members) {
      state.teamMembers = members
    },
    ADD_TEAM(state, team) {
      state.teams.unshift(team)
    },
    ADD_TEAM_MEMBER(state, member) {
      state.teamMembers.push(member)
    },
    UPDATE_TEAM(state, updatedTeam) {
      const index = state.teams.findIndex(t => t.id === updatedTeam.id)
      if (index !== -1) {
        state.teams.splice(index, 1, updatedTeam)
      }
      if (state.currentTeam && state.currentTeam.id === updatedTeam.id) {
        state.currentTeam = updatedTeam
      }
    }
  },
  actions: {
    async fetchTeams({ commit }) {
      try {
        const response = await this.$client.get('/api/teople/teams/')
        commit('SET_TEAMS', response.data)
        return response
      } catch (error) {
        throw error
      }
    },
    async fetchTeam({ commit }, teamId) {
      try {
        const response = await this.$client.get(`/api/teople/teams/${teamId}/`)
        commit('SET_CURRENT_TEAM', response.data)
        return response
      } catch (error) {
        throw error
      }
    },
    async fetchTeamMembers({ commit }, teamId) {
      try {
        const response = await this.$client.get(`/api/teople/members/?team=${teamId}`)
        commit('SET_TEAM_MEMBERS', response.data)
        return response
      } catch (error) {
        throw error
      }
    },
    async createTeam({ commit }, teamData) {
      try {
        const response = await this.$client.post('/api/teople/teams/', teamData)
        commit('ADD_TEAM', response.data)
        return response
      } catch (error) {
        throw error
      }
    },
    async updateTeam({ commit }, { teamId, data }) {
      try {
        const response = await this.$client.patch(`/api/teople/teams/${teamId}/`, data)
        commit('UPDATE_TEAM', response.data)
        return response
      } catch (error) {
        throw error
      }
    },
    async addTeamMember({ commit }, memberData) {
      try {
        const response = await this.$client.post('/api/teople/members/', memberData)
        commit('ADD_TEAM_MEMBER', response.data)
        return response
      } catch (error) {
        throw error
      }
    }
  },
  getters: {
    getTeamById: state => id => state.teams.find(team => team.id === id),
    getActiveMembers: state => state.teamMembers.filter(m => m.is_active)
  }
})