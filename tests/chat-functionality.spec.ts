import { test, expect } from '@playwright/test';

test.describe('聊天功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到房间页面
    await page.goto('/room/TEST123?playerName=测试玩家&isHost=false');
    await page.waitForLoadState('networkidle');
  });

  test('应该显示聊天区域', async ({ page }) => {
    // 验证聊天区域存在
    await expect(page.locator('.chat-section')).toBeVisible();
    await expect(page.locator('h3:has-text("房间聊天")')).toBeVisible();

    // 验证聊天消息区域
    await expect(page.locator('.chat-messages')).toBeVisible();

    // 验证聊天输入框
    await expect(page.locator('.chat-input')).toBeVisible();
    await expect(page.locator('input[placeholder*="输入消息"]')).toBeVisible();
    await expect(page.locator('button:has-text("发送")')).toBeVisible();
  });

  test('应该显示系统欢迎消息', async ({ page }) => {
    // 验证系统消息存在
    const systemMessage = page.locator('.message-item:has-text("欢迎来到游戏房间！")');
    await expect(systemMessage).toBeVisible();

    // 验证系统消息样式
    await expect(systemMessage.locator('.message-text')).toBeVisible();
  });

  test('应该能够输入和发送消息', async ({ page }) => {
    const testMessage = '这是一条测试消息';

    // 找到输入框并输入消息
    const messageInput = page.locator('input[placeholder*="输入消息"]');
    await expect(messageInput).toBeVisible();
    await messageInput.fill(testMessage);

    // 验证输入框内容
    await expect(messageInput).toHaveValue(testMessage);

    // 点击发送按钮
    await page.locator('button:has-text("发送")').click();

    // 验证输入框被清空
    await expect(messageInput).toHaveValue('');

    // 验证消息出现在聊天区域
    const sentMessage = page.locator('.message-item:has-text("' + testMessage + '")');
    await expect(sentMessage).toBeVisible();

    // 验证消息显示为发送者自己的消息
    await expect(sentMessage).toHaveClass(/.*own-message.*/);
  });

  test('应该能够通过回车键发送消息', async ({ page }) => {
    const testMessage = '通过回车发送的消息';

    // 找到输入框并输入消息
    const messageInput = page.locator('input[placeholder*="输入消息"]');
    await messageInput.fill(testMessage);

    // 按回车键发送
    await messageInput.press('Enter');

    // 验证消息出现在聊天区域
    const sentMessage = page.locator('.message-item:has-text("' + testMessage + '")');
    await expect(sentMessage).toBeVisible();
  });

  test('不应该能够发送空消息', async ({ page }) => {
    const messageCount = await page.locator('.message-item').count();

    // 尝试发送空消息
    const messageInput = page.locator('input[placeholder*="输入消息"]');
    await messageInput.fill('');
    await page.locator('button:has-text("发送")').click();

    // 验证没有新消息被添加
    expect(await page.locator('.message-item').count()).toBe(messageCount);
  });

  test('不应该能够发送只包含空格的消息', async ({ page }) => {
    const messageCount = await page.locator('.message-item').count();

    // 尝试发送只包含空格的消息
    const messageInput = page.locator('input[placeholder*="输入消息"]');
    await messageInput.fill('   ');
    await page.locator('button:has-text("发送")').click();

    // 验证没有新消息被添加
    expect(await page.locator('.message-item').count()).toBe(messageCount);
  });

  test('消息应该显示发送者信息', async ({ page }) => {
    const testMessage = '带发送者信息的消息';

    // 发送消息
    const messageInput = page.locator('input[placeholder*="输入消息"]');
    await messageInput.fill(testMessage);
    await page.locator('button:has-text("发送")').click();

    // 验证消息包含发送者名称
    const sentMessage = page.locator('.message-item:has-text("' + testMessage + '")');
    await expect(sentMessage.locator('.message-name')).toContainText('测试玩家');

    // 验证消息包含时间戳
    await expect(sentMessage.locator('.message-time')).toBeVisible();
  });

  test('多条消息应该按时间顺序显示', async ({ page }) => {
    const messages = [
      '第一条消息',
      '第二条消息',
      '第三条消息'
    ];

    // 发送多条消息
    for (const message of messages) {
      const messageInput = page.locator('input[placeholder*="输入消息"]');
      await messageInput.fill(message);
      await page.locator('button:has-text("发送")').click();
      await page.waitForTimeout(100); // 短暂延迟确保时间戳不同
    }

    // 验证所有消息都存在
    for (const message of messages) {
      await expect(page.locator('.message-item:has-text("' + message + '")')).toBeVisible();
    }

    // 验证消息顺序（最新的在底部）
    const allMessages = page.locator('.message-item:not(.system-message)');
    const count = await allMessages.count();

    // 最后几条应该是我们发送的消息（排除系统消息）
    for (let i = 0; i < messages.length; i++) {
      const messageElement = allMessages.nth(count - messages.length + i);
      await expect(messageElement.locator('.message-text')).toContainText(messages[i]);
    }
  });

  test('消息输入框应该有字符限制', async ({ page }) => {
    const messageInput = page.locator('input[placeholder*="输入消息"]');

    // 验证maxlength属性
    await expect(messageInput).toHaveAttribute('maxlength', '100');

    // 尝试输入超过限制的字符
    const longMessage = 'a'.repeat(150);
    await messageInput.fill(longMessage);

    // 验证输入框只接受100个字符
    const actualValue = await messageInput.inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(100);
  });

  test('聊天区域应该有滚动功能', async ({ page }) => {
    // 发送足够多的消息以触发滚动
    for (let i = 1; i <= 20; i++) {
      const messageInput = page.locator('input[placeholder*="输入消息"]');
      await messageInput.fill(`消息 ${i}`);
      await page.locator('button:has-text("发送")').click();
    }

    // 验证聊天消息区域存在并可滚动
    const chatMessages = page.locator('.chat-messages');
    await expect(chatMessages).toBeVisible();

    // 获取滚动高度
    const scrollHeight = await chatMessages.evaluate(el => el.scrollHeight);
    const clientHeight = await chatMessages.evaluate(el => el.clientHeight);

    // 验证内容高度大于可视高度（需要滚动）
    expect(scrollHeight).toBeGreaterThan(clientHeight);
  });

  test('移动端聊天界面应该正常显示', async ({ page }) => {
    // 模拟移动设备
    await page.setViewportSize({ width: 375, height: 667 });

    // 验证聊天区域在移动端可见
    await expect(page.locator('.chat-section')).toBeVisible();
    await expect(page.locator('input[placeholder*="输入消息"]')).toBeVisible();
    await expect(page.locator('button:has-text("发送")')).toBeVisible();

    // 测试移动端消息发送
    const testMessage = '移动端测试消息';
    const messageInput = page.locator('input[placeholder*="输入消息"]');
    await messageInput.fill(testMessage);
    await page.locator('button:has-text("发送")').click();

    // 验证消息显示正常
    await expect(page.locator('.message-item:has-text("' + testMessage + '")')).toBeVisible();
  });

  test('聊天功能在房主身份下也应该正常工作', async ({ page }) => {
    // 使用房主身份进入房间
    await page.goto('/room/TEST123?playerName=测试房主&isHost=true');
    await page.waitForLoadState('networkidle');

    // 验证聊天区域存在
    await expect(page.locator('.chat-section')).toBeVisible();

    // 测试消息发送
    const testMessage = '房主发送的消息';
    const messageInput = page.locator('input[placeholder*="输入消息"]');
    await messageInput.fill(testMessage);
    await page.locator('button:has-text("发送")').click();

    // 验证消息发送成功
    await expect(page.locator('.message-item:has-text("' + testMessage + '")')).toBeVisible();
  });
});