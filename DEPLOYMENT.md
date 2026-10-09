# FitOS 部署说明

FitOS 是纯静态网站。仓库现已包含 GitHub Pages Actions 工作流：校验计算测试后，只发布运行所需的 HTML、CSS、JavaScript、manifest、service worker 和图标文件。

## 发布到 GitHub Pages

1. 将项目推送至 GitHub 仓库。
2. 在仓库 **Settings → Pages → Build and deployment** 中将来源设为 **GitHub Actions**。
3. 向 `main` 或 `master` 推送提交，或在 **Actions** 页面手动运行 **Deploy FitOS to GitHub Pages**。
4. 等待校验和部署任务成功后，从 Actions 的 deployment 环境查看 HTTPS 网站地址。项目页面通常形如 `https://<账号>.github.io/<仓库名>/`。

GitHub Free 的 Pages 适用于公开仓库；公开仓库会公开项目源代码。GitHub Pages 访问日志会记录访客 IP。请在公开前确认仓库没有密钥、私人照片、备份文件或个人记录。工作流只发布网站运行文件，不会发布 README、部署文档和 PowerShell 启动器。

## 本地预览

在 Windows 双击 `启动 FitOS.bat`，或运行 `node serve.mjs`。`serve.ps1`/`serve.mjs` 会显示局域网地址，同 Wi-Fi 的手机可临时访问。临时局域网 HTTP 用于预览，不提供 HTTPS 的 PWA 安装与 service worker 能力。

## 数据与隐私

网站公开后，任何人都可打开 FitOS，但每个人的档案与记录仍保存在自己的浏览器 IndexedDB 中，不会同步给你或其他访问者。不要在网页源码或仓库中放 API Key。浏览器直连 AI 有密钥暴露与 CORS 限制。

