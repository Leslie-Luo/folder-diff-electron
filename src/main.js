/*
 * @Author: leslie
 * @Date: 2021-03-01 17:21:52
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-02 15:51:38
 * @Description: 请填写简介
 */
import Vue from 'vue';
import App from './App.vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router';
import store from './store';
import electron from 'electron';
import VueVirtualScroller from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

Vue.config.productionTip = false;

Vue.prototype.$electron = electron;
Vue.use(ElementUI);
Vue.use(VueVirtualScroller);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
