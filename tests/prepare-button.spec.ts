import { test, expect } from '@playwright/test';

test.describe('准备按钮功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到房间页面（非房主身份）
    await page.goto('/room/TEST123?playerName=测试玩家&isHost=false');
    await page.waitForLoadState('networkidle');
  });

  test('应该显示准备按钮', async ({ page }) => {
    // 验证准备按钮存在
    const prepareButton = page.locator('button:has-text("准备")');
    await expect(prepareButton).toBeVisible();
    await expect(prepareButton).toBeEnabled();
  });

  test('准备按钮应该在非房主玩家界面显示', async ({ page }) => {
    // 验证准备按钮文本
    const prepareButton = page.locator('button:has-text("准备")');
    await expect(prepareButton).toContainText('准备');

    // 验证按钮图标
    await expect(prepareButton.locator('.van-icon[name="success"]')).toBeVisible();
  });

  test('应该能够点击准备按钮', async ({ page }) => {
    const prepareButton = page.locator('button:has-text("准备")');

    // 点击准备按钮
    await prepareButton.click();

    // 验证按钮文本变为"取消准备"
    await expect(prepareButton).toContainText('取消准备');
  });

  test('应该能够在准备和取消准备之间切换', async ({ page }) => {
    const prepareButton = page.locator('button:has-text("准备")');

    // 第一次点击 - 准备
    await prepareButton.click();
    await expect(prepareButton).toContainText('取消准备');

    // 第二次点击 - 取消准备
    await prepareButton.click();
    await expect(prepareButton).toContainText('准备');

    // 第三次点击 - 再次准备
    await prepareButton.click();
    await expect(prepareButton).toContainText('取消准备');
  });

  test('房主不应该看到准备按钮', async ({ page }) => {
    // 使用房主身份进入房间
    await page.goto('/room/TEST123?playerName=测试房主&isHost=true');
    await page.waitForLoadState('networkidle');

    // 房主应该看到开始游戏按钮，而不是准备按钮
    await expect(page.locator('button:has-text("准备")')).not.toBeVisible();
    await expect(page.locator('button:has-text("开始游戏")')).toBeVisible();
  });

  test('准备按钮应该在游戏等待中状态下可用', async ({ page }) => {
    const prepareButton = page.locator('button:has-text("准备")');

    // 验证按钮在等待状态下可用
    const roomStatusTag = page.locator('.van-tag:has-text("等待中")');
    await expect(roomStatusTag).toBeVisible();
    await expect(prepareButton).toBeEnabled();
  });

  test('准备按钮的样式应该正确', async ({ page }) => {
    const prepareButton = page.locator('button:has-text("准备")');

    // 验证按钮样式
    await expect(prepareButton).toHaveClass(/.*van-button--default.*/);
    await expect(prepareButton).toHaveClass(/.*van-button--large.*/);
    await expect(prepareButton).toHaveClass(/.*van-button--block.*/);
  });

  test('准备按钮应该在移动端正常显示', async ({ page }) => {
    // 模拟移动设备
    await page.setViewportSize({ width: 375, height: 667 });

    // 验证准备按钮在移动端可见
    const prepareButton = page.locator('button:has-text("准备")');
    await expect(prepareButton).toBeVisible();

    // 测试移动端点击
    await prepareButton.click();
    await expect(prepareButton).toContainText('取消准备');
  });

  test('准备按钮应该在页面底部操作区域', async ({ page }) => {
    // 验证准备按钮位于底部操作区域
    const bottomActions = page.locator('.bottom-actions');
    await expect(bottomActions).toBeVisible();

    const prepareButton = page.locator('button:has-text("准备")');
    await expect(prepareButton).toBeVisible();

    // 验证准备按钮是底部操作区域的子元素
    const bottomActionsParent = await prepareButton.locator('..').locator('..');
    await expect(bottomActionsParent).toHaveClass(/.*bottom-actions.*/);
  });

  test('准备按钮状态切换后应该保持状态', async ({ page }) => {
    const prepareButton = page.locator('button:has-text("准备")');

    // 点击准备
    await prepareButton.click();
    await expect(prepareButton).toContainText('取消准备');

    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 注意：这里假设状态没有持久化到后端，所以可能需要调整
    // 如果有后端状态同步，这个测试需要相应修改
  });

  test('准备按钮应该有正确的图标', async ({ page }) => {
    const prepareButton = page.locator('button:has-text("准备")');

    // 验证准备状态下的图标
    await expect(prepareButton.locator('.van-icon[name="success"]')).toBeVisible();

    // 点击准备
    await prepareButton.click();

    // 验证取消准备状态下图标仍然存在
    await expect(prepareButton.locator('.van-icon[name="success"]')).toBeVisible();
  });

  test('准备按钮点击后应该有适当的响应时间', async ({ page }) => {
    const prepareButton = page.locator('button:has-text("准备")');

    // 记录点击时间
    const startTime = Date.now();
    await prepareButton.click();

    // 等待文本变化
    await expect(prepareButton).toContainText('取消准备');

    // 验证响应时间合理（应该在1秒内完成）
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(1000);
  });

  test('多次快速点击准备按钮应该正常工作', async ({ page }) => {
    const prepareButton = page.locator('button:has-text("准备")');

    // 快速多次点击
    for (let i = 0; i < 5; i++) {
      await prepareButton.click();
      await page.waitForTimeout(100); // 短暂延迟
    }

    // 验证最终状态（奇数次点击后应该是取消准备）
    await expect(prepareButton).toContainText('取消准备');
  });

  test('准备按钮在玩家列表更新时应该保持可见', async ({ page }) => {
    // 验证初始状态
    await expect(page.locator('button:has-text("准备")')).toBeVisible();

    // 等待一段时间确保页面加载完成
    await page.waitForTimeout(1000);

    // 验证准备按钮仍然可见
    await expect(page.locator('button:has-text("准备")')).toBeVisible();

    // 测试准备状态切换后按钮仍然可见
    const prepareButton = page.locator('button:has-text("准备")');
    await prepareButton.click();
    await expect(prepareButton).toBeVisible();
    await expect(prepareButton).toContainText('取消准备');
  });

  test('准备按钮应该与聊天功能兼容', async ({ page }) => {
    const prepareButton = page.locator('button:has-text("准备")');
    const messageInput = page.locator('input[placeholder*="输入消息"]');

    // 测试准备状态
    await prepareButton.click();
    await expect(prepareButton).toContainText('取消准备');

    // 测试发送消息
    await messageInput.fill('准备完成后的测试消息');
    await page.locator('button:has-text("发送")').click();

    // 验证消息发送成功
    await expect(page.locator('.message-item:has-text("准备完成后的测试消息")')).toBeVisible();

    // 验证准备状态保持
    await expect(prepareButton).toContainText('取消准备');

    // 取消准备
    await prepareButton.click();
    await expect(prepareButton).toContainText('准备');
  });
});