/*
 * @Author: leslie
 * @Date: 2021-03-02 14:31:11
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-03 13:40:16
 * @Description: 请填写简介
 */
import { ipcRenderer } from 'electron';
import store from '../store';

export default function(instance) {
  // 接收文件夹选择的结果
  ipcRenderer.on('IPC_FOLDER_SELECT_REPLY', (event, arg) => {
    console.log('arg: ', arg);
    store.commit('SCAN_FOLDER_PATH_UPDATE', arg);
    store.commit('IPC_FOLDER_SCAN', arg.type);
  });
  // 重新扫描
  ipcRenderer.on('IPC_FOLDER_SCAN_AGAIN', event => {
    console.log('[ 重新扫描 ]');
    store.commit('IPC_FOLDER_SCAN', 'CACHE');
    store.commit('IPC_FOLDER_SCAN', 'CACHES');
  });
  // 接收返回的扫描结果
  ipcRenderer.on('IPC_FOLDER_SCAN_REPLY', (event, arg) => {
    console.log('arg: =====', arg);
    store.commit('SCAN_RESULT_UPDATE', arg);
  });
  // 接收导出文件的返回结果
  ipcRenderer.on('IPC_EXPORT_REPLY', (event, arg) => {
    instance.$message.success('内容已经导出');
  });
}
