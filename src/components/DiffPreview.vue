<!--
 * @Author: leslie
 * @Date: 2021-03-03 18:03:25
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-04 12:32:32
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
      @close="drawer = false"
    >
      <codemirror v-if="drawer" :merge="true" :options="cmOption" />
    </a-drawer>
  </div>
</template>

<script>
import { codemirror } from 'vue-codemirror';
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
import 'codemirror/theme/base16-dark.css';
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
import fs from 'fs';
console.log('fs: ', fs);

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
      cmOption: {
        value: '',
        origLeft: null,
        orig: '',
        tabSize: 2,
        mode: 'text/html',
        theme: 'base16-dark',
        lineNumbers: true,
        collapseIdentical: false,
        highlightDifferences: true
      }
    };
  },
  methods: {
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
    }
  }
};
</script>

<style lang="scss">
.CodeMirror,
.CodeMirror-merge {
  height: calc(100vh - 48px);
}

.CodeMirror-merge .CodeMirror {
  height: calc(100vh - 48px);
}
</style>
