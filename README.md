# 图片压缩工具小程序

一个简单易用的微信小程序，用于压缩图片文件大小，支持批量处理。

## 功能特点

### 1. 图片上传
- 支持点击或拖拽上传图片
- 支持 PNG、JPG 格式
- 单次最多可上传 4 张图片
- 实时显示已上传图片数量

### 2. 压缩设置
- 可调节压缩质量（1-100%）
- 滑块实时预览压缩效果
- 压缩设置区域固定显示，方便调节

### 3. 图片处理
- 自动压缩上传的图片
- 显示处理进度和状态
- 支持批量处理多张图片
- 显示原始大小和压缩后大小
- 显示压缩比率

### 4. 图片预览
- 网格式布局展示图片
- 每张图片显示详细信息：
  - 原始大小
  - 压缩后大小
  - 压缩率

### 5. 下载功能
- 支持批量下载所有压缩后的图片
- 显示下载进度（x/总数）
- 下载完成后显示成功提示

### 6. 其他功能
- 一键返回初始状态
- 加载状态提示
- 错误处理和提示

## 技术特点

### 性能优化
- 使用按需注入（requiredComponents）
- 使用用时注入（placeholder）
- 优化代码包体积和启动速度

### 界面设计
- 简洁直观的操作界面
- 响应式布局
- 统一的视觉风格
- 友好的交互反馈

### 用户体验
- 实时反馈处理状态
- 清晰的进度提示
- 操作简单直观
- 支持批量操作

## 使用说明

1. 点击上传区域或拖拽图片到上传区域
2. 通过滑块调节压缩质量
3. 等待图片处理完成
4. 点击"批量下载全部图片"保存处理后的图片
5. 需要重新开始时，点击"返回"按钮

## 注意事项

- 基础库版本要求：2.11.2 及以上
- 开发工具版本要求：1.05.2111300 及以上
- 调试时基础库需要选择 2.20.1 及以上版本
- 图片格式仅支持 PNG、JPG
- 单次最多处理 4 张图片 