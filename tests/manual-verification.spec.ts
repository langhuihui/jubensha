import { test, expect } from '@playwright/test';

test.describe('手动验证测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/room/TEST123?playerName=测试玩家&isHost=false');
    await page.waitForLoadState('networkidle');
  });

  test('验证聊天功能正常工作', async ({ page }) => {
    // 发送消息
    const testMessage = '手动验证聊天功能';
    await page.fill('input[placeholder*="输入消息"]', testMessage);
    await page.click('button:has-text("发送")');

    // 验证消息显示
    await expect(page.locator('.message-item:has-text("' + testMessage + '")')).toBeVisible();
  });

  test('验证准备按钮功能正常工作', async ({ page }) => {
    // 点击准备按钮
    await page.click('button:has-text("准备")');

    // 验证对话框出现
    await expect(page.locator('.van-dialog')).toBeVisible();
    await expect(page.locator('.van-dialog__header:has-text("准备游戏")')).toBeVisible();

    // 点击确认
    await page.click('.van-dialog__confirm');

    // 验证按钮文本变化
    await expect(page.locator('button:has-text("取消准备")')).toBeVisible();

    // 验证提示消息
    await expect(page.locator('.van-toast:has-text("已准备")')).toBeVisible();
  });

  test('验证取消准备功能正常工作', async ({ page }) => {
    // 先准备
    await page.click('button:has-text("准备")');
    await page.click('.van-dialog__confirm');

    // 等待状态更新
    await page.waitForTimeout(1000);

    // 点击取消准备
    await page.click('button:has-text("取消准备")');

    // 验证对话框出现
    await expect(page.locator('.van-dialog')).toBeVisible();
    await expect(page.locator('.van-dialog__header:has-text("取消准备")')).toBeVisible();

    // 点击确认
    await page.click('.van-dialog__confirm');

    // 验证按钮文本变回准备
    await expect(page.locator('button:has-text("准备")')).toBeVisible();

    // 验证提示消息
    await expect(page.locator('.van-toast:has-text("已取消准备")')).toBeVisible();
  });

  test('验证游戏流程完整性', async ({ page }) => {
    // 验证房间信息显示
    await expect(page.locator('.room-name')).toContainText('波斯皇宫');
    await expect(page.locator('.room-id')).toContainText('TEST123');

    // 测试聊天功能
    await page.fill('input[placeholder*="输入消息"]', '游戏流程测试消息');
    await page.click('button:has-text("发送")');
    await expect(page.locator('.message-item:has-text("游戏流程测试消息")')).toBeVisible();

    // 测试准备功能
    await page.click('button:has-text("准备")');
    await page.click('.van-dialog__confirm');
    await expect(page.locator('button:has-text("取消准备")')).toBeVisible();

    // 验证所有主要区域都可见
    await expect(page.locator('.room-info')).toBeVisible();
    await expect(page.locator('.players-section')).toBeVisible();
    await expect(page.locator('.game-intro')).toBeVisible();
    await expect(page.locator('.chat-section')).toBeVisible();
    await expect(page.locator('.bottom-actions')).toBeVisible();
  });
});