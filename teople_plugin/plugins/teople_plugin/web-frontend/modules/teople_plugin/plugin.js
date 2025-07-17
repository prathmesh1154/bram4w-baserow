// export default ({ app }, inject) => {
//     inject('teople', {
//         async getStatus() {
//             return await app.$axios.$get('/api/teople/status/')
//         }
//     })
// }

import { PluginNamePlugin } from '@baserow/modules/core/pluginTypes'
import TeopleSidebarComponent from '@teoplePlugin/components/TeopleSidebarComponent'
import { TeopleStore } from '@teoplePlugin/store'

export class TeoplePlugin extends PluginNamePlugin {
    static getType() {
        return 'teople-plugin'
    }
    
    getSidebarComponent() {
        return TeopleSidebarComponent
    }
    
    register(registry) {
        registry.register('store', TeopleStore)
    }
}