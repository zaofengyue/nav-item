const express = require('express');
const config = require('../config');
const router = express.Router();

// 获取站点公开配置（名称、logo、背景图），供前端启动时拉取
router.get('/', (req, res) => {
  res.json({
    title: config.site.title,
    logo: config.site.logo,
    background: config.site.background
  });
});

module.exports = router;
