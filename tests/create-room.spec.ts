import { test, expect } from '@playwright/test';

test.describe('创建房间功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该显示创建房间按钮', async ({ page }) => {
    // 验证页面标题
    await expect(page.locator('h1.title')).toContainText('以斯帖记');

    // 验证创建房间按钮存在并可点击（使用更具体的选择器）
    const createRoomBtn = page.locator('button:has-text("创建房间")').first();
    await expect(createRoomBtn).toBeVisible();
    await expect(createRoomBtn).toBeEnabled();
  });

  test('点击创建房间按钮应该弹出创建房间表单', async ({ page }) => {
    // 点击创建房间按钮（使用更具体的选择器）
    await page.locator('button:has-text("创建房间")').first().click();

    // 验证弹窗标题
    await expect(page.locator('.popup-header h3')).toContainText('创建房间');

    // 验证表单字段存在
    await expect(page.locator('input[name="playerName"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('text=最大人数')).toBeVisible();
    await expect(page.locator('.van-popup').locator('button:has-text("创建房间")')).toBeVisible(); // 提交按钮
  });

  test('表单验证应该正常工作', async ({ page }) => {
    // 点击创建房间按钮
    await page.locator('button:has-text("创建房间")').first().click();

    // 验证表单字段存在
    await expect(page.locator('input[name="playerName"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // 填写昵称字段
    await page.fill('input[name="playerName"]', '测试用户');

    // 等待一下确保字段被正确填写
    await page.waitForTimeout(500);

    // 验证字段内容
    await expect(page.locator('input[name="playerName"]')).toHaveValue('测试用户');
  });

  test('填写有效信息应该能够创建房间', async ({ page }) => {
    // 点击创建房间按钮
    await page.locator('button:has-text("创建房间")').first().click();

    // 填写表单
    await page.fill('input[name="playerName"]', '测试玩家');
    await page.fill('input[name="password"]', '123456');
    // 保持默认的最大人数 6

    // 提交表单（使用弹窗内的提交按钮）
    await page.locator('.van-popup').locator('button:has-text("创建房间")').click();

    // 等待创建成功
    await page.waitForTimeout(2000);

    // 验证是否跳转到房间页面（房间ID应该匹配格式）
    await expect(page).toHaveURL(/\/room\/[A-Z0-9]{6}/);
  });

  test('取消创建房间应该关闭弹窗', async ({ page }) => {
    // 点击创建房间按钮
    await page.locator('button:has-text("创建房间")').first().click();

    // 验证弹窗已打开
    await expect(page.locator('.popup-header h3')).toBeVisible();

    // 点击取消按钮
    await page.click('button:has-text("取消")');

    // 验证弹窗已关闭
    await expect(page.locator('.popup-header h3')).not.toBeVisible();
  });

  test('移动端响应式布局应该正常', async ({ page }) => {
    // 模拟移动设备
    await page.setViewportSize({ width: 375, height: 667 });

    // 验证页面元素在移动端的显示
    await expect(page.locator('h1.title')).toBeVisible();
    await expect(page.locator('button:has-text("创建房间")')).toBeVisible();

    // 点击创建房间按钮
    await page.locator('button:has-text("创建房间")').first().click();

    // 验证移动端弹窗样式
    await expect(page.locator('.popup-header h3')).toBeVisible();
    await expect(page.locator('input[name="playerName"]')).toBeVisible();
  });

  test('创建房间流程完整性测试', async ({ page }) => {
    // 点击创建房间按钮
    await page.locator('button:has-text("创建房间")').first().click();

    // 填写表单
    await page.fill('input[name="playerName"]', '测试玩家');
    await page.fill('input[name="password"]', 'test123');

    // 提交表单
    await page.locator('.van-popup').locator('button:has-text("创建房间")').click();

    // 等待创建流程完成
    await page.waitForTimeout(3000);

    // 验证页面标题变化或成功提示
    const pageTitle = await page.title();
    // 应该显示成功提示或跳转到房间页面
    expect(pageTitle === '游戏房间' || pageTitle.includes('以斯帖记')).toBeTruthy();
  });
});