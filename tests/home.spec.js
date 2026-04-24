const { test, expect } = require("@playwright/test");

test.describe("Golden Nyanko Tower static site", () => {
  test("development server disables cache for html css and js", async ({ request }) => {
    const htmlResponse = await request.get("/");
    const cssResponse = await request.get("/styles.css");
    const jsResponse = await request.get("/script.js");
    const imageResponse = await request.get("/assets/brand/logo-mark.png");

    expect(htmlResponse.headers()["cache-control"]).toBe("no-cache");
    expect(cssResponse.headers()["cache-control"]).toBe("no-cache");
    expect(jsResponse.headers()["cache-control"]).toBe("no-cache");
    expect(imageResponse.headers()["cache-control"]).toBe("public, max-age=31536000, immutable");
  });

  test("desktop homepage renders redesigned editorial layout and SEO content", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/黄金にゃんこ塔 攻略と報酬まとめ/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
    await expect(page.locator("h1")).toHaveText("黄金にゃんこ塔");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /風雲にゃんこ塔との違い/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://battlecats.lol/");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", "https://battlecats.lol/assets/brand/social-card.png");
    await expect(page.locator('meta[name="googlebot"]')).toHaveAttribute("content", /index,follow/);
    await expect(page.locator('script[src*="googletagmanager"], script[src*="clarity"]')).toHaveCount(0);

    const inlineScripts = await page.locator("script").evaluateAll((nodes) =>
      nodes.map((node) => node.textContent || "").join("\n")
    );
    expect(inlineScripts).not.toMatch(/gtag|clarity/i);

    await expect(page.getByRole("navigation", { name: "主要ナビゲーション" })).toBeVisible();
    await expect(page.getByRole("link", { name: "PONOS 公式ニュース", exact: true })).toBeVisible();
    await expect(page.locator(".metric-tab")).toHaveCount(3);
    await expect(page.getByRole("heading", { name: "黄金にゃんこ塔とは" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "報酬は「短期でまとめて回収」が基本" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "攻略前に決めること" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "よくある確認ポイント" })).toBeVisible();
    await expect(page.getByText("非公式ファンサイト", { exact: true })).toBeVisible();

    const faqItems = page.locator(".faq-list details");
    await expect(faqItems).toHaveCount(6);
    await page.getByText("一番注意する階はどこですか？").click();
    await expect(page.getByText("メタル対策を含めた専用編成")).toBeVisible();

    await expect(page.getByRole("link", { name: "PONOS 公式ニュース：超水曜にゃんこDAY 開催告知" })).toBeVisible();

    const imagesLoaded = await page.evaluate(() =>
      Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0)
    );
    expect(imagesLoaded).toBe(true);
  });

  test("mobile layout stays inside viewport and menu navigation works", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const page = await context.newPage();

    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();

    const menuButton = page.getByRole("button", { name: "メニューを開く" });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("navigation", { name: "主要ナビゲーション" })).toBeVisible();
    await expect(page.getByRole("link", { name: "PONOS 公式ニュース", exact: true })).toBeVisible();

    await page.getByRole("navigation", { name: "主要ナビゲーション" }).getByRole("link", { name: "報酬", exact: true }).click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#rewards")).toBeInViewport();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await expect(page.getByRole("link", { name: "PONOS 公式ニュース：超水曜にゃんこDAY 開催告知" })).toBeVisible();
    await context.close();
  });
});
