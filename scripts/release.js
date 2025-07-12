const fs = require('fs');
const { execSync } = require('child_process');

// 读取命令行参数
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('请提供版本号，例如: node scripts/release.js 1.0.1');
    process.exit(1);
}

const newVersion = args[0];

// 验证版本号格式（语义化版本）
const versionRegex = /^\d+\.\d+\.\d+$/;
if (!versionRegex.test(newVersion)) {
    console.error('版本号格式不正确，请使用语义化版本格式（如：1.0.1）');
    process.exit(1);
}

try {
    // 更新 package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, '\t') + '\n');
    console.log(`✅ 已更新 package.json 版本到 ${newVersion}`);

    // 更新 manifest.json
    const manifestJson = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    manifestJson.version = newVersion;
    fs.writeFileSync('manifest.json', JSON.stringify(manifestJson, null, '\t') + '\n');
    console.log(`✅ 已更新 manifest.json 版本到 ${newVersion}`);

    // 更新 versions.json
    const versionsJson = JSON.parse(fs.readFileSync('versions.json', 'utf8'));
    versionsJson[newVersion] = manifestJson.minAppVersion;
    fs.writeFileSync('versions.json', JSON.stringify(versionsJson, null, '\t') + '\n');
    console.log(`✅ 已更新 versions.json`);

    // 构建插件
    console.log('🔨 正在构建插件...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 插件构建完成');

    // 提交更改
    console.log('📝 提交版本更改...');
    execSync('git add package.json manifest.json versions.json main.js', { stdio: 'inherit' });
    execSync(`git commit -m "Release version ${newVersion}"`, { stdio: 'inherit' });
    console.log('✅ 已提交版本更改');

    // 创建标签
    console.log('🏷️  创建版本标签...');
    execSync(`git tag ${newVersion}`, { stdio: 'inherit' });
    console.log(`✅ 已创建标签 ${newVersion}`);

    console.log('\n🎉 版本发布准备完成！');
    console.log('请运行以下命令推送到远程仓库：');
    console.log(`git push origin master && git push origin ${newVersion}`);
    console.log('\n这将触发 GitHub Action 自动创建 release。');

} catch (error) {
    console.error('❌ 发布过程中出现错误:', error.message);
    process.exit(1);
} 