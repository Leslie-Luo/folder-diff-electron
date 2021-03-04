<!--
 * @Author: leslie
 * @Date: 2021-03-01 17:21:52
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-04 16:11:47
 * @Description: 请填写简介
-->
<template>
  <a-layout>
    <a-layout-header class="header">
      <a-input v-model="SCAN_FOLDER_PATH" placeholder="请输入内容" disabled>
        <span slot="addonBefore" class="scan" @click="tapScan('CACHE')">
          <a-icon type="setting"></a-icon>选择文件目录
        </span>
      </a-input>
      <a-input v-model="SCAN_FOLDER_PATHS" placeholder="请输入内容" disabled>
        <span slot="addonBefore" class="scan" @click="tapScan('CACHES')">
          <a-icon type="setting"></a-icon>选择文件目录
        </span>
      </a-input>
      <a-button type="primary" @click="tapScanAgain">
        重新扫描
      </a-button>
      <div class="diff-nums">总差异文件{{ DIFF_ALL.length }}</div>
      <DiffPreview ref="diffPreview" :diff-file-info="diffFileInfo" />
    </a-layout-header>
    <a-layout-content :style="{ marginTop: '150px' }">
      <a-spin :spinning="CONTENT_SPINNING">
        <div class="flex">
          <div class="flex-content">
            <FileListingPage
              :data="DIFF_SCAN_RESULT_FLAT"
              :path="SCAN_FOLDER_PATH"
              :other-path="SCAN_FOLDER_PATHS"
              @tap="startDiffPreview"
            />
          </div>
          <div class="flex-content">
            <FileListingPage
              :data="DIFF_SCAN_RESULT_FLATS"
              :path="SCAN_FOLDER_PATHS"
              :other-path="SCAN_FOLDER_PATH"
              @tap="startDiffPreview"
            />
          </div>
        </div>
      </a-spin>
    </a-layout-content>
    <a-layout-footer :style="{ textAlign: 'center' }">
      Created by Leslie
    </a-layout-footer>
  </a-layout>
</template>

<script>
// @ is an alias to /src
import FileListingPage from '@/components/FileListingPage.vue';
import DiffPreview from '@/components/DiffPreview.vue';
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: 'Home',
  components: {
    FileListingPage,
    DiffPreview
  },
  data() {
    return {
      diffFileInfo: {
        ext: '',
        filePath: '',
        basePath: '',
        otherPath: ''
      }
    };
  },
  computed: {
    ...mapGetters([
      'DIFF_ALL',
      'CONTENT_SPINNING',
      'SCAN_FOLDER_PATH',
      'DIFF_SCAN_RESULT_FLAT',
      'SCAN_FOLDER_PATHS',
      'DIFF_SCAN_RESULT_FLATS'
    ])
  },
  created() {
    this.tapScanAgain();
  },
  methods: {
    ...mapMutations([
      'IPC_FOLDER_SCAN_AGAIN',
      'IPC_FOLDER_SCAN',
      'IPC_FOLDER_SELECT'
    ]),
    tapScan(type) {
      this.IPC_FOLDER_SELECT(type);
    },
    tapScanAgain() {
      this.IPC_FOLDER_SCAN_AGAIN();
    },
    startDiffPreview(e) {
      this.diffFileInfo = e;
      this.$nextTick(() => {
        this.$refs.diffPreview.init();
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.home {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 12px;
}

.header {
  position: fixed;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 100%;
  height: 150px;
  line-height: initial;
}

.scan {
  cursor: pointer;
}

.diff-nums {
  font-size: 14px;
  line-height: initial;
  color: #fff;
}

.flex {
  position: relative;
  display: flex;
  flex: 1;

  .flex-content {
    flex: 1;
  }
}
</style>
