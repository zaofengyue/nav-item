const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const config = require('./config');

const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const db = new sqlite3.Database(path.join(dbDir, 'nav.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    "order" INTEGER DEFAULT 0
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_menus_order ON menus("order")`);

  db.run(`CREATE TABLE IF NOT EXISTS sub_menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    FOREIGN KEY(parent_id) REFERENCES menus(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_sub_menus_parent_id ON sub_menus(parent_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_sub_menus_order ON sub_menus("order")`);

  db.run(`CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_id INTEGER,
    sub_menu_id INTEGER,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    logo_url TEXT,
    custom_logo_path TEXT,
    desc TEXT,
    "order" INTEGER DEFAULT 0,
    FOREIGN KEY(menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    FOREIGN KEY(sub_menu_id) REFERENCES sub_menus(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_cards_menu_id ON cards(menu_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_cards_sub_menu_id ON cards(sub_menu_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_cards_order ON cards("order")`);
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
  db.run(`CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    position TEXT NOT NULL,
    img TEXT NOT NULL,
    url TEXT NOT NULL
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_ads_position ON ads(position)`);
  db.run(`CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    logo TEXT
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_friends_title ON friends(title)`);

  db.get('SELECT COUNT(*) as count FROM menus', (err, row) => {
    if (row && row.count === 0) {
      const defaultMenus = [
        ['Home', 1],
        ['Ai Stuff', 2],
        ['Cloud', 3],
        ['Container', 4],
        ['Software', 5],
        ['Tools', 5],
        ['Mail', 7],
        ['Domain', 8]
      ];
      const stmt = db.prepare('INSERT INTO menus (name, "order") VALUES (?, ?)');
      defaultMenus.forEach(([name, order]) => stmt.run(name, order));
      stmt.finalize(() => {
        console.log('菜单插入完成，开始插入默认卡片...');
        insertDefaultCards();
      });
    }
  });

  function insertDefaultCards() {
    db.all('SELECT * FROM menus ORDER BY "order"', (err, menus) => {
      if (err) {
        console.error('获取菜单失败:', err);
        return;
      }

      if (menus && menus.length) {
        const menuMap = {};
        menus.forEach(m => { menuMap[m.name] = m.id; });

        const cards = [
            // Home
            { menu: 'Home', title: 'Youtube', url: 'https://www.youtube.com', logo_url: 'https://img.icons8.com/ios-filled/100/ff1d06/youtube-play.png', desc: '全球最大的视频社区', order: 0 },
            { menu: 'Home', title: 'Netlify', url: 'https://www.netlify.com', logo_url: 'http://netlify.com/favicon/favicon.ico', desc: '', order: 0 },
            { menu: 'Home', title: 'Vercel', url: 'https://vercel.com', logo_url: '', desc: '', order: 0 },
            { menu: 'Home', title: 'GitHub', url: 'https://github.com', logo_url: '', desc: '全球最大的代码托管平台', order: 0 },
            { menu: 'Home', title: 'Gitlab', url: 'https://gitlab.com', logo_url: '', desc: '', order: 0 },
            { menu: 'Home', title: 'Cloudflare', url: 'https://dash.cloudflare.com', logo_url: '', desc: '全球最大的cdn服务商', order: 0 },
            { menu: 'Home', title: '浏览器指纹', url: 'https://www.browserscan.net/zh', logo_url: '', desc: '浏览器指纹查询', order: 0 },
            { menu: 'Home', title: 'ip.sb', url: 'https://ip.sb', logo_url: '', desc: 'ip地址查询', order: 0 },
            { menu: 'Home', title: 'ITDOG - 在线ping', url: 'https://www.itdog.cn/tcping', logo_url: '', desc: '在线tcping', order: 0 },
            { menu: 'Home', title: 'IPPure', url: 'https://ippure.com/', logo_url: '', desc: 'ip地址查询', order: 0 },
            { menu: 'Home', title: 'Check ProxyIP', url: 'https://proxy.194216.xyz', logo_url: '', desc: '', order: 0 },
            { menu: 'Home', title: '代理检测工具', url: 'https://socks.194216.xyz', logo_url: 'https://nezha.wiki/logo.png', desc: '', order: 0 },
            { menu: 'Home', title: 'Wasmer', url: 'https://wasmer.io', logo_url: '', desc: '', order: 0 },
            { menu: 'Home', title: 'Dcdeploy', url: 'https://dcdeploy.com', logo_url: 'https://dcdeploy.com/wp-content/uploads/2023/05/logoSVG.png', desc: '', order: 0 },
            { menu: 'Home', title: 'Northflank', url: 'https://app.northflank.com', logo_url: '', desc: '', order: 0 },
            { menu: 'Home', title: 'Render', url: 'https://dashboard.render.com', logo_url: 'https://dashboard.render.com/favicon-light.png', desc: '', order: 0 },
            { menu: 'Home', title: 'Alwaysdata', url: 'https://admin.alwaysdata.com', logo_url: 'https://static.alwaysdata.com/media/reseller/1/theme/favicon_kfxZA8s.png', desc: '', order: 0 },
            { menu: 'Home', title: 'Railway', url: 'https://railway.com/dashboard', logo_url: '', desc: '', order: 0 },
            { menu: 'Home', title: '在线电影', url: 'https://kvideo.alwaysdata.net', logo_url: 'https://img.icons8.com/color/240/cinema---v1.png', desc: '在线电影', order: 0 },
            { menu: 'Home', title: '在线音乐', url: 'https://music.fengyue.art', logo_url: 'https://s1.music.126.net/style/favicon.ico?v20180823', desc: '在线音乐', order: 0 },
            { menu: 'Home', title: '订阅转换', url: 'https://sublink.alwaysdata.net', logo_url: 'https://img.icons8.com/color/96/link--v1.png', desc: '订阅转换工具', order: 0 },
            { menu: 'Home', title: 'Webssh', url: 'https://webssh.alwaysdata.net', logo_url: 'https://img.icons8.com/fluency/240/ssh.png', desc: 'webssh终端管理工具', order: 0 },
            { menu: 'Home', title: 'Openlist', url: 'https://cmliu.alwaysdata.net', logo_url: '', desc: '云盘管理工具', order: 0 },
            { menu: 'Home', title: '真实地址生成', url: 'https://address.194216.xyz', logo_url: 'https://static11.meiguodizhi.com/favicon.ico', desc: '基于当前ip生成真实的地址', order: 0 },
            // Ai Stuff
            { menu: 'Ai Stuff', title: 'ChatGPT', url: 'https://chat.openai.com', logo_url: 'https://cdn.oaistatic.com/assets/favicon-eex17e9e.ico', desc: 'OpenAI官方AI对话', order: 0 },
            { menu: 'Ai Stuff', title: 'Deepseek', url: 'https://www.deepseek.com', logo_url: 'https://cdn.deepseek.com/chat/icon.png', desc: 'Deepseek AI搜索', order: 0 },
            { menu: 'Ai Stuff', title: 'Claude', url: 'https://claude.ai', logo_url: 'https://img.icons8.com/fluency/240/claude-ai.png', desc: 'Anthropic Claude AI', order: 0 },
            { menu: 'Ai Stuff', title: 'Google Gemini', url: 'https://gemini.google.com', logo_url: 'https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg', desc: 'Google Gemini大模型', order: 0 },
            { menu: 'Ai Stuff', title: '阿里千问', url: 'https://chat.qwenlm.ai', logo_url: 'https://g.alicdn.com/qwenweb/qwen-ai-fe/0.0.11/favicon.ico', desc: '阿里云千问大模型', order: 0 },
            { menu: 'Ai Stuff', title: 'Kimi', url: 'https://www.kimi.com', logo_url: '', desc: '月之暗面Moonshot AI', order: 0 },
            // Cloud
            { menu: 'Cloud', title: '阿里云', url: 'https://www.aliyun.com', logo_url: 'https://img.alicdn.com/tfs/TB1_ZXuNcfpK1RjSZFOXXa6nFXa-32-32.ico', desc: '阿里云官网', order: 0 },
            { menu: 'Cloud', title: '腾讯云', url: 'https://cloud.tencent.com', logo_url: '', desc: '腾讯云官网', order: 0 },
            { menu: 'Cloud', title: '甲骨文云', url: 'https://cloud.oracle.com', logo_url: '', desc: 'Oracle Cloud', order: 0 },
            { menu: 'Cloud', title: '亚马逊云', url: 'https://aws.amazon.com/cn/campaigns/aws-cloudserver-ps/?sc_channel=PS&sc_campaign=acquisition_CN&sc_publisher=google&sc_category=pc&sc_medium=Google_%E5%93%81%E7%89%8C%E9%80%9A%E7%94%A8_%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8_b&sc_content=%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8_%E6%99%BA&sc_detail=%E4%BA%9A%E9%A9%AC%E9%80%8A%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8&sc_segment=%E8%B0%B7%E6%AD%8CJK-AWS%20b2&sc_matchtype=broad&sc_country=CN&trk=21c8cefe-b498-4751-8ef1-bb34afbfd50f&s_kwcid=AL!4422!3!566871911210!b!!g!!%E4%BA%9A%E9%A9%AC%E9%80%8A%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8&ef_id=EAIaIQobChMI_vagueH6jQMV-toWBR2IiAO0EAAYASAAEgJQdPD_BwE:G:s&s_kwcid=AL!4422!3!566871911210!b!!g!!%E4%BA%9A%E9%A9%AC%E9%80%8A%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8!14743601034!132571766827&gad_campaignid=14743601034&gbraid=0AAAAABHiKn892ZFYGwxdVSLJ3pqopq4yi&gclid=EAIaIQobChMI_vagueH6jQMV-toWBR2IiAO0EAAYASAAEgJQdPD_BwE', logo_url: 'https://img.icons8.com/color/144/amazon-web-services.png', desc: 'Amazon AWS', order: 0 },
            { menu: 'Cloud', title: 'DigitalOcean', url: 'https://www.digitalocean.com', logo_url: 'https://www.digitalocean.com/_next/static/media/apple-touch-icon.d7edaa01.png', desc: 'DigitalOcean VPS', order: 0 },
            { menu: 'Cloud', title: 'Vultr', url: 'https://www.vultr.com', logo_url: '', desc: 'Vultr VPS', order: 0 },
            { menu: 'Cloud', title: '魔塔社区', url: 'https://www.modelscope.cn/home', logo_url: 'https://g.alicdn.com/sail-web/maas/2.13.63/favicon/128.ico', desc: '云主机', order: 0 },
            { menu: 'Cloud', title: 'Zo computer', url: 'https://fengyue.zo.computer', logo_url: '', desc: '云电脑', order: 0 },
            { menu: 'Cloud', title: 'Hi168', url: 'https://www.hi168.com/#/desktop', logo_url: '', desc: '免费S3存储', order: 0 },
            { menu: 'Cloud', title: 'Adkynet', url: 'https://manager.adkynet.com', logo_url: 'https://manager.adkynet.com/assets/img/logo.png', desc: '月抛机', order: 1 },
            { menu: 'Cloud', title: 'CT8', url: 'https://panel.ct8.pl', logo_url: '', desc: '', order: 2 },
            { menu: 'Cloud', title: 'Skybots', url: 'https://skybots.tech/dashboard/mes-bots', logo_url: 'https://skybots.tech/images/skybots.png', desc: '6h续期', order: 3 },
            { menu: 'Cloud', title: 'Wispbyte', url: 'https://wispbyte.com/client/dashboard', logo_url: 'https://wispbyte.com/client/assets/wispbyte_blue_nobg.webp', desc: '', order: 4 },
            { menu: 'Cloud', title: 'SAP企业版', url: 'https://emea.cockpit.btp.cloud.sap/cockpit/#', logo_url: '', desc: '', order: 5 },
            { menu: 'Cloud', title: 'SPA试用版', url: 'https://account.hanatrial.ondemand.com/trial/#/home/trial', logo_url: '', desc: '', order: 6 },
            // Software
            { menu: 'Software', title: 'Hellowindows', url: 'https://hellowindows.cn', logo_url: 'https://hellowindows.cn/logo-s.png', desc: 'windows系统及office下载', order: 0 },
            { menu: 'Software', title: '奇迹秀', url: 'https://www.qijishow.com/down', logo_url: 'https://www.qijishow.com/img/ico.ico', desc: '设计师的百宝箱', order: 0 },
            { menu: 'Software', title: '易破解', url: 'https://www.ypojie.com', logo_url: 'https://www.ypojie.com/favicon.ico', desc: '精品windows软件', order: 0 },
            { menu: 'Software', title: '软件先锋', url: 'https://topcracked.com', logo_url: 'https://cdn.mac89.com/win_macxf_node/static/favicon.ico', desc: '精品windows软件', order: 0 },
            { menu: 'Software', title: 'Macwk', url: 'https://www.macwk.com', logo_url: 'https://www.macwk.com/favicon-32x32.ico', desc: '精品Mac软件', order: 0 },
            { menu: 'Software', title: 'Macsc', url: 'https://mac.macsc.com', logo_url: 'https://cdn.mac89.com/macsc_node/static/favicon.ico', desc: '', order: 0 },
            // Tools
            { menu: 'Tools', title: 'JSON工具', url: 'https://www.json.cn', logo_url: 'https://img.icons8.com/nolan/128/json.png', desc: 'JSON格式化/校验', order: 0 },
            { menu: 'Tools', title: 'base64工具', url: 'https://www.qqxiuzi.cn/bianma/base64.htm', logo_url: 'https://cdn.base64decode.org/assets/images/b64-180.webp', desc: '在线base64编码解码', order: 0 },
            { menu: 'Tools', title: '二维码生成', url: 'https://cli.im', logo_url: 'https://img.icons8.com/fluency/96/qr-code.png', desc: '二维码生成工具', order: 0 },
            { menu: 'Tools', title: 'JS混淆', url: 'https://obfuscator.io', logo_url: 'https://img.icons8.com/color/240/javascript--v1.png', desc: '在线Javascript代码混淆', order: 0 },
            { menu: 'Tools', title: 'Python混淆', url: 'https://freecodingtools.org/tools/obfuscator/python', logo_url: 'https://img.icons8.com/color/240/python--v1.png', desc: '在线python代码混淆', order: 0 },
            { menu: 'Tools', title: 'Remove.photos', url: 'https://remove.photos/zh-cn', logo_url: 'https://img.icons8.com/doodle/192/picture.png', desc: '一键抠图', order: 0 },
            { menu: 'Tools', title: 'UptimeRobot', url: 'https://dashboard.uptimerobot.com', logo_url: '', desc: '监控机器人', order: 0 },
            { menu: 'Tools', title: 'animepfp', url: 'https://animepfp.app', logo_url: '', desc: '二次元头像', order: 0 },
            { menu: 'Tools', title: 'animeprofile', url: 'https://animeprofile.com', logo_url: '', desc: '二次元图片', order: 0 },
            { menu: 'Tools', title: 'JavaScript混淆加密', url: 'https://toolonline.net/js-obfuscator', logo_url: '', desc: '在线Javascript代码混淆', order: 0 },
            { menu: 'Tools', title: '免费接码', url: 'https://sms-receive.net', logo_url: '', desc: '免费接收短信验证码', order: 0 },
            { menu: 'Tools', title: '美国地址生成器', url: 'https://www.meiguodizhi.com', logo_url: 'https://static11.meiguodizhi.com/favicon.ico', desc: '', order: 1 },
            // Mail
            { menu: 'Mail', title: 'Gmail', url: 'https://mail.google.com', logo_url: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico', desc: 'Google邮箱', order: 0 },
            { menu: 'Mail', title: 'Outlook', url: 'https://outlook.live.com', logo_url: 'https://img.icons8.com/color/256/ms-outlook.png', desc: '微软Outlook邮箱', order: 0 },
            { menu: 'Mail', title: 'Proton Mail', url: 'https://account.proton.me', logo_url: 'https://account.proton.me/assets/apple-touch-icon-120x120.png', desc: '安全加密邮箱', order: 0 },
            { menu: 'Mail', title: 'QQ邮箱', url: 'https://mail.qq.com', logo_url: 'https://mail.qq.com/zh_CN/htmledition/images/favicon/qqmail_favicon_96h.png', desc: '腾讯QQ邮箱', order: 0 },
            { menu: 'Mail', title: '雅虎邮箱', url: 'https://mail.yahoo.com', logo_url: '', desc: '雅虎邮箱', order: 0 },
            { menu: 'Mail', title: '临时邮箱', url: 'https://tempmail100.com', logo_url: 'https://tempmail100.com/assets/image/logo2.webp', desc: '', order: 0 },
            { menu: 'Mail', title: '私人邮箱', url: 'https://mail.sls.xx.kg/inbox', logo_url: 'https://linshiyouxiang.net/static/index/zh/images/favicon.ico', desc: '风月的私人邮箱', order: 1 },
            { menu: 'Mail', title: '免费EDU邮箱', url: 'https://jhb.edu.kg/login', logo_url: 'https://zmkk.edu.kg/assets/favicon-C5dAZutX.svg', desc: '免费EDU邮箱-Joey Blog', order: 2 },
            { menu: 'Mail', title: '康康的订阅天地', url: 'https://zmkk.edu.kg/login', logo_url: 'https://zmkk.edu.kg/assets/favicon-C5dAZutX.svg', desc: '免费EDU邮箱', order: 3 },
            // Container
            { menu: 'Container', title: 'Adkynet', url: 'https://manager.adkynet.com', logo_url: 'https://manager.adkynet.com/assets/img/logo.png', desc: '月抛机', order: 0 },
            { menu: 'Container', title: 'CT8', url: 'https://panel.ct8.pl', logo_url: '', desc: '', order: 0 },
            { menu: 'Container', title: 'Skybots', url: 'https://skybots.tech/dashboard/mes-bots', logo_url: 'https://skybots.tech/images/skybots.png', desc: '续期法国机', order: 0 },
            { menu: 'Container', title: 'Wispbyte', url: 'https://wispbyte.com/client/dashboard', logo_url: 'https://wispbyte.com/client/assets/wispbyte_blue_nobg.webp', desc: '', order: 0 },
            { menu: 'Container', title: 'SAP企业版', url: 'https://emea.cockpit.btp.cloud.sap/cockpit/#', logo_url: '', desc: 'SAP企业版入口', order: 0 },
            { menu: 'Container', title: 'SAP试用版', url: 'https://account.hanatrial.ondemand.com/trial/#/home/trial', logo_url: '', desc: 'SAP试用版入口', order: 0 },
            { menu: 'Container', title: 'Katabump', url: 'https://katabump.com', logo_url: 'https://katabump.com/assets/images/favicon.png', desc: '', order: 0 },
            { menu: 'Container', title: 'Idx', url: 'https://idx.google.com', logo_url: 'https://www.gstatic.com/monospace/250314/favicon.ico', desc: '', order: 0 },
            { menu: 'Container', title: 'Karlo', url: 'https://karlo-hosting.com', logo_url: 'https://karlo-hosting.com/_next/static/media/MongoDB_Logo.037sd5jzbkh1s.svg', desc: '', order: 0 },
            // Domain
            { menu: 'Domain', title: 'L53', url: 'https://customer.l53.net', logo_url: '', desc: '年抛域名', order: 0 },
            { menu: 'Domain', title: 'Cloudns', url: 'https://www.cloudns.net/main', logo_url: '', desc: '', order: 0 },
            { menu: 'Domain', title: 'DigitalPlat', url: 'https://domain.digitalplat.org/#home', logo_url: '', desc: '每年续期', order: 0 },
            { menu: 'Domain', title: 'HiDNS', url: 'https://www.hidoha.net', logo_url: 'https://www.hidoha.net/themes/huraga/assets/favicon.ico', desc: '', order: 0 },
            { menu: 'Domain', title: 'DNSHE', url: 'https://my.dnshe.com/index.php?m=cloudflare_subdomain', logo_url: '', desc: '', order: 0 },
            { menu: 'Domain', title: 'nic.ua', url: 'https://nic.ua/en/my/domains', logo_url: '', desc: '乌克兰域名，每年续期', order: 0 },
            { menu: 'Domain', title: 'Indevs', url: 'https://domain.stackryze.com/my-domains', logo_url: '', desc: '印度域名，每年续期', order: 0 },
            { menu: 'Domain', title: 'GNAME', url: 'https://www.gname.net/user#/admin_ym', logo_url: 'https://file-sg.gname.net/f/favicon.ico', desc: '每年续期', order: 0 },
            { menu: 'Domain', title: 'Onamae', url: 'https://navi.onamae.com/domain/setting/renew/list', logo_url: 'https://navi.onamae.com/Content/images/common/favicon_32x32.png', desc: '年抛一级域名', order: 0 },
            { menu: 'Domain', title: 'NicNames', url: 'https://nicnames.com/en/my', logo_url: '', desc: '年抛一级域名', order: 0 },
            { menu: 'Domain', title: 'Spaceship', url: 'https://www.spaceship.com', logo_url: 'https://spaceship-cdn.com/static/spaceship/favicon/spaceship-icon.svg', desc: '', order: 0 },
            { menu: 'Domain', title: 'vps8', url: 'https://vps8.zz.cd/order/service/domain', logo_url: 'https://vps8.zz.cd/themes/vps8/assets/img/favicon.ico', desc: '', order: 0 },
        ];

        const cardStmt = db.prepare('INSERT INTO cards (menu_id, sub_menu_id, title, url, logo_url, desc, "order") VALUES (?, ?, ?, ?, ?, ?, ?)');
        let cardInsertCount = 0;

        cards.forEach(card => {
          if (menuMap[card.menu]) {
            cardStmt.run(menuMap[card.menu], null, card.title, card.url, card.logo_url, card.desc, card.order || 0, function(err) {
              if (err) {
                console.error(`插入卡片失败 [${card.menu}] ${card.title}:`, err);
              } else {
                cardInsertCount++;
              }
            });
          } else {
            console.warn(`未找到菜单: ${card.menu}`);
          }
        });

        cardStmt.finalize(() => {
          console.log(`所有卡片插入完成，总计: ${cardInsertCount} 张卡片`);
        });
      } else {
        console.log('未找到任何菜单');
      }
    });
  }

  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (row && row.count === 0) {
      const passwordHash = bcrypt.hashSync(config.admin.password, 10);
      db.run('INSERT INTO users (username, password) VALUES (?, ?)', [config.admin.username, passwordHash]);
    }
  });

  db.get('SELECT COUNT(*) as count FROM friends', (err, row) => {
    if (row && row.count === 0) {
      const defaultFriends = [
        ['Check ProxyIP', 'https://proxy.fengyue.bond', 'https://www.nodeseek.com/static/image/favicon/favicon-32x32.png'],
        ['Check Socks5', 'https://socks.fengyue.bond', 'https://fontawesome.com/favicon.ico'],
        ['vpngate', 'https://www.vpngate.net/cn', '']
      ];
      const stmt = db.prepare('INSERT INTO friends (title, url, logo) VALUES (?, ?, ?)');
      defaultFriends.forEach(([title, url, logo]) => stmt.run(title, url, logo));
      stmt.finalize();
    }
  });

  db.run(`ALTER TABLE users ADD COLUMN last_login_time TEXT`, [], () => {});
  db.run(`ALTER TABLE users ADD COLUMN last_login_ip TEXT`, [], () => {});
});


module.exports = db;
