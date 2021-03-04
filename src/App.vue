<!--
 * @Author: leslie
 * @Date: 2021-03-01 16:00:18
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-04 13:01:17
 * @Description: 请填写简介
-->
<template>
  <div id="app" ref="app">
    <router-view />
  </div>
</template>

<script>
import scan from '@/util/scan';
import reply from '@/ipc/reply';
export default {
  created() {
    reply(this);
  },
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
      if (event.dataTransfer.files.length > 0) {
        console.log('event: ', event);
        this.IPC_FOLDER_SCAN(event.dataTransfer.files[0].path);
      }
      this.isDraging = false;
    };
    this.$refs.app.onmouseout = event => {
      event.preventDefault();
      this.isDraging = false;
    };
  },
  methods: {
    /**
     * ELECTRON IPC [ 发送扫描文件夹请求 ]
     */
    async IPC_FOLDER_SCAN(folderPath) {
      const path = require('path');
      console.log('folderPath: ', folderPath);
      let files = await scan({
        folderPath: folderPath,
        // 忽略的文件夹
        ignorePath: ['node_modules', 'dist', '.git'].map(e => path.sep + e)
      });
      console.log('files: ', files);
    }
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
