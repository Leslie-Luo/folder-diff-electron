/*
 * @Author: leslie
 * @Date: 2021-03-02 14:31:11
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-05 15:16:21
 * @Description: 请填写简介
 */
import { ipcRenderer } from 'electron';
import store from '../store';

export default function(instance) {
  // 消息提示
  ipcRenderer.on('NOTICE', (event, arg) => {
    console.log('[ 消息提示 ]');
    store.commit('IPC_NOTICE', arg);
  });
  // 接收文件夹选择的结果
  ipcRenderer.on('IPC_FOLDER_SELECT_REPLY', (event, arg) => {
    console.log('接收文件夹选择的结果: ', arg);
    store.commit('SCAN_FOLDER_PATH_UPDATE', arg);
  });
  // 开始扫描选中目录
  ipcRenderer.on('IPC_FOLDER_SCAN_ALL_START', event => {
    console.log(
      '%c [ 开始扫描目录一 ]',
      'color: #fff; background: #1890ff; font-size: 13px;'
    );
    store.commit('CHANGE_CONTENT_SPINNING_TIP', '开始扫描目录一');
    store.commit('IPC_FOLDER_SCAN', 'CACHE');
  });
  // 接收返回的扫描结果
  ipcRenderer.on('IPC_FOLDER_SCAN_REPLY', (event, arg) => {
    console.log('接收返回的扫描结果: =====', arg);
    store.commit('SCAN_RESULT_UPDATE', arg);
  });
  // 接收导出文件的返回结果
  ipcRenderer.on('IPC_EXPORT_REPLY', (event, arg) => {
    instance.$message.success('内容已经导出');
  });
  // 接收修改文件内容的返回结果
  ipcRenderer.on('IIPC_CHANGE_FILE_CONTENT_REPLY', (event, arg) => {
    instance.$message.success('内容已经修改');
  });
}
