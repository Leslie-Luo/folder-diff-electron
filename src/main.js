/*
 * @Author: leslie
 * @Date: 2021-03-01 17:21:52
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-04 15:16:43
 * @Description: 请填写简介
 */
import Vue from 'vue';
import App from './App.vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.use(Antd);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
