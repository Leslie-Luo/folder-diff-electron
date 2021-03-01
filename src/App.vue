<!--
 * @Author: leslie
 * @Date: 2021-03-01 16:00:18
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-01 16:56:03
 * @Description: 请填写简介
-->
<template>
  <div id="app" ref="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view />
  </div>
</template>

<script>
export default {
  mounted() {
    // 处理文件拖拽
    this.$refs.app.ondragenter = event => {
      event.preventDefault();
      this.isDraging = true;
    };
    this.$refs.app.ondragover = event => {
      event.preventDefault();
      this.isDraging = true;
    };
    this.$refs.app.ondrop = event => {
      event.preventDefault();
      if (this.$route.meta.draggable && event.dataTransfer.files.length > 0) {
        console.log('event: ', event);
      }
      this.isDraging = false;
    };
    this.$refs.app.onmouseout = event => {
      event.preventDefault();
      this.isDraging = false;
    };
  }
};
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  text-align: center;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
