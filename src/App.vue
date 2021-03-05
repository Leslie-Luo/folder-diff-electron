<!--
 * @Author: leslie
 * @Date: 2021-03-01 16:00:18
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-05 10:04:36
 * @Description: 请填写简介
-->
<template>
  <div id="app" ref="app">
    <router-view />
  </div>
</template>

<script>
import reply from '@/ipc/reply';
export default {
  created() {
    reply(this);
  }
};
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
