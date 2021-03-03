<!--
 * @Author: leslie
 * @Date: 2021-03-01 17:21:52
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-03 13:34:40
 * @Description: 请填写简介
-->
<template>
  <div class="home">
    <div class="scan">
      <el-button type="success" @click="tapScan('CACHE')">
        选择文件目录
      </el-button>
      <el-input v-model="SCAN_FOLDER_PATH" placeholder="请输入内容" disabled>
      </el-input>
      <el-button type="success" @click="tapScanAgain()">
        重新扫描
      </el-button>
    </div>
    <div class="scan">
      <el-button type="success" @click="tapScan('CACHES')">
        选择文件目录
      </el-button>
      <el-input v-model="SCAN_FOLDER_PATHS" placeholder="请输入内容" disabled>
      </el-input>
      <el-button type="success" @click="tapScanAgain()">
        重新扫描
      </el-button>
    </div>
    <div>总差异文件{{ DIFF_ALL.length }}</div>
    <div @click="DIFF_SCAN_RESULT_FLAT_REFRESH">重新对比</div>
    <div class="flex">
      <div class="flex-content">
        <HelloWorld
          :data="DIFF_SCAN_RESULT_FLAT"
          :path="SCAN_FOLDER_PATH"
          :other-path="SCAN_FOLDER_PATHS"
        />
      </div>
      <div class="flex-content">
        <HelloWorld
          :data="DIFF_SCAN_RESULT_FLATS"
          :path="SCAN_FOLDER_PATHS"
          :other-path="SCAN_FOLDER_PATH"
        />
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue';
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  computed: {
    ...mapGetters([
      'DIFF_ALL',
      'SCAN_FOLDER_PATH',
      'SCAN_RESULT',
      'SCAN_RESULT_FLAT',
      'DIFF_SCAN_RESULT_FLAT',
      'SCAN_FOLDER_PATHS',
      'SCAN_RESULTS',
      'SCAN_RESULT_FLATS',
      'DIFF_SCAN_RESULT_FLATS'
    ])
  },
  methods: {
    ...mapMutations([
      'IPC_FOLDER_SCAN_AGAIN',
      'IPC_FOLDER_SCAN',
      'IPC_FOLDER_SELECT',
      'DIFF_SCAN_RESULT_FLAT_REFRESH'
    ]),
    tapScan(type) {
      this.IPC_FOLDER_SELECT(type);
    },
    tapScanAgain() {
      this.IPC_FOLDER_SCAN_AGAIN();
    }
  }
};
</script>
<style lang="scss" scoped>
.scan {
  display: flex;
  align-items: center;
}

.flex {
  display: flex;

  .flex-content {
    flex: 1;
  }
}
</style>
