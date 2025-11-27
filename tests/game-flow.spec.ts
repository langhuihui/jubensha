import { test, expect } from '@playwright/test';

test.describe('游戏流程测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到房间页面
    await page.goto('/room/TEST123?playerName=测试玩家&isHost=false');
    await page.waitForLoadState('networkidle');
  });

  test('应该显示完整的房间信息', async ({ page }) => {
    // 验证房间基本信息
    await expect(page.locator('.room-name')).toContainText('波斯皇宫');
    await expect(page.locator('.room-id')).toContainText('房间号: TEST123');
    await expect(page.locator('.script-name')).toContainText('以斯帖记');

    // 验证房间状态
    const statusTag = page.locator('.van-tag:has-text("等待中")');
    await expect(statusTag).toBeVisible();

    // 验证玩家列表区域
    await expect(page.locator('h3:has-text("玩家列表")')).toBeVisible();
  });

  test('应该显示游戏介绍信息', async ({ page }) => {
    // 验证游戏介绍区域
    await expect(page.locator('h3:has-text("游戏介绍")')).toBeVisible();

    // 验证游戏描述存在
    await expect(page.locator('.intro-content p')).toBeVisible();

    // 验证游戏统计信息
    await expect(page.locator('.game-stats')).toBeVisible();
    await expect(page.locator('.stat-item:has-text("分钟")')).toBeVisible();
    await expect(page.locator('.stat-item:has-text("人")')).toBeVisible();
    await expect(page.locator('.stat-item:has-text("简单")')).toBeVisible();
  });

  test('应该能够进行准备操作', async ({ page }) => {
    // 验证准备按钮
    const prepareButton = page.locator('button:has-text("准备")');
    await expect(prepareButton).toBeVisible();
    await expect(prepareButton).toBeEnabled();

    // 点击准备
    await prepareButton.click();
    await expect(prepareButton).toContainText('取消准备');

    // 取消准备
    await prepareButton.click();
    await expect(prepareButton).toContainText('准备');
  });

  test('应该能够使用聊天功能', async ({ page }) => {
    // 发送测试消息
    const testMessage = '这是一条测试消息';
    const messageInput = page.locator('input[placeholder*="输入消息"]');
    await messageInput.fill(testMessage);
    await page.locator('button:has-text("发送")').click();

    // 验证消息显示
    const sentMessage = page.locator('.message-item:has-text("' + testMessage + '")');
    await expect(sentMessage).toBeVisible();
    await expect(sentMessage).toHaveClass(/.*own-message.*/);
  });

  test('房主应该能够开始游戏', async ({ page }) => {
    // 使用房主身份
    await page.goto('/room/TEST123?playerName=测试房主&isHost=true');
    await page.waitForLoadState('networkidle');

    // 验证房主看到开始游戏按钮
    const startGameButton = page.locator('button:has-text("开始游戏")');
    await expect(startGameButton).toBeVisible();

    // 验证房主不看到准备按钮
    await expect(page.locator('button:has-text("准备")')).not.toBeVisible();

    // 注意：实际的开始游戏功能需要后端支持，这里只测试UI
  });

  test('应该能够访问房间设置', async ({ page }) => {
    // 使用房主身份进入房间
    await page.goto('/room/TEST123?playerName=测试房主&isHost=true');
    await page.waitForLoadState('networkidle');

    // 点击设置按钮
    await page.locator('button:has(.van-icon[name="setting-o"])').click();

    // 验证设置弹窗显示
    await expect(page.locator('.popup-header h3:has-text("房间设置")')).toBeVisible();
    await expect(page.locator('label:has-text("最大人数")')).toBeVisible();
    await expect(page.locator('label:has-text("房间密码")')).toBeVisible();
  });

  test('应该能够离开房间', async ({ page }) => {
    // 点击返回按钮
    await page.locator('.van-nav-bar__arrow').click();

    // 验证离开房间确认对话框出现
    await expect(page.locator('.van-dialog__header:has-text("离开房间")')).toBeVisible();
    await expect(page.locator('.van-dialog__message:has-text("确定要离开房间吗？")')).toBeVisible();

    // 点击取消按钮
    await page.locator('.van-button:has-text("取消")').click();

    // 验证仍然在房间页面
    await expect(page.locator('.room-name')).toContainText('波斯皇宫');
  });

  test('游戏各元素应该协调工作', async ({ page }) => {
    // 测试聊天功能
    const messageInput = page.locator('input[placeholder*="输入消息"]');
    await messageInput.fill('测试游戏流程');
    await page.locator('button:has-text("发送")').click();
    await expect(page.locator('.message-item:has-text("测试游戏流程")')).toBeVisible();

    // 测试准备功能
    const prepareButton = page.locator('button:has-text("准备")');
    await prepareButton.click();
    await expect(prepareButton).toContainText('取消准备');

    // 验证所有元素仍然可见
    await expect(page.locator('.room-info')).toBeVisible();
    await expect(page.locator('.players-section')).toBeVisible();
    await expect(page.locator('.game-intro')).toBeVisible();
    await expect(page.locator('.chat-section')).toBeVisible();
  });

  test('移动端界面应该适配良好', async ({ page }) => {
    // 模拟移动设备
    await page.setViewportSize({ width: 375, height: 667 });

    // 验证所有主要元素在移动端可见
    await expect(page.locator('.room-info')).toBeVisible();
    await expect(page.locator('.players-section')).toBeVisible();
    await expect(page.locator('.game-intro')).toBeVisible();
    await expect(page.locator('.chat-section')).toBeVisible();
    await expect(page.locator('.bottom-actions')).toBeVisible();

    // 测试移动端功能
    const prepareButton = page.locator('button:has-text("准备")');
    await prepareButton.click();
    await expect(prepareButton).toContainText('取消准备');

    const messageInput = page.locator('input[placeholder*="输入消息"]');
    await messageInput.fill('移动端测试');
    await page.locator('button:has-text("发送")').click();
    await expect(page.locator('.message-item:has-text("移动端测试")')).toBeVisible();
  });

  test('页面滚动应该正常工作', async ({ page }) => {
    // 设置较小的视口高度以确保需要滚动
    await page.setViewportSize({ width: 1200, height: 600 });

    // 验证页面高度大于视口高度
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = 600;
    expect(bodyHeight).toBeGreaterThan(viewportHeight);

    // 测试滚动到各个区域
    await page.locator('.room-info').scrollIntoViewIfNeeded();
    await expect(page.locator('.room-info')).toBeVisible();

    await page.locator('.chat-section').scrollIntoViewIfNeeded();
    await expect(page.locator('.chat-section')).toBeVisible();
  });

  test('应该正确处理玩家状态', async ({ page }) => {
    // 等待页面完全加载
    await page.waitForTimeout(1000);

    // 验证至少有一个玩家（当前玩家）
    const playerItems = page.locator('.player-item:not(.empty)');
    const playerCount = await playerItems.count();
    expect(playerCount).toBeGreaterThanOrEqual(1);

    // 验证玩家信息显示
    if (playerCount > 0) {
      const firstPlayer = playerItems.first();
      await expect(firstPlayer.locator('.player-name')).toBeVisible();
      await expect(firstPlayer.locator('.player-avatar img')).toBeVisible();
      await expect(firstPlayer.locator('.player-status')).toBeVisible();
    }

    // 验证空位显示
    const emptySlots = page.locator('.player-item.empty');
    if (await emptySlots.count() > 0) {
      const firstEmptySlot = emptySlots.first();
      await expect(firstEmptySlot.locator('.empty-slot')).toBeVisible();
      await expect(firstEmptySlot.locator('.van-icon[name="plus"]')).toBeVisible();
    }
  });

  test('应该正确显示时间格式', async ({ page }) => {
    // 发送消息以生成时间戳
    const messageInput = page.locator('input[placeholder*="输入消息"]');
    await messageInput.fill('时间格式测试');
    await page.locator('button:has-text("发送")').click();

    // 验证时间格式（HH:MM）
    const messageTime = page.locator('.message-time').first();
    await expect(messageTime).toBeVisible();

    const timeText = await messageTime.textContent();
    expect(timeText).toMatch(/^\d{2}:\d{2}$/);
  });

  test('应该能够处理网络连接状态', async ({ page }) => {
    // 验证页面正常加载
    await expect(page.locator('.room-name')).toContainText('波斯皇宫');

    // 模拟网络断开（如果可能）
    // 注意：这个测试可能需要根据实际的实现调整
    await page.context().setOffline(true);
    await page.waitForTimeout(1000);

    // 验证页面仍然可用
    await expect(page.locator('.room-container')).toBeVisible();

    // 恢复网络连接
    await page.context().setOffline(false);
    await page.waitForTimeout(1000);
  });

  test('应该正确处理页面刷新', async ({ page }) => {
    // 发送一些消息
    const messageInput = page.locator('input[placeholder*="输入消息"]');
    await messageInput.fill('刷新前测试');
    await page.locator('button:has-text("发送")').click();

    // 点击准备
    const prepareButton = page.locator('button:has-text("准备")');
    await prepareButton.click();

    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 验证页面重新加载成功
    await expect(page.locator('.room-name')).toContainText('波斯皇宫');
    await expect(page.locator('button:has-text("准备")')).toBeVisible();
    await expect(page.locator('.chat-section')).toBeVisible();
  });
});