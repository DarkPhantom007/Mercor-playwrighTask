import { test, expect } from '@playwright/test';
import * as path from 'path';

// Full UI recovery check: drop the network, confirm the offline card, then confirm it heals.
test('Validate application UI correctly handles and recovers from a network drop', async ({ page, context }) => {
    // Open the local page. It listens to the browser's own online and offline events.
    const filePath = path.resolve(__dirname, '../index.html');
    const fileUrl = `file://${filePath}`;

    await page.goto(fileUrl);

    // Baseline: green card, exact text, class "online".
    const statusIndicator = page.locator('#status-indicator');
    await expect(statusIndicator).toHaveText('Connected to Network');
    await expect(statusIndicator).toHaveClass(/online/);

    // Cut the network inside Chrome. This is the browser context, not a mocked API response.
    await context.setOffline(true);

    // The "offline" listener must switch the card to the red disconnected state.
    await expect(statusIndicator).toHaveText('Disconnected / Offline');
    await expect(statusIndicator).toHaveClass(/offline/);

    // Restore the network. The "online" listener must put the original card back.
    await context.setOffline(false);

    // Healed: same text and class we asserted at the start.
    await expect(statusIndicator).toHaveText('Connected to Network');
    await expect(statusIndicator).toHaveClass(/online/);
});
