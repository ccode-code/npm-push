/**
 * npm 发布逻辑（Bun 版本）
 */
import { writeFileSync, readFileSync, existsSync, unlinkSync } from "fs";
import { join } from "path";
import ora from "ora";
import type { PublishConfig } from "./types";
import { updateChangelog, readChangelog } from "./utils/changelog";
import { t } from "./i18n";

/**
 * 读取 package.json 中的版本号
 */
function readPackageVersion(packagePath: string): string {
  const packageJsonPath = join(packagePath, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  return packageJson.version;
}

/**
 * 更新 package.json 中的版本号
 */
function updatePackageVersion(packagePath: string, newVersion: string): void {
  const packageJsonPath = join(packagePath, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  
  packageJson.version = newVersion;
  
  writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + "\n",
    "utf-8"
  );
}

/**
 * 恢复 package.json 中的版本号
 */
function restorePackageVersion(packagePath: string, oldVersion: string): void {
  updatePackageVersion(packagePath, oldVersion);
}

/**
 * 恢复 CHANGELOG.md 文件
 */
function restoreChangelog(packagePath: string, oldContent: string): void {
  const changelogPath = join(packagePath, "CHANGELOG.md");
  
  if (oldContent === "") {
    // 如果原始内容为空，说明原始没有 changelog 文件，删除新创建的文件（如果存在）
    if (existsSync(changelogPath)) {
      try {
        unlinkSync(changelogPath);
      } catch (error) {
        // 如果删除失败，尝试写入空内容（作为后备方案）
        writeFileSync(changelogPath, "", "utf-8");
      }
    }
  } else {
    // 恢复原始内容
    writeFileSync(changelogPath, oldContent, "utf-8");
  }
}

/**
 * 创建 git commit
 */
async function createGitCommit(packagePath: string, version: string, changelog: string): Promise<void> {
  // 构建 commit 消息
  const commitMessage = `chore: release ${version}\n\n${changelog.split('\n').map(line => line.trim()).filter(line => line).join('\n')}`;
  
  const proc = Bun.spawn(["git", "commit", "-a", "-m", commitMessage], {
    cwd: packagePath,
    stdout: "pipe",
    stderr: "pipe",
  });

  const exitCode = await proc.exited;
  
  if (exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text();
    // 如果没有变更，git commit 会失败，这是正常的
    if (stderr.includes("nothing to commit") || stderr.includes("no changes added to commit")) {
      return;
    }
    throw new Error(t("git.commitFailed", { exitCode, error: stderr.trim() }));
  }
}

/**
 * 推送代码到远程仓库（带超时）
 */
async function pushGitCode(packagePath: string, timeout: number = 10000): Promise<void> {
  const proc = Bun.spawn(["git", "push", "origin"], {
    cwd: packagePath,
    stdout: "pipe",
    stderr: "pipe",
  });

  // 设置超时
  const timeoutId = setTimeout(() => {
    proc.kill();
  }, timeout);

  try {
    const exitCode = await proc.exited;
    clearTimeout(timeoutId);
    
    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      throw new Error(t("git.pushCodeFailed", { exitCode, error: stderr.trim() }));
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message.includes("killed")) {
      throw new Error(t("git.pushCodeTimeout", { timeout: timeout / 1000 }));
    }
    throw error;
  }
}

/**
 * 创建 git tag
 */
async function createGitTag(tag: string, packagePath: string): Promise<void> {
  const proc = Bun.spawn(["git", "tag", tag], {
    cwd: packagePath,
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(t("git.createTagFailed", { exitCode }));
  }
}

/**
 * 删除 git tag（用于回滚）
 */
async function deleteGitTag(tag: string, packagePath: string): Promise<void> {
  const proc = Bun.spawn(["git", "tag", "-d", tag], {
    cwd: packagePath,
    stdout: "pipe",
    stderr: "pipe",
  });

  await proc.exited;
  // 即使删除失败也不抛出错误，因为 tag 可能不存在
}

/**
 * 推送 git tag（带超时）
 */
async function pushGitTag(tag: string, packagePath: string, timeout: number = 10000): Promise<void> {
  const proc = Bun.spawn(["git", "push", "origin", tag], {
    cwd: packagePath,
    stdout: "pipe",
    stderr: "pipe",
  });

  // 设置超时
  const timeoutId = setTimeout(() => {
    proc.kill();
  }, timeout);

  try {
    const exitCode = await proc.exited;
    clearTimeout(timeoutId);
    
    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      throw new Error(t("git.pushTagFailed", { exitCode, error: stderr.trim() }));
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message.includes("killed")) {
      throw new Error(t("git.pushTagTimeout", { timeout: timeout / 1000 }));
    }
    throw error;
  }
}

/**
 * 检查 npm 登录状态
 * 使用 bun pm whoami 检查登录状态
 */
