require('dotenv').config();

module.exports = {
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || '123456'
  },
  server: {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'nav-item-jwt-secret-2024-secure-key'
  },
  site: {
    title: process.env.SITE_TITLE || '风月的导航站-个人专属导航页',
    logo: process.env.SITE_LOGO || 'https://image.yzfy.dpdns.org/2026/07/d420c456668e2bb6180919ba51c45fdf.png',
    background: process.env.SITE_BACKGROUND || 'https://image.yzfy.dpdns.org/2026/05/3701899e7ceb71d01acbdfa267d90e31.png'
  }
}; 
