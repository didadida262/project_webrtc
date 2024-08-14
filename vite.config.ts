/*
 * @Description:
 * @Author: didadida262
 * @Date: 2024-07-25 01:16:22
 * @LastEditors: didadida262
 * @LastEditTime: 2024-08-14 16:37:03
 */
import path from "path";
import { defineConfig } from "vite";

import react from "@vitejs/plugin-react"; //removed swc

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 添加一个别名 "@", 指向项目的 src 目录
      "@": path.resolve(__dirname, "src"),
    },
  },
});
