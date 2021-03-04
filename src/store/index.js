/*
 * @Author: leslie
 * @Date: 2021-03-01 17:46:53
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-04 16:10:17
 * @Description: 请填写简介
 */
import Vue from 'vue';
import Vuex from 'vuex';
import path from 'path';
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
  CONTENT_SPINNING: true,
  APP: {
    VERSION: appInfo.version
  },
  CACHE: {
    // 扫描的文件夹地址
    SCAN_FOLDER_PATH: '',
    // 扫描结果
    SCAN_RESULT: [],
    // 扫描结果 扁平化
    SCAN_RESULT_FLAT: [],
    DIFF_SCAN_RESULT_FLAT: []
  },
  CACHES: {
    // 扫描的文件夹地址
    SCAN_FOLDER_PATH: '',
    // 扫描结果
    SCAN_RESULT: [],
    // 扫描结果 扁平化
    SCAN_RESULT_FLAT: [],
    DIFF_SCAN_RESULT_FLAT: []
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
      IGNORE_EXT: [],
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
  plugins: [persistedState()],
  state: cloneDeep(stateDefault),
  getters: {
    CONTENT_SPINNING: state => state.CONTENT_SPINNING,
    VERSION: state => state.APP.VERSION,
    // 快速访问 CACHE
    SCAN_FOLDER_PATH: state => state.CACHE.SCAN_FOLDER_PATH,
    SCAN_RESULT: state => state.CACHE.SCAN_RESULT,
    SCAN_RESULT_FLAT: state => state.CACHE.SCAN_RESULT_FLAT,
    SCAN_RESULT_FLAT_NOTE_NUM: state =>
      state.CACHE.SCAN_RESULT_FLAT.filter(e => e.note).length,
    DIFF_SCAN_RESULT_FLAT: state => state.CACHE.DIFF_SCAN_RESULT_FLAT,
    // 快速访问 CACHES
    SCAN_FOLDER_PATHS: state => state.CACHES.SCAN_FOLDER_PATH,
    SCAN_RESULTS: state => state.CACHES.SCAN_RESULT,
    SCAN_RESULT_FLATS: state => state.CACHES.SCAN_RESULT_FLAT,
    SCAN_RESULT_FLAT_NOTE_NUMS: state =>
      state.CACHES.SCAN_RESULT_FLAT.filter(e => e.note).length,
    DIFF_SCAN_RESULT_FLATS: state => state.CACHES.DIFF_SCAN_RESULT_FLAT,
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
    },
    /**
     * 数据更新 [ 消息提示 ]
     */
    IPC_NOTICE(state, data) {
      console.log('[ 消息提示 ]');
      message.warning({
        content: data.title
      });
    },
    /**
     * 数据更新 [ 重新扫描 ]
     */
    IPC_FOLDER_SCAN_AGAIN() {
      console.log('[ 重新扫描 ]');
      this.commit('CHANGE_CONTENT_SPINNING', true);
      ipcRenderer.send('IPC_FOLDER_SCAN_AGAINS');
    },
    /**
     * 数据更新 [ 目标文件夹地址 ]
     */
    SCAN_FOLDER_PATH_UPDATE(state, data) {
      console.log('data: ', data);
      state[data.type].SCAN_FOLDER_PATH = data.filePath;
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
     * 数据更新 根据 SCAN_RESULT 刷新 SCAN_RESULT_FLAT
     * 应该在每次刷新 SCAN_RESULT 之后自动调用
     */
    SCAN_RESULT_FLAT_REFRESH(state, type) {
      console.log('type: ', type);
      state[type].SCAN_RESULT_FLAT = translateFlat({
        data: showFilter(state[type].SCAN_RESULT),
        notes: state.DB.NOTES
      });
      this.commit('DIFF_SCAN_RESULT_FLAT_REFRESH');
    },
    /**
     * 对比扫描结果差异
     */
    DIFF_SCAN_RESULT_FLAT_REFRESH(state) {
      console.log('文件差异对比');
      let SCAN_RESULT_FLAT = state.CACHE.SCAN_RESULT_FLAT;
      state.CACHE.DIFF_SCAN_RESULT_FLAT = state.CACHE.SCAN_RESULT_FLAT;
      let SCAN_RESULT_FLATS = state.CACHES.SCAN_RESULT_FLAT;
      state.CACHES.DIFF_SCAN_RESULT_FLAT = state.CACHES.SCAN_RESULT_FLAT;
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
      let a = [];
      diffA.map(itemA => {
        SCAN_RESULT_FLAT.map((itemB, index) => {
          if (itemB.filePath === itemA) {
            state.CACHE.DIFF_SCAN_RESULT_FLAT[index].diff_missing = true;
            let obj = {
              key: index,
              value: itemB
            };
            a.push(obj);
          }
          return itemB;
        });
        return itemA;
      });
      let b = [];
      diffB.map(itemA => {
        SCAN_RESULT_FLATS.map((itemB, index) => {
          if (itemB.filePath === itemA) {
            state.CACHES.DIFF_SCAN_RESULT_FLAT[index].diff_missing = true;
            let obj = {
              key: index,
              value: itemB
            };
            b.push(obj);
          }
          return itemB;
        });
        return itemA;
      });
      console.log('a: ', a);
      console.log('b: ', b);
      this.commit('CHANGE_CONTENT_SPINNING', false);
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
      this.commit('CHANGE_CONTENT_SPINNING', true);
    },
    /**
     * ELECTRON IPC [ 删除文文件、文件夹 ]
     */
    IPC_FOLDER_REMOVE(state, data) {
      ipcRenderer.send('IPC_FOLDER_REMOVE', data);
      this.commit('CHANGE_CONTENT_SPINNING', true);
    },
    /**
     * ELECTRON IPC [ 发送扫描文件夹请求 ]
     */
    IPC_FOLDER_SCAN(state, data) {
      console.log('data: ', data);
      ipcRenderer.send('IPC_FOLDER_SCAN', {
        folderPath: state[data].SCAN_FOLDER_PATH,
        ignorePath: state.SETTING.SCAN.IGNORE_PATH,
        ignoreExt: state.SETTING.SCAN.IGNORE_EXT,
        ignoreFile: state.SETTING.SCAN.IGNORE_FILE,
        ignoreDotStartFile: state.SETTING.SCAN.IGNORE_DOT_START_FILE,
        ignoreDotStartFolder: state.SETTING.SCAN.IGNORE_DOT_START_FOLDER,
        deep: state.SETTING.SCAN.DEEP,
        type: data
      });
    }
  },
  actions: {},
  modules: {}
});
