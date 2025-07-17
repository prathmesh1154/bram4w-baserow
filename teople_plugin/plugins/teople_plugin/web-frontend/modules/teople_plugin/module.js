import path from 'path'

export default function (moduleOptions) {
    this.nuxt.options.alias['@teople-plugin'] = path.resolve(__dirname, './')
    
    this.extendRoutes((routes) => {
        routes.unshift({
            name: 'teople-plugin',
            path: '/teople',
            component: path.resolve(__dirname, 'pages/TeoplePage.vue')
        })
    })
}