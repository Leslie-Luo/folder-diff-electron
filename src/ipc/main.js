/*
 * @Author: leslie
 * @Date: 2021-03-01 17:34:18
 * @LastEditors: leslie
 * @LastEditTime: 2021-03-05 17:23:56
 * @Description: 请填写简介
 */
import fs from 'fs';
import { ipcMain, dialog, BrowserWindow, Notification, shell } from 'electron';
import scan from '../util/scan';
const fse = require('fs-extra');

/**
 * 渲染进程请求选择扫描的文件夹
 */
ipcMain.on('IPC_FOLDER_SELECT', async (event, arg) => {
  console.log('渲染进程请求选择扫描的文件夹: ', arg);
  const window = BrowserWindow.getFocusedWindow();
  const result = await dialog.showOpenDialog(window, {
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled === false) {
    event.reply('IPC_FOLDER_SELECT_REPLY', {
      filePath: result.filePaths[0],
      type: arg
    });
  }
});

/**
 * 渲染进程请求选择保存结果的目录
 */
ipcMain.on(
  'IPC_EXPORT',
  async (event, { name, value, openAfterExport, openFolderAfterExport }) => {
    const window = BrowserWindow.getFocusedWindow();
    const result = await dialog.showSaveDialog(window, {
      defaultPath: name
    });
    if (result.canceled === false) {
      await fs.writeFileSync(
        result.filePath,
        new Uint8Array(Buffer.from(value))
      );
      if (openAfterExport) {
        shell.openItem(result.filePath);
      } else if (openFolderAfterExport) {
        shell.showItemInFolder(result.filePath);
      }
      event.reply('IPC_EXPORT_REPLY');
    }
  }
);

/**
 * 渲染进程请求扫描文件夹
 */
ipcMain.on('IPC_FOLDER_SCAN', async (event, arg) => {
  event.reply('IPC_FOLDER_SCAN_REPLY', {
    data: await scan({
      ...arg,
      needCheckIsFolder: true
    }),
    type: arg.type
  });
});

/**
 * 渲染进程开始扫描选中目录
 */
ipcMain.on('IPC_FOLDER_SCAN_ALL_START_SEND', async (event, arg) => {
  event.reply('IPC_FOLDER_SCAN_ALL_START');
});

/**
 * 渲染进程请求复制文件夹
 */
ipcMain.on('IPC_FOLDER_COPY', async (event, arg) => {
  const { copiedPath, resultPath } = arg.data;
  fse
    .copy(copiedPath, resultPath)
    .then(() => {
      console.log('success!');
      event.reply('NOTICE', {
        title: '同步拷贝成功',
        body: copiedPath
      });
    })
    .catch(err => {
      console.error(err);
    });
});

/**
 * 渲染进程请求修改文件内容
 */
ipcMain.on('IPC_CHANGE_FILE_CONTENT', async (event, { filePath, content }) => {
  await fs.writeFileSync(filePath, new Uint8Array(Buffer.from(content)));
  event.reply('IIPC_CHANGE_FILE_CONTENT_REPLY');
});

/**
 * 渲染进程请求删除文件夹
 */
ipcMain.on('IPC_FOLDER_REMOVE', async (event, arg) => {
  fse
    .remove(arg)
    .then(() => {
      console.log('success!');
      event.reply('NOTICE', {
        title: `删除成功:${arg}`
      });
    })
    .catch(err => {
      console.error(err);
    });
});

/**
 * 渲染进程请求发送桌面通知
 */
ipcMain.on(
  'IPC_SEND_NOTIFICATION',
  async (event, { title = 'Folder Explorer', body = '' }) => {
    event.returnValue = Notification.isSupported();
    if (Notification.isSupported()) {
      const notification = new Notification({
        title,
        body
      });
      notification.show();
    }
  }
);
