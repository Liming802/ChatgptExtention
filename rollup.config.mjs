import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';

export default {
  input: 'mater.js', // 入口文件
  output: {
    file: 'dist/content.bundle.js', // 输出文件
    format: 'iife', // 使用 IIFE 格式，适合浏览器
    sourcemap: false,
  },
  plugins: [
    resolve(), // 解析 node_modules
    commonjs(), // 转换 CommonJS 模块
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env'],
    }),
  ],
};
