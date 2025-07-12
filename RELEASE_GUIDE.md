# Easy Reference 插件发布指南

本指南说明如何为 Easy Reference Obsidian 插件创建新版本发布。

## 自动发布流程

### 方法一：使用发布脚本（推荐）

1. **运行发布脚本**：
   ```bash
   npm run release 1.0.1
   ```
   
   脚本会自动：
   - 更新 `package.json`、`manifest.json` 和 `versions.json` 中的版本号
   - 构建插件（生成 `main.js`）
   - 提交更改到 git
   - 创建版本标签

2. **推送到远程仓库**：
   ```bash
   git push origin master && git push origin 1.0.1
   ```

3. **GitHub Action 自动处理**：
   - 当推送标签时，GitHub Action 会自动触发
   - 编译 TypeScript 源码
   - 创建 GitHub Release
   - 上传 `main.js`、`manifest.json` 和 `styles.css` 文件

### 方法二：手动版本管理

1. **更新版本号**：
   - 在 `manifest.json` 中更新 `version` 字段
   - 在 `package.json` 中更新 `version` 字段
   - 在 `versions.json` 中添加新版本条目

2. **构建插件**：
   ```bash
   npm run build
   ```

3. **提交更改并创建标签**：
   ```bash
   git add .
   git commit -m "Release version 1.0.1"
   git tag 1.0.1
   git push origin master && git push origin 1.0.1
   ```

### 方法三：手动触发 GitHub Action

1. 在 GitHub 仓库页面，转到 "Actions" 标签
2. 选择 "Release Obsidian Plugin" 工作流
3. 点击 "Run workflow"
4. 输入版本号（如：1.0.1）
5. 点击 "Run workflow" 按钮

## 版本号规范

遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **主版本号**：当你做了不兼容的 API 修改
- **次版本号**：当你做了向下兼容的功能性新增
- **修订号**：当你做了向下兼容的问题修正

示例：`1.0.0` → `1.0.1` → `1.1.0` → `2.0.0`

## 发布检查清单

在发布新版本之前，请确保：

- [ ] 代码已经过测试
- [ ] 更新了相关文档
- [ ] 版本号符合语义化版本规范
- [ ] `manifest.json` 中的版本号与标签一致
- [ ] 确认 `minAppVersion` 设置正确

## 文件说明

发布时会包含以下文件：

- **`main.js`**：编译后的插件主文件（必需）
- **`manifest.json`**：插件清单文件（必需）
- **`styles.css`**：插件样式文件（可选）

## 故障排除

### GitHub Action 失败

1. 检查 GitHub Actions 日志
2. 确认所有必需文件都存在
3. 验证版本号格式是否正确
4. 确认构建过程没有错误

### 版本号冲突

如果版本号已存在：
1. 删除本地标签：`git tag -d 1.0.1`
2. 删除远程标签：`git push origin --delete 1.0.1`
3. 使用新的版本号重新发布

## 联系信息

如有问题，请在 GitHub 仓库中创建 Issue。 