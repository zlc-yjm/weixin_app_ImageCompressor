// pages/index/index.js
/**
 * 图片压缩页面
 */
Page({
  data: {
    imageList: [], // 图片列表，每个元素包含原始图片和压缩后的信息
    quality: 80, // 压缩质量
    isDragging: false, // 是否正在拖拽
    isProcessing: false, // 是否正在处理中
    downloadCount: 0 // 已下载图片计数
  },

  /**
   * 选择图片
   */
  chooseImage() {
    wx.chooseMedia({
      count: 4, // 最多选择4张图片
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 处理选中的图片
        const tempFiles = res.tempFiles;
        const newImageList = tempFiles.map(file => ({
          originalPath: file.tempFilePath,
          originalSize: this.formatFileSize(file.size),
          originalSizeBytes: file.size,
          compressedPath: '',
          compressedSize: '0KB',
          compressedSizeBytes: 0,
          status: 'pending' // pending, processing, done, error
        }));

        this.setData({
          imageList: [...this.data.imageList, ...newImageList].slice(0, 4), // 限制最多4张
          isProcessing: true
        }, () => {
          // 开始压缩新添加的图片
          this.processImages();
        });
      }
    });
  },

  /**
   * 处理图片队列
   */
  async processImages() {
    const { imageList, quality } = this.data;
    const pendingImages = imageList.filter(img => img.status === 'pending');

    for (let i = 0; i < pendingImages.length; i++) {
      const currentImage = pendingImages[i];
      const index = imageList.findIndex(img => img.originalPath === currentImage.originalPath);

      // 更新状态为处理中
      this.updateImageStatus(index, 'processing');

      try {
        // 压缩图片
        const compressedImage = await this.compressImage(currentImage.originalPath);
        const fileInfo = await this.getFileInfo(compressedImage);

        // 更新压缩后的信息
        this.updateImageInfo(index, {
          compressedPath: compressedImage,
          compressedSize: this.formatFileSize(fileInfo.size),
          compressedSizeBytes: fileInfo.size,
          compressionRatio: ((1 - fileInfo.size/currentImage.originalSizeBytes) * 100).toFixed(1),
          status: 'done'
        });
      } catch (error) {
        this.updateImageStatus(index, 'error');
        wx.showToast({
          title: '压缩失败',
          icon: 'none'
        });
      }
    }

    this.setData({ isProcessing: false });
  },

  /**
   * 压缩单张图片
   * @param {string} imagePath - 图片路径
   * @returns {Promise<string>} 压缩后的图片路径
   */
  compressImage(imagePath) {
    return new Promise((resolve, reject) => {
      wx.compressImage({
        src: imagePath,
        quality: this.data.quality,
        success: (res) => resolve(res.tempFilePath),
        fail: reject
      });
    });
  },

  /**
   * 获取文件信息
   * @param {string} filePath - 文件路径
   * @returns {Promise<Object>} 文件信息
   */
  getFileInfo(filePath) {
    return new Promise((resolve, reject) => {
      wx.getFileInfo({
        filePath,
        success: resolve,
        fail: reject
      });
    });
  },

  /**
   * 更新图片状态
   * @param {number} index - 图片索引
   * @param {string} status - 新状态
   */
  updateImageStatus(index, status) {
    this.setData({
      [`imageList[${index}].status`]: status
    });
  },

  /**
   * 更新图片信息
   * @param {number} index - 图片索引
   * @param {Object} info - 更新的信息
   */
  updateImageInfo(index, info) {
    this.setData({
      [`imageList[${index}]`]: {
        ...this.data.imageList[index],
        ...info
      }
    });
  },

  /**
   * 质量滑块改变事件
   */
  onQualityChange(e) {
    const quality = e.detail.value;
    this.setData({ 
      quality,
      imageList: this.data.imageList.map(img => ({
        ...img,
        status: img.status === 'done' ? 'pending' : img.status
      }))
    }, () => {
      // 重新压缩所有图片
      if (this.data.imageList.length > 0) {
        this.setData({ isProcessing: true }, () => {
          this.processImages();
        });
      }
    });
  },

  /**
   * 保存压缩后的图片
   * @param {Object} e - 事件对象
   */
  saveImage(e) {
    const { index } = e.currentTarget.dataset;
    const image = this.data.imageList[index];
    
    if (!image.compressedPath || image.status !== 'done') return;
    
    wx.saveImageToPhotosAlbum({
      filePath: image.compressedPath,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 删除图片
   * @param {Object} e - 事件对象
   */
  deleteImage(e) {
    const { index } = e.currentTarget.dataset;
    const imageList = this.data.imageList.filter((_, i) => i !== index);
    this.setData({ imageList });
  },

  /**
   * 格式化文件大小
   * @param {number} size - 文件大小（字节）
   * @returns {string} 格式化后的大小
   */
  formatFileSize(size) {
    if (size < 1024) {
      return size + 'B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + 'KB';
    } else {
      return (size / 1024 / 1024).toFixed(2) + 'MB';
    }
  },

  /**
   * 批量下载所有图片
   */
  async downloadAllImages() {
    if (this.data.imageList.length === 0) return;
    
    wx.showLoading({ title: '正在保存...' });
    let downloadCount = 0;
    
    try {
      for (const image of this.data.imageList) {
        if (image.status !== 'done') continue;
        await new Promise((resolve, reject) => {
          wx.saveImageToPhotosAlbum({
            filePath: image.compressedPath,
            success: () => {
              downloadCount++;
              this.setData({ downloadCount });
              wx.showLoading({
                title: `已保存 ${downloadCount}/${this.data.imageList.length} 张`,
                mask: true
              });
              resolve();
            },
            fail: reject
          });
        });
      }
      
      wx.showToast({
        title: `已保存 ${downloadCount} 张图片`,
        icon: 'success',
        duration: 2000
      });
    } catch (error) {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
      this.setData({ downloadCount: 0 });
    }
  },

  /**
   * 返回上一页
   */
  goBack() {
    this.setData({
      imageList: [],
      quality: 80,
      isDragging: false,
      isProcessing: false,
      downloadCount: 0
    });
  }
});