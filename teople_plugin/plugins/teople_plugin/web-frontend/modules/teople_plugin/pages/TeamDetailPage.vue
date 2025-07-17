<template>
  <div class="team-detail">
    <div v-if="loadingTeam" class="loading-section">
      <LoadingOverlay />
    </div>
    
    <template v-else>
      <div class="team-header">
        <h1>{{ team.name }}</h1>
        <div class="actions">
          <Button @click="showMemberModal = true">Add Member</Button>
          <Button @click="showEditModal = true" icon="icon-edit">Edit</Button>
        </div>
      </div>
      
      <div class="members-section">
        <h2>Members</h2>
        <LoadingOverlay v-if="loadingMembers" />
        <MemberList
          v-else
          :members="members"
          @member-clicked="handleMemberClick"
        />
      </div>
    </template>
    
    <AddMemberModal
      v-if="showMemberModal"
      :team-id="teamId"
      @close="showMemberModal = false"
      @created="handleMemberCreated"
    />
    
    <EditTeamModal
      v-if="showEditModal"
      :team="team"
      @close="showEditModal = false"
      @updated="handleTeamUpdated"
    />
  </div>
</template>

<script>
import MemberList from '@teoplePlugin/components/MemberList'
import AddMemberModal from '@teoplePlugin/components/AddMemberModal'
import EditTeamModal from '@teoplePlugin/components/EditTeamModal'
import LoadingOverlay from '@baserow/modules/core/components/LoadingOverlay'
import Button from '@baserow/modules/core/components/Button'

export default {
  name: 'TeamDetailPage',
  components: { MemberList, AddMemberModal, EditTeamModal, LoadingOverlay, Button },
  props: {
    teamId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      loadingTeam: true,
      loadingMembers: true,
      team: null,
      members: [],
      showMemberModal: false,
      showEditModal: false
    }
  },
  async created() {
    await Promise.all([this.loadTeam(), this.loadMembers()])
  },
  methods: {
    async loadTeam() {
      try {
        this.loadingTeam = true
        const response = await this.$store.dispatch('teople/fetchTeam', this.teamId)
        this.team = response.data
      } catch (error) {
        this.$notify.error('Failed to load team')
        this.$router.push({ name: 'teople-teams' })
      } finally {
        this.loadingTeam = false
      }
    },
    async loadMembers() {
      try {
        this.loadingMembers = true
        const response = await this.$store.dispatch('teople/fetchTeamMembers', this.teamId)
        this.members = response.data
      } catch (error) {
        this.$notify.error('Failed to load team members')
      } finally {
        this.loadingMembers = false
      }
    },
    handleMemberClick(member) {
      this.$router.push({ name: 'teople-member', params: { memberId: member.id } })
    },
    handleMemberCreated(newMember) {
      this.members.push(newMember)
      this.showMemberModal = false
      this.$notify.success('Member added successfully')
    },
    handleTeamUpdated(updatedTeam) {
      this.team = updatedTeam
      this.showEditModal = false
      this.$notify.success('Team updated successfully')
    }
  }
}
</script>

<style scoped>
.team-detail {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.actions {
  display: flex;
  gap: 10px;
}

.members-section {
  margin-top: 40px;
}
</style>
