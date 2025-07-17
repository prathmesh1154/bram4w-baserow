<template>
  <div class="team-card">
    <div class="card-header">
      <h3>{{ team.name }}</h3>
      <span class="created-date">{{ formatDate(team.created_at) }}</span>
    </div>
    <div class="card-content">
      <div class="member-count">
        <i class="icon-users"></i>
        {{ memberCount }} members
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeamCard',
  props: {
    team: {
      type: Object,
      required: true
    }
  },
  computed: {
    memberCount() {
      return this.team.members_count || 0
    }
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.team-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.created-date {
  color: #666;
  font-size: 0.9em;
}

.card-content {
  display: flex;
  align-items: center;
}

.member-count {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555;
  
  i {
    font-size: 1.1em;
  }
}
</style>
