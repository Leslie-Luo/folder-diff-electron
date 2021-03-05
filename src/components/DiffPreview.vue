<!--
 * @Author: leslie
 * @Date: 2021-03-03 18:03:25
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-05 15:53:01
 * @Description: 请填写简介
-->
<template>
  <div class="code-preview">
    <a-drawer
      placement="right"
      :closable="false"
      :visible="drawer"
      mask-closable
      width="80vw"
      height="100vh"
      @close="drawerClose"
    >
      <div class="path-info">
        <div class="path">{{ diffFileInfo.basePath }}</div>
        <div class="path">{{ diffFileInfo.otherPath }}</div>
      </div>
      <codemirror
        v-if="drawer"
        :merge="true"
        :options="cmOption"
        @input="onCmCodeChange"
      />
    </a-drawer>
  </div>
</template>

<script>
import fs from 'fs';
import { codemirror } from 'vue-codemirror';
import { mapMutations } from 'vuex';
// import base style
import 'codemirror/lib/codemirror.css';
// language
import 'codemirror/mode/vue/vue.js';
import 'codemirror/mode/css/css.js';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/markdown/markdown.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';
// import theme style
import 'codemirror/theme/base16-light.css';
// merge js
import 'codemirror/addon/merge/merge.js';

// merge css
import 'codemirror/addon/merge/merge.css';

// google DiffMatchPatch
import DiffMatchPatch from 'diff-match-patch';

// DiffMatchPatch config with global
window.diff_match_patch = DiffMatchPatch;
window.DIFF_DELETE = -1;
window.DIFF_INSERT = 1;
window.DIFF_EQUAL = 0;

export default {
  name: 'CodePreview',
  components: {
    codemirror
  },
  props: {
    diffFileInfo: {
      type: Object,
      default: function() {
        return {
          ext: '',
          filePath: '',
          basePath: '',
          otherPath: ''
        };
      }
    }
  },
  data() {
    return {
      drawer: false,
      codeChange: false,
      newCode: '',
      cmOption: {
        value: '',
        origLeft: null,
        orig: '',
        tabSize: 2,
        mode: 'text/html',
        theme: 'base16-light',
        lineNumbers: true,
        collapseIdentical: false,
        highlightDifferences: true
      }
    };
  },
  methods: {
    ...mapMutations(['IPC_CHANGE_FILE_CONTENT']),
    init() {
      this.cmOption.value = fs.readFileSync(
        `${this.diffFileInfo.basePath}${this.diffFileInfo.filePath}`,
        'utf8'
      );
      this.cmOption.orig = fs.readFileSync(
        `${this.diffFileInfo.otherPath}${this.diffFileInfo.filePath}`,
        'utf8'
      );
      this.cmOption.mode = this.isAssetType(this.diffFileInfo.ext);
      this.codeChange = false;
      this.newCode = '';
      this.drawer = true;
    },
    isAssetType(ext) {
      let type = 'text/x-vue';
      switch (ext) {
        case 'vue':
          type = 'text/x-vue';
          break;
        case 'scss':
          type = 'text/css';
          break;
        case 'json':
          type = 'text/javascript';
          break;
        case 'html':
          type = 'text/html';
          break;
        case 'md':
          type = 'text/x-markdown';
          break;
        default:
          type = 'text';
          break;
      }
      return type;
    },
    onCmCodeChange(newCode) {
      this.codeChange = true;
      this.newCode = newCode;
    },
    drawerClose() {
      const _this = this;
      if (this.codeChange) {
        this.$confirm({
          title: '是否需要保存修改内容',
          onOk() {
            _this.IPC_CHANGE_FILE_CONTENT({
              filePath: `${_this.diffFileInfo.basePath}${_this.diffFileInfo.filePath}`,
              content: _this.newCode
            });
            _this.drawer = false;
          },
          onCancel() {
            _this.drawer = false;
          }
        });
      } else {
        this.drawer = false;
      }
    }
  }
};
</script>

<style lang="scss">
.ant-drawer-body {
  box-sizing: border-box;
  padding: 0 24px 24px 24px;
}

.path-info {
  display: flex;
  align-items: center;
  height: 40px;
  font-size: 13px;
  font-weight: 500;
  line-height: initial;

  .path {
    flex: 1;
  }
}

.CodeMirror,
.CodeMirror-merge {
  height: calc(100vh - 64px);
}

.CodeMirror-merge .CodeMirror {
  height: calc(100vh - 64px);
}
</style>
