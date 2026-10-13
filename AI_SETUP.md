# FitOS AI 配置

当前实现兼容 OpenAI Chat Completions 格式的浏览器直连服务。

在“AI 私人教练”页面提供 Base URL、模型名称和 API Key。API Key 在当前标签页以 `sessionStorage` 方式短暂保存，关闭标签页后清除。Base URL 与模型名保存在本地 IndexedDB。连接测试将发送简单请求；建议生成仅在点击后发送该任务所需的档案摘要和少量近期记录。

浏览器直连不适合将密钥用于公开网站。密钥可能被浏览器开发工具、恶意扩展或页面脚本读取。浏览器跨域策略也可能阻止调用，出现网络错误时并不一定是模型不可用。生产环境更适合自托管并在服务端环境变量中保存密钥的代理；当前仓库没有提供代理实现。

## 视觉模型与饮食照片识别

FitOS 在饮食页提供照片识别入口，使用 OpenAI Chat Completions 多模态 `image_url` 数据块。需要视觉输入模型；例如 DeepSeek 官方视觉指南说明 `deepseek-flash` 接受图片与文字混合输入：<https://api-docs.deepseek.com/guides/vision/>。Base URL 使用服务商要求的兼容 API 地址，模型名称和跨域可用性以服务商实际说明为准。识别结果是估算，必须在应用中核对分量和营养值后确认。

API Key 仅保存在当前设备浏览器的 localStorage，方便该设备后续使用；不会被放进同步快照或 FitOS JSON 备份。每台设备需要各自配置一次。照片会在用户主动识别时发送给服务商。请勿上传不希望外传的照片。
