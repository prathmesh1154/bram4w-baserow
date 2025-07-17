<!-- <template>
  <div class="teople-status">
    <h1>{{ title }}</h1>
    <p>Status: {{ status }}</p>
    <p>Endpoint: {{ endpoint }}</p>
  </div>
</template>

<script>
export default {
  async asyncData({ $teople }) {
    try {
      return await $teople.getStatus()
    } catch (error) {
      return {
        title: 'Error',
        status: 'Failed to load status',
        endpoint: ''
      }
    }
  },
  head() {
    return {
      title: this.title,
    }
  }
}
</script>

<style scoped>
.teople-status {
  padding: 20px;
  font-family: Arial, sans-serif;
}
</style> -->