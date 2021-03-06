/*
 * @Author: leslie
 * @Date: 2021-03-01 17:46:53
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-05 17:39:33
 * @Description: 请填写简介
 */
import Vue from 'vue';
import Vuex from 'vuex';
import path from 'path';
import fs from 'fs';
const jsDiff = require('diff');
import { ipcRenderer } from 'electron';
import { cloneDeep } from 'lodash';
import appInfo from '@root/package.json';
import persistedState from 'vuex-persistedstate';
import translateFlat from '@/util/translate.flat.js';
import { message } from 'ant-design-vue';

Vue.use(Vuex);

/**
 * 根据 isShow 和 isShowElements 过滤数据
 * @param {Array} elements 需要过滤的原数组
 */
function showFilter(els) {
  return els
    .filter(el => el.isShow)
    .map(el => ({
      ...el,
      elements: el.isShowElements ? showFilter(el.elements) : []
    }));
}

const stateDefault = {
  CONTENT_SPINNING: false,
  CONTENT_SPINNING_TIP: '',
  APP: {
    VERSION: appInfo.version
  },
  // 当前扫描的文件夹地址
  SCAN_FOLDER_PATH: {
    CACHE: '',
    CACHE_WATCHER: '',
    CACHES: '',
    CACHES_WATCHER: ''
  },
  CACHE: {
    // 扫描的文件夹地址
    SCAN_FOLDER_PATH: '',
    // 扫描结果
    SCAN_RESULT: [],
    // 扫描结果 扁平化
    SCAN_RESULT_FLAT: []
  },
  CACHES: {
    // 扫描的文件夹地址
    SCAN_FOLDER_PATH: '',
    // 扫描结果
    SCAN_RESULT: [],
    // 扫描结果 扁平化
    SCAN_RESULT_FLAT: []
  },
  // 差异文件
  DIFF_A: [],
  DIFF_B: [],
  DIFF_ALL: [],
  // 数据库
  DB: {
    // 所有的备注信息 可以在重新扫描时自动恢复备注
    NOTES: {}
  },
  // 设置
  SETTING: {
    // 通用
    APP: {
      // 在导出之后打开文件
      OPEN_AFTER_EXPORT: true,
      // 在导出之后打开文件位置
      OPEN_FOLDER_AFTER_EXPORT: false,
      // 删除文件前确认
      DELETE_CONFIRM: true
    },
    // 扫描相关
    SCAN: {
      // 忽略的文件夹
      IGNORE_PATH: ['node_modules', 'dist', '.git'].map(e => path.sep + e),
      // 忽略的文件类型
      IGNORE_EXT: ['.lock'],
      // 忽略文件
      IGNORE_FILE: false,
      // 忽略点开头的文件
      IGNORE_DOT_START_FILE: true,
      // 忽略点开头的文件夹
      IGNORE_DOT_START_FOLDER: false,
      // 扫描深度 0 为没有限制
      DEEP: 0
    }
  }
};

