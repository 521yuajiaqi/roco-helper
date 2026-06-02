<p align="center">
  <img src="public/assets/icon.png" alt="洛克王国助手" width="120" />
</p>

<h1 align="center">洛克王国助手</h1>

<p align="center">
  洛克王国手游图鉴攻略 APP，基于 Vue 3 + Capacitor 构建，支持 Android / iOS。
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js" />
  <img src="https://img.shields.io/badge/Capacitor-6-119EFF?logo=capacitor" />
  <img src="https://img.shields.io/badge/Android-APK-3DDC84?logo=android" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
</p>

---

## 作者的一些话

本项目为vibe codeing项目,源码自取，仅供个人学习，如有同样爱好的人可以沟通本人。

本项目的数据后续会继续更新，数据处理是一项关键技能，我会慢慢自己爬取更新数据和更多功能。

## 功能

- **宠物图鉴** — 371 只精灵，按名称/拼音/属性/编号多维搜索
- **宠物详情** — 种族值图表、性格推荐、469 个技能（16,309 条关联）、属性克制分析
- **队伍推荐** — 133 支热门队伍，可查看配招、性格、血脉，点击精灵名跳转详情
- **属性计算器** — 18×18 属性克制表，支持双属性计算

## 下载

前往 [Releases](../../releases) 页面下载最新 APK。在安装时，如果弹出提示，选择“允许来自此来源的应用”或“继续安装”。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3 + Vite |
| 移动端 | Capacitor 6 |
| UI | Vant 4 |
| 图表 | ECharts |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 数据 | JSON + SQLite |

## 数据来源

精灵数据来自 [rocom-data](https://github.com/AofeiLi-code/rocom-data)（BWIKI 爬虫），感谢数据贡献者。

数据转换脚本：`scripts/convert-data.js`

## License

MIT
