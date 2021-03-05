<!--
 * @Author: leslie
 * @Date: 2021-03-01 18:10:42
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-05 14:51:53
 * @Description: 请填写简介
-->
<template>
  <div class="reader">
    <div v-if="path" class="reader-info">{{ info || path }}</div>
    <div v-if="!CONTENT_SPINNING" class="list">
      <template v-for="(item, index) in data">
        <div
          :key="index"
          class="row"
          @mouseover="info = item.filePathFull"
          @click="tapItem(item)"
        >
          <!-- 树枝 -->
          <span class="row-tree">
            <pre>{{ item.tree }}</pre>
          </span>
          <!-- 文件信息 -->
          <span
            class="row-info"
            :class="{ diff: item.diff_missing, 'diff-result': item.diff_file }"
          >
            <!-- 文件名 -->
            <pre class="row-info-name">{{ item.name }}</pre>
            <!-- 扩展名 -->
            <pre v-if="item.ext" class="row-info-ext">{{ item.ext }}</pre>
            <!-- 扩展名 -->
            <pre v-if="item.sizes" class="row-info-sizes">{{ item.sizes }}</pre>
          </span>
          <!-- 操作 -->
          <a-tooltip title="同步文件">
            <a-icon
              v-if="item.diff_missing"
              type="copy"
              class="copy"
              @click.stop="tapSync(item, '请确认是否同步文件或文件夹')"
            />
          </a-tooltip>
          <a-tooltip title="覆盖文件">
            <a-icon
              type="swap"
              class="cover"
              @click.stop="tapSync(item, '请确认是否覆盖文件或文件夹')"
            />
          </a-tooltip>
          <a-tooltip title="删除文件">
            <a-icon
              type="delete"
              class="cover"
              @click.stop="tapRemove(item, '请确认是否删除')"
            />
          </a-tooltip>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: 'FileListingPage',
  props: {
    data: {
      type: Array,
      default: function() {
        return [];
      }
    },
    path: {
      type: String,
      default: ''
    },
    otherPath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      info: ''
    };
  },
  computed: {
    ...mapGetters(['CONTENT_SPINNING'])
  },
  methods: {
    ...mapMutations(['IPC_FOLDER_COPY', 'IPC_FOLDER_REMOVE']),
    tapSync(e, tip) {
      const _this = this;
      this.$confirm({
        title: '提示',
        content: tip,
        okText: '确认',
        cancelText: '取消',
        onOk() {
          _this.IPC_FOLDER_COPY({
            copiedPath: _this.path + e.filePath,
            resultPath: _this.otherPath + e.filePath
          });
        }
      });
    },
    tapRemove(e, tip) {
      const _this = this;
      this.$confirm({
        title: '提示',
        content: `${tip} => ${e.filePathFull}`,
        okText: '确认',
        cancelText: '取消',
        onOk() {
          _this.IPC_FOLDER_REMOVE(e.filePathFull);
        }
      });
    },
    tapItem(e) {
      if (e.isDirectory) {
        this.$message.warning({
          content: '文件夹无法对比!'
        });
        return;
      }
      if (e.diff_missing) {
        this.$message.warning({
          content: '对比文件缺失，请先同步文件!'
        });
        return;
      }
      const ext = e.ext.replace('.', '');
      const filePath = e.filePath;
      this.$emit('tap', {
        ext: ext,
        filePath: filePath,
        basePath: this.path,
        otherPath: this.otherPath
      });
    }
  }
};
</script>

<style lang="scss">
.reader {
  position: relative;
  height: 100%;

  pre {
    display: inline-block;
    margin: 0;
    font-size: 14px;
    line-height: 18px;
  }

  .reader-info {
    position: fixed;
    box-sizing: border-box;
    width: 50%;
    height: 24px;
    padding: 0 20px;
    overflow: hidden;
    font-size: 12px;
    line-height: 24px;
    color: #333;
    text-overflow: ellipsis;
    white-space: nowrap;
    background-color: #d9d9d9;
  }

  .list {
    box-sizing: border-box;
    padding: 26px 20px;
  }

  .row {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    color: #606266;
    border-radius: 2px;

    .row-info {
      display: flex;
      align-items: center;

      .row-info-name {
        color: #303133;
        cursor: pointer;
      }

      .row-info-ext {
        color: #909399;
        cursor: pointer;
      }

      .row-info-sizes {
        margin-left: 10px;
        color: #909399;
      }
    }

    .diff {
      .row-info-name {
        color: red;
      }

      .row-info-ext {
        color: red;
      }

      .row-info-sizes {
        color: red;
      }
    }

    .diff-result {
      .row-info-name {
        color: #7b91ff;
      }

      .row-info-ext {
        color: #7b91ff;
      }

      .row-info-sizes {
        color: #7b91ff;
      }
    }

    .copy {
      margin-left: 10px;

      &:hover {
        color: #2593fc;
      }
    }

    .cover {
      margin-left: 10px;

      &:hover {
        color: #2593fc;
      }
    }

    .row-btn {
      height: 14px;
      padding: 0 2px;
      margin: 0 2px;
      font-size: 12px;
      cursor: pointer;
      background-color: #fafafa;
      border: 1px solid #d9d9d9;
      border-radius: 2px;

      .anticon {
        svg {
          width: 10px;
          height: 10px;
        }
      }

      &:hover {
        color: #fff;
        background-color: #2593fc;
        border: 1px solid darken(#2593fc, 30%) !important;
      }

      &.row-btn__hidden {
        opacity: 0;
      }
    }

    &:hover {
      background-color: rgba(#000, 0.05);
      // 操作按钮变化
      .row-btn {
        border: 1px solid #909399;
      }
    }
  }
}
</style>
