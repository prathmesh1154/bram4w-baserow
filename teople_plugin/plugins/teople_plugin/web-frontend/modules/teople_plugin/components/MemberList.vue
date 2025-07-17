<template>
  <div class="member-list">
    <div v-for="member in members" :key="member.id" class="member-item" @click="$emit('member-clicked', member)">
      <div class="member-avatar">
        {{ getInitials(member.name) }}
      </div>
      <div class="member-info">
        <div class="member-name">{{ member.name }}</div>
        <div class="member-role">{{ member.role }}</div>
      </div>
      <div class="member-status" :class="{ 'active': member.is_active, 'inactive': !member.is_active }">
        {{ member.is_active ? 'Active' : 'Inactive' }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MemberList',
  props: {
    members: {
      type: Array,
      required: true
    }
  },
  methods: {
    getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
  }
}
</script>

<style scoped>
.member-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f5f5f5;
  }
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4a6baf;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-weight: bold;
}

.member-info {
  flex-grow: 1;
}

.member-name {
  font-weight: 500;
}

.member-role {
  font-size: 0.9em;
  color: #666;
}

.member-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: 500;
  
  &.active {
    background-color: #e6f7e6;
    color: #2e7d32;
  }
  
  &.inactive {
    background-color: #ffebee;
    color: #c62828;
  }
}
</style>