async function checkNpmAuth(registry: string): Promise<void> {
  const proc = Bun.spawn(["bun", "pm", "whoami"], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const exitCode = await proc.exited;
  
  if (exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text();
    const errorMsg = stderr.trim();
    
    // 检查是否是未登录错误
    if (errorMsg.includes("not logged in") || errorMsg.includes("Unauthorized") || errorMsg === "") {
      throw new Error(t("publish.npmNotLoggedIn", { registry }));
    }
    
    throw new Error(t("publish.npmAuthCheckFailed", { registry, error: errorMsg }));
  }

  // 获取用户名
  const stdout = await new Response(proc.stdout).text();
  const username = stdout.trim();
  
  if (!username) {
    throw new Error(t("publish.npmNotLoggedIn", { registry }));
  }
}

/**
 * 发布到 npm
 * 使用 npm publish 命令发布包
 */
async function publishToNpm(packagePath: string, registry: string, otp?: string): Promise<void> {
  const args = ["bun", "publish", "--registry", registry];
  
  // 如果提供了 OTP，添加到命令参数中
  if (otp) {
    args.push("--otp", otp);
  }

  const proc = Bun.spawn(args, {
    cwd: packagePath,
    stdout: "inherit",
    stderr: "inherit",
    env: {
      ...process.env,
      NPM_CONFIG_REGISTRY: registry,
    },
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(t("publish.npmPublishFailed", { exitCode }));
  }
}

/**
 * 发布包
 * 新的发布顺序：
 * 1. 更新版本号和 changelog
 * 2. 创建 git commit
 * 3. 推送代码（超时10s）
 * 4. 创建 git tag
 * 5. 推送 tag（超时10s）
 * 6. 发布到 npm
 * 如果发布失败，会自动回滚版本号和 changelog 的修改
 */
export async function publish(config: PublishConfig): Promise<void> {
  // 保存原始值，用于失败时回滚
  const originalVersion = readPackageVersion(config.package.path);
  const originalChangelog = config.generateChangelog 
    ? readChangelog(config.package.path) 
    : "";
  let gitTagCreated = false;

  try {
    // 1. 更新版本号
    const updateVersionSpinner = ora(t("publish.updatingVersion")).start();
    try {
      updatePackageVersion(config.package.path, config.newVersion);
      updateVersionSpinner.succeed(t("publish.versionUpdated"));
    } catch (error) {
      updateVersionSpinner.fail(t("publish.versionUpdateFailed"));
      throw error;
    }

    // 2. 生成 changelog 文件（如果配置了）
    if (config.generateChangelog) {
      const changelogSpinner = ora(t("publish.updatingChangelog")).start();
      try {
        updateChangelog(config.package.path, config.newVersion, config.changelog);
        changelogSpinner.succeed(t("publish.changelogUpdated"));
      } catch (error) {
        changelogSpinner.fail(t("publish.changelogUpdateFailed"));
        throw error;
      }
    }

    // 3. 检查 npm 登录状态
    const authSpinner = ora(t("publish.checkingNpmAuth")).start();
    try {
      await checkNpmAuth(config.registry);
      authSpinner.succeed(t("publish.npmAuthChecked"));
    } catch (error) {
      authSpinner.fail(t("publish.npmAuthCheckFailed"));
      throw error;
    }

    // 4. 创建 git commit
    const commitSpinner = ora(t("publish.creatingCommit")).start();
    try {
      await createGitCommit(config.package.path, config.newVersion, config.changelog);
      commitSpinner.succeed(t("publish.commitCreated"));
    } catch (error) {
      commitSpinner.fail(t("publish.commitFailed"));
      throw error;
    }

    // 5. 推送代码到远程仓库（超时10s）
    const pushCodeSpinner = ora(t("publish.pushingCode")).start();
    try {
      await pushGitCode(config.package.path, 10000);
      pushCodeSpinner.succeed(t("publish.codePushed"));
    } catch (error) {
      pushCodeSpinner.fail(t("publish.codePushFailed"));
      throw error;
    }

    // 6. 创建 git tag（如果配置了推送 tag）
    if (config.pushTag) {
      const tagSpinner = ora(t("publish.creatingTag")).start();
      try {
        await createGitTag(config.tag, config.package.path);
        gitTagCreated = true;
        tagSpinner.succeed(t("publish.tagCreated"));
      } catch (error) {
        tagSpinner.fail(t("publish.tagCreateFailed"));
        throw error;
      }

      // 7. 推送 git tag（超时10s）
      const pushTagSpinner = ora(t("publish.pushingTag")).start();
      try {
        await pushGitTag(config.tag, config.package.path, 10000);
        pushTagSpinner.succeed(t("publish.tagPushed"));
      } catch (error) {
        pushTagSpinner.fail(t("publish.tagPushFailed"));
        throw error;
      }
    }

    // 8. 发布到 npm
    const publishSpinner = ora(t("publish.publishing")).start();
    try {
      await publishToNpm(config.package.path, config.registry, config.otp);
      publishSpinner.succeed(t("publish.success"));
    } catch (error) {
      publishSpinner.fail(t("publish.failed"));
      throw error;
    }
  } catch (error) {
    // 发布失败，回滚修改
    const rollbackSpinner = ora(t("publish.rollingBack")).start();
    
    try {
      // 恢复版本号
      restorePackageVersion(config.package.path, originalVersion);
      
      // 恢复 changelog（如果修改了）
      if (config.generateChangelog) {
        restoreChangelog(config.package.path, originalChangelog);
      }
      
      // 删除已创建的 git tag（如果创建了）
      if (gitTagCreated) {
        await deleteGitTag(config.tag, config.package.path);
      }
      
      rollbackSpinner.succeed(t("publish.rollbackComplete"));
    } catch (rollbackError) {
      // 回滚失败，记录错误但不抛出，因为原始错误更重要
      rollbackSpinner.fail(t("publish.rollbackFailed"));
      console.error(rollbackError);
    }
    
    // 重新抛出原始错误
    throw error;
  }
}
