import Vue from 'vue'
import App from './App.vue'

import DraggingSortBlock from '../package/index'
Vue.use(DraggingSortBlock)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
