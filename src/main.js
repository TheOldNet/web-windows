import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Windows from './components/windows'
import Notepad from './components/notepad'
import Sysinfo from './components/sysinfo'
import * as VueWindow from '@hscmap/vue-window'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
    faUserSecret, 
    faRedoAlt, 
    faWindowMaximize, 
    faWindowMinimize, 
    faWindowClose, 
    faPlus 
  } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faUserSecret)
library.add(faRedoAlt)
library.add(faWindowMaximize)
library.add(faWindowMinimize)
library.add(faWindowClose)
library.add(faPlus)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

Vue.use(VueWindow)
Vue.use(VueRouter)

const router = new VueRouter({
  //mode: 'history',
  // base: __dirname,
  base: '/desktop',
  routes: [
    { path: '/', component: Windows },
    { path: '/notepad', component: Notepad },
    { path: '/sysinfo', component: Sysinfo },
  ]
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
