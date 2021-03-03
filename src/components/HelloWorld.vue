<!--
 * @Author: leslie
 * @Date: 2021-03-01 18:10:42
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-03 17:44:49
 * @Description: 请填写简介
-->
<template>
  <div class="reader">
    <div class="is-p-5">
      <recycle-scroller
        v-slot="{ item }"
        :items="data"
        :item-size="22"
        key-field="id"
        class="list"
      >
        <div
          class="row"
          @mouseover="info = item.filePathFull"
          @click="tapItem(item)"
        >
          <!-- 树枝 -->
          <span class="row-tree">
            <pre>{{ item.tree }}</pre>
          </span>
          <!-- 文件信息 -->
          <span class="row-info" :class="{ diff: item.diff_missing }">
            <!-- 文件名 -->
            <pre class="row-info-name">{{ item.name }}</pre>
            <!-- 扩展名 -->
            <pre v-if="item.ext" class="row-info-ext">{{ item.ext }}</pre>
            <!-- 扩展名 -->
            <pre v-if="item.ext" class="row-info-ext">{{ item.sizes }}</pre>
          </span>
          <!-- 操作 -->
          <el-tooltip
            class="synchronize"
            effect="dark"
            content="同步文件"
            placement="right"
          >
            <span
              v-if="item.diff_missing"
              class="el-icon-document-copy"
              @click="tapSync(item)"
            ></span>
          </el-tooltip>
          <el-tooltip
            class="cover"
            effect="dark"
            content="覆盖文件"
            placement="right"
          >
            <span class="el-icon-sort" @click="tapSync(item)"></span>
          </el-tooltip>
        </div>
      </recycle-scroller>
    </div>
    <div class="reader-info">{{ info }}</div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
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
  methods: {
    ...mapMutations(['IPC_FOLDER_COPY']),
    tapSync(e) {
      this.IPC_FOLDER_COPY({
        copiedPath: this.path + e.filePath,
        resultPath: this.otherPath + e.filePath
      });
    },
    tapItem(e) {
      const filePath = e.filePath;
      console.log('filePath: ', filePath);
    }
  }
};
</script>

<style lang="scss">
.reader {
  height: 100%;

  .reader-info {
    padding-right: 5px;
    padding-left: 5px;
    font-size: 10px;
    line-height: 14px;
    color: #333;
    background-color: #d9d9d9;
  }

  .list {
    height: 100%;
    cursor: pointer;

    .row {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      color: #606266;
      border-radius: 2px;

      pre {
        margin: 0;
        font-size: 14px;
        line-height: 18px;
      }

      .row-info {
        display: flex;
        align-items: center;

        .row-info-name {
          color: #303133;
        }

        .row-info-ext {
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
      }

      .synchronize {
        margin-left: 10px;

        &:hover {
          color: #2593fc;
        }
      }

      .cover {
        margin-left: 10px;
        transform: rotate(90deg);

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
}
</style>
