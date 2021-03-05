<!--
 * @Author: leslie
 * @Date: 2021-03-01 17:21:52
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-05 17:21:57
 * @Description: 请填写简介
-->
<template>
  <a-layout>
    <a-layout-header class="header">
      <a-input v-model="SCAN_FOLDER_PATH" placeholder="请输入内容" disabled>
        <span slot="addonBefore" class="folder" @click="tapScan('CACHE')">
          <a-icon type="folder-open"></a-icon>
          <span class="select-folder">选择文件目录</span>
        </span>
      </a-input>
      <a-input v-model="SCAN_FOLDER_PATHS" placeholder="请输入内容" disabled>
        <span slot="addonBefore" class="folder" @click="tapScan('CACHES')">
          <a-icon type="folder-open"></a-icon>
          <span class="select-folder">选择文件目录</span>
        </span>
      </a-input>
      <div class="scan">
        <a-button type="primary" block @click="tapScanAgain">
          开始扫描选中目录
        </a-button>
        <div v-if="DIFF_ALL.length > 1" class="diff-nums">
          总差异文件{{ DIFF_ALL.length }}
        </div>
      </div>
      <DiffPreview ref="diffPreview" :diff-file-info="diffFileInfo" />
    </a-layout-header>
    <a-layout-content class="content">
      <a-spin
        size="large"
        :spinning="CONTENT_SPINNING"
        :tip="CONTENT_SPINNING_TIP"
      >
        <div class="flex">
          <div class="flex-content">
            <FileListingPage
              :data="SCAN_RESULT_FLAT"
              :path="SCAN_FOLDER_PATH"
              :other-path="SCAN_FOLDER_PATHS"
              @tap="startDiffPreview"
            />
          </div>
          <div class="flex-content">
            <FileListingPage
              :data="SCAN_RESULT_FLATS"
              :path="SCAN_FOLDER_PATHS"
              :other-path="SCAN_FOLDER_PATH"
              @tap="startDiffPreview"
            />
          </div>
        </div>
      </a-spin>
    </a-layout-content>
  </a-layout>
</template>

<script>
// @ is an alias to /src
import FileListingPage from '@/components/FileListingPage.vue';
import DiffPreview from '@/components/DiffPreview.vue';
import { mapGetters, mapMutations } from 'vuex';
import { throttle } from 'lodash';
export default {
  name: 'Home',
  components: {
    FileListingPage,
    DiffPreview
  },
  data() {
    return {
      Refresh: false,
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
      'CONTENT_SPINNING_TIP',
      'SCAN_FOLDER_PATH',
      'SCAN_RESULT_FLAT',
      'SCAN_FOLDER_PATHS',
      'SCAN_RESULT_FLATS'
    ])
  },
  methods: {
    ...mapMutations(['IPC_FOLDER_SELECT', 'IPC_FOLDER_SCAN_ALL_START']),
    tapScan(type) {
      this.IPC_FOLDER_SELECT(type);
    },
    tapScanAgain: throttle(function() {
      this.IPC_FOLDER_SCAN_ALL_START();
    }, 5000),
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
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 100%;
  height: 150px;
  padding: 0 50px;
  line-height: initial;
}

.content {
  min-height: calc(100vh - 150px);
  margin-top: 150px;
}

.folder {
  display: flex;
  align-items: center;
  cursor: pointer;

  .select-folder {
    margin-left: 5px;
    font-size: 14px;
    font-weight: 500;
  }
}

.scan {
  display: flex;
  align-items: center;

  .diff-nums {
    width: 200px;
    font-size: 14px;
    line-height: initial;
    color: #fff;
    text-align: center;
  }
}

.flex {
  position: relative;
  display: flex;
  flex: 1;
  min-height: calc(100vh - 150px);

  .flex-content {
    flex: 1;
  }
}
</style>
