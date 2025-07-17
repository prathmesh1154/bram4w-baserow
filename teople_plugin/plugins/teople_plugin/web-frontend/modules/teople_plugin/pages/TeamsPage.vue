<template>
  <div class="teople-container">
    <div class="header">
      <h1>Teams</h1>
      <Button @click="showCreateModal = true">Create Team</Button>
    </div>
    
    <LoadingOverlay v-if="loading" />
    
    <div v-else class="team-list">
      <TeamCard
        v-for="team in teams"
        :key="team.id"
        :team="team"
        @click.native="$router.push({ name: 'teople-team-detail', params: { teamId: team.id } })"
      />
    </div>
    
    <CreateTeamModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleTeamCreated"
    />
  </div>
</template>

<script>
import TeamCard from '@teoplePlugin/components/TeamCard'
import CreateTeamModal from '@teoplePlugin/components/CreateTeamModal'
import LoadingOverlay from '@baserow/modules/core/components/LoadingOverlay'
import Button from '@baserow/modules/core/components/Button'

export default {
  name: 'TeamsPage',
  components: { TeamCard, CreateTeamModal, LoadingOverlay, Button },
  data() {
    return {
      loading: true,
      teams: [],
      showCreateModal: false
    }
  },
  async created() {
    await this.loadTeams()
  },
  methods: {
    async loadTeams() {
      try {
        this.loading = true
        const response = await this.$store.dispatch('teople/fetchTeams')
        this.teams = response.data
      } catch (error) {
        this.$notify.error('Failed to load teams')
      } finally {
        this.loading = false
      }
    },
    handleTeamCreated(newTeam) {
      this.teams.unshift(newTeam)
      this.showCreateModal = false
      this.$notify.success('Team created successfully')
    }
  }
}
</script>

<style scoped>
.teople-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.team-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
</style>
