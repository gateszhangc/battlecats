const { test, expect } = require("@playwright/test");

test.describe("Golden Nyanko Tower static site", () => {
  test("desktop homepage renders SEO content and brand assets", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/黄金にゃんこ塔 攻略と報酬まとめ/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
    await expect(page.locator("h1")).toHaveText("黄金にゃんこ塔");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /風雲にゃんこ塔との違い/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://battlecats.lol/");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", "https://battlecats.lol/assets/brand/social-card.png");
    await expect(page.locator('meta[name="googlebot"]')).toHaveAttribute("content", /index,follow/);

    await expect(page.getByRole("navigation", { name: "主要ナビゲーション" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "報酬は「短期でまとめて回収」が基本" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "攻略前に決めること" })).toBeVisible();
    await expect(page.getByText("非公式ファンサイト")).toBeVisible();
    await expect(page.locator('script[src*="googletagmanager"], script[src*="clarity"]')).toHaveCount(0);

    const inlineScripts = await page.locator("script").evaluateAll((nodes) =>
      nodes.map((node) => node.textContent || "").join("\n")
    );
    expect(inlineScripts).not.toMatch(/gtag|clarity/i);

    const faqItems = page.locator(".faq-list details");
    await expect(faqItems).toHaveCount(6);
    await page.getByText("一番注意する階はどこですか？").click();
    await expect(page.getByText("メタル対策を含めた専用編成")).toBeVisible();

    const imagesLoaded = await page.evaluate(() =>
      Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0)
    );
    expect(imagesLoaded).toBe(true);
  });

  test("mobile layout stays inside viewport and anchor navigation works", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const page = await context.newPage();

    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await page.getByRole("navigation", { name: "主要ナビゲーション" }).getByRole("link", { name: "報酬", exact: true }).click();
    await expect(page.locator("#rewards")).toBeInViewport();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await expect(page.getByRole("link", { name: "PONOS 公式ニュース：超水曜にゃんこDAY 開催告知" })).toBeVisible();
    await context.close();
  });
});