export default new Vuex.Store({
  plugins: [
    persistedState({
      reducer(val) {
        return {
          SCAN_FOLDER_PATH: val.SCAN_FOLDER_PATH
        };
      }
    })
  ],
  state: cloneDeep(stateDefault),
  getters: {
    CONTENT_SPINNING: state => state.CONTENT_SPINNING,
    CONTENT_SPINNING_TIP: state => state.CONTENT_SPINNING_TIP,
    VERSION: state => state.APP.VERSION,
    // 快速访问 CACHE
    SCAN_FOLDER_PATH: state => state.SCAN_FOLDER_PATH.CACHE,
    SCAN_RESULT: state => state.CACHE.SCAN_RESULT,
    SCAN_RESULT_FLAT: state => state.CACHE.SCAN_RESULT_FLAT,
    SCAN_RESULT_FLAT_NOTE_NUM: state =>
      state.CACHE.SCAN_RESULT_FLAT.filter(e => e.note).length,
    // 快速访问 CACHES
    SCAN_FOLDER_PATHS: state => state.SCAN_FOLDER_PATH.CACHES,
    SCAN_RESULTS: state => state.CACHES.SCAN_RESULT,
    SCAN_RESULT_FLATS: state => state.CACHES.SCAN_RESULT_FLAT,
    SCAN_RESULT_FLAT_NOTE_NUMS: state =>
      state.CACHES.SCAN_RESULT_FLAT.filter(e => e.note).length,
    /**
     * 当前是否有扫描结果
     */
    HAS_SCAN_DATA: state => state.CACHE.SCAN_RESULT.length !== 0,
    HAS_SCAN_DATAS: state => state.CACHES.SCAN_RESULT.length !== 0,
    // 差异文件
    DIFF_A: state => state.DIFF_A,
    DIFF_A: state => state.DIFF_B,
    DIFF_ALL: state => state.DIFF_ALL
  },
  mutations: {
    /**
     * 数据更新 [ 切换Loading ]
     */
    CHANGE_CONTENT_SPINNING(state, data) {
      console.log('[ 切换Loading ]');
      state.CONTENT_SPINNING = data;
      state.CONTENT_SPINNING_TIP = '';
    },
    /**
     * 数据更新 [ 更新Loading提示文本 ]
     */
    CHANGE_CONTENT_SPINNING_TIP(state, data) {
      console.log('[ 更新Loading提示文本 ]', data);
      state.CONTENT_SPINNING_TIP = data;
    },
    /**
     * 数据更新 [ 消息提示 ]
     */
    IPC_NOTICE(state, data) {
      console.log('[ 消息提示 ]');
      message.success({
        content: data.title
      });
    },
    /**
     * 数据更新 [ 目标文件夹地址 ]
     *
     */
    SCAN_FOLDER_PATH_UPDATE(state, data) {
      console.log(
        '%c [ ====== 数据更新 [ 目标文件夹地址 ] ====== ]: ',
        'color: #bf2c9f; background: pink; font-size: 13px;'
      );
      console.log('data: ', data);
      state.SCAN_FOLDER_PATH[data.type] = data.filePath;
      console.log(
        '%c [ ====== 数据更新 [ 目标文件夹地址 ] END ====== ]: ',
        'color: #bf2c9f; background: pink; font-size: 13px;'
      );
    },
    /**
     * 数据更新 [ 扫描结果 ]
     */
    SCAN_RESULT_UPDATE(state, data) {
      console.log('data: ====', data);
      // 为扫描结果的每一项增加固定索引
      function addIndex(elements) {
        return elements.map((e, index) => ({
          index,
          ...e,
          elements: addIndex(e.elements)
        }));
      }
      state[data.type].SCAN_RESULT = addIndex(data.data);
      this.commit('SCAN_RESULT_FLAT_REFRESH', data.type);
    },
    /**
     * [ 开始扫描选中目录 ]
     */
    IPC_FOLDER_SCAN_ALL_START() {
      console.log('[ 开始扫描选中目录 ]');
      this.commit('CHANGE_CONTENT_SPINNING', true);
      this.commit('CHANGE_CONTENT_SPINNING_TIP', '开始扫描选中目录');
      ipcRenderer.send('IPC_FOLDER_SCAN_ALL_START_SEND');
    },
    /**
     * 数据更新 根据 SCAN_RESULT 刷新 SCAN_RESULT_FLAT
     * 应该在每次刷新 SCAN_RESULT 之后自动调用
     */
    SCAN_RESULT_FLAT_REFRESH(state, type) {
      state[type].SCAN_RESULT_FLAT = translateFlat({
        data: showFilter(state[type].SCAN_RESULT),
        notes: state.DB.NOTES
      });
      if (type === 'CACHE') {
        console.log(
          '%c [ 目录一扫描结束，开始扫描目录二 ]',
          'color: #fff; background: #1890ff; font-size: 13px;'
        );
        this.commit('CHANGE_CONTENT_SPINNING_TIP', '目录一扫描结束');
        this.commit('CHANGE_CONTENT_SPINNING_TIP', '开始扫描目录二');
        this.commit('IPC_FOLDER_SCAN', 'CACHES');
      } else {
        console.log(
          '%c [ 目录二扫描结束，开始对比扫描结果差异 ]',
          'color: #fff; background: #1890ff; font-size: 13px;'
        );
        this.commit('CHANGE_CONTENT_SPINNING_TIP', '目录二扫描结束');
        this.commit('CHANGE_CONTENT_SPINNING_TIP', '开始对比扫描结果差异');
        setTimeout(() => {
          this.commit('DIFF_SCAN_RESULT_FLAT_REFRESH');
        }, 300);
      }
    },
    /**
     * 对比扫描结果差异
     */
    DIFF_SCAN_RESULT_FLAT_REFRESH(state) {
      console.log(
        '%c [ 开始对比扫描结果差异 ]',
        'color: #fff; background: #1890ff; font-size: 13px;'
      );
      // 目录一地址
      let SCAN_FOLDER_PATH = state.SCAN_FOLDER_PATH.CACHE;
      // 目录二地址
      let SCAN_FOLDER_PATHS = state.SCAN_FOLDER_PATH.CACHES;
      let SCAN_RESULT_FLAT = state.CACHE.SCAN_RESULT_FLAT;
      let SCAN_RESULT_FLATS = state.CACHES.SCAN_RESULT_FLAT;
      let FilePath = [];
      SCAN_RESULT_FLAT.forEach(element => {
        FilePath.push(element.filePath);
      });
      let FilePaths = [];
      SCAN_RESULT_FLATS.forEach(element => {
        FilePaths.push(element.filePath);
      });
      let diffA = FilePath.filter(v => {
        return FilePaths.indexOf(v) == -1;
      });
      let diffB = FilePaths.filter(v => {
        return FilePath.indexOf(v) == -1;
      });
      state.DIFF_A = diffA;
      state.DIFF_B = diffB;
      state.DIFF_ALL = [...diffA, ...diffB];
      diffA.map(itemA => {
        SCAN_RESULT_FLAT.map((itemB, index) => {
          if (itemB.filePath === itemA) {
            state.CACHE.SCAN_RESULT_FLAT[index].diff_missing = true;
          }
          return itemB;
        });
        return itemA;
      });
      diffB.map(itemA => {
        SCAN_RESULT_FLATS.map((itemB, index) => {
          if (itemB.filePath === itemA) {
            state.CACHES.SCAN_RESULT_FLAT[index].diff_missing = true;
          }
          return itemB;
        });
        return itemA;
      });
      state.CACHE.SCAN_RESULT_FLAT = state.CACHE.SCAN_RESULT_FLAT.map(item => {
        if (!item.diff_missing && item.isFile) {
          this.commit(
            'CHANGE_CONTENT_SPINNING_TIP',
            `正在对比${item.filePath}`
          );
          let FILE_RESULT = fs.readFileSync(
            `${SCAN_FOLDER_PATH}${item.filePath}`,
            'utf8'
          );
          let FILE_RESULTS = fs.readFileSync(
            `${SCAN_FOLDER_PATHS}${item.filePath}`,
            'utf8'
          );
          let jsDiffs = jsDiff.diffLines(FILE_RESULT, FILE_RESULTS);
          if (jsDiffs.length > 1) {
            item.diff_file = true;
          } else if (jsDiffs[0].added || jsDiffs[0].removed) {
            item.diff_file = true;
          }
        }
        return item;
      });
      state.CACHE.SCAN_RESULT_FLAT.map(itemA => {
        state.CACHES.SCAN_RESULT_FLAT.map((itemB, index) => {
          if (itemB.filePath === itemA.filePath && itemA.diff_file) {
            state.CACHES.SCAN_RESULT_FLAT[index].diff_file = true;
          }
          return itemB;
        });
        return itemA;
      });
      this.commit('CHANGE_CONTENT_SPINNING_TIP', '对比扫描结果差异结束');
      this.commit('CHANGE_CONTENT_SPINNING', false);
      console.log(
        '%c [ 对比扫描结果差异结束 ]',
        'color: #fff; background: #1890ff; font-size: 13px;'
      );
    },
    /**
     * ELECTRON IPC [ 通过文件选择窗口选择一个文件夹 ]
     */
    IPC_FOLDER_SELECT(state, data) {
      ipcRenderer.send('IPC_FOLDER_SELECT', data);
    },
    /**
     * ELECTRON IPC [ 复制文件、文件夹 ]
     */
    IPC_FOLDER_COPY(state, data) {
      ipcRenderer.send('IPC_FOLDER_COPY', { data });
    },
    /**
     * ELECTRON IPC [ 删除文文件、文件夹 ]
     */
    IPC_FOLDER_REMOVE(state, data) {
      ipcRenderer.send('IPC_FOLDER_REMOVE', data);
    },
    /**
     * ELECTRON IPC [ 发送扫描文件夹请求 ]
     */
    IPC_FOLDER_SCAN(state, data) {
      console.log('data: ', data);
      console.log('state.SETTING.SCAN.IGNORE_EXT: ', state.SETTING.SCAN);
      ipcRenderer.send('IPC_FOLDER_SCAN', {
        folderPath: state.SCAN_FOLDER_PATH[data],
        ignorePath: state.SETTING.SCAN.IGNORE_PATH,
        ignoreExt: state.SETTING.SCAN.IGNORE_EXT,
        ignoreFile: state.SETTING.SCAN.IGNORE_FILE,
        ignoreDotStartFile: state.SETTING.SCAN.IGNORE_DOT_START_FILE,
        ignoreDotStartFolder: state.SETTING.SCAN.IGNORE_DOT_START_FOLDER,
        deep: state.SETTING.SCAN.DEEP,
        type: data
      });
    },
    /**
     * ELECTRON IPC [ 导出文件 ]
     */
    IPC_CHANGE_FILE_CONTENT(state, { filePath, content }) {
      ipcRenderer.send('IPC_CHANGE_FILE_CONTENT', {
        filePath,
        content
      });
    }
  },
  actions: {},
  modules: {}
});
