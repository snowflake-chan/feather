# @box/cli

Creator CLI 的稳定协议包。它提供 API 版本、URL 构造、权限范围、请求校验和项目脚本写入适配器，供 Creator HTTP 路由与外部 CLI 共用。

该包不保存凭据、不验证用户身份、也不直接访问项目文件。调用方分别通过自己的凭据、认证和存储适配器完成这些工作，避免把 Next.js、Player Service 或引擎运行时耦合进 CLI 协议。
