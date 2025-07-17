export default function (context, inject) {
  inject('teople', {
    async getStatus() {
      const { data } = await context.$axios.get('/api/teople/status/')
      return data
    }
  })
}