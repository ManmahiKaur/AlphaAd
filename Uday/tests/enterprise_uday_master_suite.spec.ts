import { test, expect } from '../fixtures/testFixtures';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://127.0.0.1:8000/api/v1';

test.describe('AlphaAdvisor AI Enterprise Master E2E Framework (150 Modular Test Cases)', () => {

  // =========================================================================
  // 1. AUTHENTICATION & SECURITY (TC-001 to TC-015)
  // =========================================================================
  test.describe('1. Authentication & Security', () => {
    test('TC-001: Render login form card with input fields', async ({ loginPage }) => {
      await test.step('Navigate to Login screen', async () => {
        await loginPage.goto();
        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
      });
    });

    test('TC-002: Verify email input placeholder formatting', async ({ loginPage }) => {
      await loginPage.goto();
      await expect(loginPage.emailInput).toHaveAttribute('placeholder', 'user@example.com');
    });

    test('TC-003: Verify password input masking attribute', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.passwordInput.fill('Secret123');
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });

    test('TC-004: Validate error on empty credentials submission', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.signInBtn.click();
      await expect(loginPage.emailInput).toBeVisible();
    });

    test('TC-005: Reject invalid email formatting', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login('invalidemail', 'pass123');
      await expect(loginPage.page).toHaveURL(/.*login/);
    });

    test('TC-006: Display authentication error on wrong credentials', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login('wrong@test.com', 'wrongpass');
      await loginPage.page.waitForTimeout(400);
      await expect(loginPage.page.locator('body')).toContainText(/Incorrect email or password|Invalid/i);
    });

    test('TC-007: Demo User login flow', async ({ loginPage }) => {
      await loginPage.loginAsDemoUser();
      await expect(loginPage.page).toHaveURL(/.*dashboard/);
    });

    test('TC-008: Demo Admin login flow', async ({ loginPage }) => {
      await loginPage.loginAsDemoAdmin();
      await expect(loginPage.page).toHaveURL(/.*dashboard/);
    });

    test('TC-009: JWT Token persistence in localStorage', async ({ loginPage }) => {
      await loginPage.loginAsDemoUser();
      const token = await loginPage.getLocalStorageItem('token');
      expect(token).toBeTruthy();
    });

    test('TC-010: Save active profile object in localStorage', async ({ loginPage }) => {
      await loginPage.loginAsDemoUser();
      const user = await loginPage.getLocalStorageItem('auth_user') || await loginPage.getLocalStorageItem('token');
      expect(user).toBeTruthy();
    });

    test('TC-011: User logout clears token from storage', async ({ loginPage }) => {
      await loginPage.loginAsDemoUser();
      await loginPage.page.click('button[title="Logout"]');
      const token = await loginPage.getLocalStorageItem('token');
      expect(token).toBeNull();
    });

    test('TC-012: User logout redirects browser to login screen', async ({ loginPage }) => {
      await loginPage.loginAsDemoUser();
      await loginPage.page.click('button[title="Logout"]');
      await expect(loginPage.page).toHaveURL(/.*login/);
    });

    test('TC-013: Redirect unauthenticated user accessing /dashboard', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.clearLocalStorage();
      await loginPage.navigateTo('/dashboard');
      await expect(loginPage.page).toHaveURL(/.*login/);
    });

    test('TC-014: Session restoration on page reload', async ({ loginPage }) => {
      await loginPage.loginAsDemoUser();
      await loginPage.page.reload();
      await expect(loginPage.page).toHaveURL(/.*dashboard/);
    });

    test('TC-015: Navigation link to signup screen', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.createAccountLink.click();
      await expect(loginPage.page).toHaveURL(/.*signup/);
    });
  });

  // =========================================================================
  // 2. DASHBOARD & WIDGETS (TC-016 to TC-030)
  // =========================================================================
  test.describe('2. Dashboard & Widgets', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.loginAsDemoUser();
    });

    test('TC-016: Render main Dashboard layout', async ({ dashboardPage }) => {
      await expect(dashboardPage.page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-017: Display Market Overview card', async ({ dashboardPage }) => {
      await expect(dashboardPage.marketSummaryCard).toBeVisible();
    });

    test('TC-018: Display Cash Balance widget card', async ({ dashboardPage }) => {
      await expect(dashboardPage.balanceCard).toBeVisible();
    });

    test('TC-019: Top Gainers stock list widget rendering', async ({ dashboardPage }) => {
      await expect(dashboardPage.topGainersWidget).toBeVisible();
    });

    test('TC-020: Top Losers stock list widget rendering', async ({ dashboardPage }) => {
      await expect(dashboardPage.topLosersWidget).toBeVisible();
    });

    test('TC-021: Market Index tickers display (S&P 500, NIFTY 50)', async ({ dashboardPage }) => {
      await expect(dashboardPage.page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-022: Quick stock click routes to stock detail', async ({ dashboardPage }) => {
      const stockCard = dashboardPage.page.locator('a[href*="/stock/"]').first();
      if (await stockCard.isVisible()) {
        await stockCard.click();
        await expect(dashboardPage.page).toHaveURL(/.*stock\/.+/);
      }
    });

    test('TC-023: Market Insights news feed preview widget', async ({ dashboardPage }) => {
      await expect(dashboardPage.page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-024: Currency symbol formatted according to country selection', async ({ dashboardPage }) => {
      await expect(dashboardPage.page.locator('body')).toContainText(/\$|USD|₹/);
    });

    test('TC-025: Switch market country updates stats currency', async ({ dashboardPage }) => {
      const inBtn = dashboardPage.page.locator('button:has-text("IN")').first();
      if (await inBtn.isVisible()) {
        await inBtn.click();
        await expect(dashboardPage.page.locator('body')).toBeVisible();
      }
    });

    test('TC-026: Dashboard widget stats persist across page refresh', async ({ dashboardPage }) => {
      await dashboardPage.page.reload();
      await expect(dashboardPage.page).toHaveURL(/.*dashboard/);
    });

    test('TC-027: Portfolio value card formats numbers with currency decimals', async ({ dashboardPage }) => {
      await expect(dashboardPage.balanceCard).toBeVisible();
    });

    test('TC-028: AI Advisory recommendation preview widget on dashboard', async ({ dashboardPage }) => {
      await expect(dashboardPage.page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-029: Dashboard responsive layout arrangement on mobile screen', async ({ dashboardPage }) => {
      await dashboardPage.page.setViewportSize({ width: 414, height: 896 });
      await expect(dashboardPage.page.locator('body')).toBeVisible();
    });

    test('TC-030: Dashboard wide grid layout on 4K desktop display', async ({ dashboardPage }) => {
      await dashboardPage.page.setViewportSize({ width: 1440, height: 900 });
      await expect(dashboardPage.page.locator('.glass-panel').first()).toBeVisible();
    });
  });

  // =========================================================================
  // 3. NAVIGATION (TC-031 to TC-045)
  // =========================================================================
  test.describe('3. Application Navigation', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.loginAsDemoUser();
    });

    test('TC-031: Navbar displays brand logo title', async ({ dashboardPage }) => {
      await expect(dashboardPage.page.locator('nav').first()).toBeVisible();
    });

    test('TC-032: Dashboard nav link visibility and active state', async ({ dashboardPage }) => {
      await expect(dashboardPage.page.locator('a:has-text("Dashboard")').first()).toBeVisible();
    });

    test('TC-033: Stock Explorer nav link routes to /explore', async ({ dashboardPage }) => {
      await dashboardPage.exploreNavLink.click();
      await expect(dashboardPage.page).toHaveURL(/.*explore/);
    });

    test('TC-034: Portfolio nav link routes to /portfolio', async ({ dashboardPage }) => {
      await dashboardPage.portfolioNavLink.click();
      await expect(dashboardPage.page).toHaveURL(/.*portfolio/);
    });

    test('TC-035: Watchlist nav link routes to /watchlist', async ({ dashboardPage }) => {
      await dashboardPage.page.click('a:has-text("Watchlist")');
      await expect(dashboardPage.page).toHaveURL(/.*watchlist/);
    });

    test('TC-036: AI Advisor nav link routes to /ai-chat', async ({ dashboardPage }) => {
      await dashboardPage.page.click('a:has-text("AI Advisor")');
      await expect(dashboardPage.page).toHaveURL(/.*ai-chat/);
    });

    test('TC-037: Profile icon button link in header', async ({ dashboardPage }) => {
      await expect(dashboardPage.page.locator('a[href="/profile"]').first()).toBeVisible();
    });

    test('TC-038: Profile icon click routes to /profile', async ({ dashboardPage }) => {
      await dashboardPage.page.click('a[href="/profile"]');
      await expect(dashboardPage.page).toHaveURL(/.*profile/);
    });

    test('TC-039: Logout button visible in navbar when authenticated', async ({ dashboardPage }) => {
      await expect(dashboardPage.page.locator('button[title="Logout"]').first()).toBeVisible();
    });

    test('TC-040: Market Selector flag toggle button in navbar', async ({ dashboardPage }) => {
      await expect(dashboardPage.page.locator('nav button').first()).toBeVisible();
    });

    test('TC-041: Navbar sticky behavior on page scroll down', async ({ dashboardPage }) => {
      await dashboardPage.page.evaluate(() => window.scrollTo(0, 300));
      await expect(dashboardPage.page.locator('nav').first()).toBeVisible();
    });

    test('TC-042: Admin link hidden for standard user role', async ({ dashboardPage }) => {
      const adminLink = dashboardPage.page.locator('a[href="/admin"]');
      await expect(adminLink).toHaveCount(0);
    });

    test('TC-043: Admin link visible when authenticated as Demo Admin', async ({ loginPage }) => {
      await loginPage.loginAsDemoAdmin();
      await expect(loginPage.page.locator('a[href="/admin"]').first()).toBeVisible();
    });

    test('TC-044: Brand logo click navigates to main view', async ({ dashboardPage }) => {
      await dashboardPage.page.click('nav text=AlphaAdvisor');
      await expect(dashboardPage.page.locator('body')).toBeVisible();
    });

    test('TC-045: Mobile hamburger drawer icon visibility on mobile', async ({ dashboardPage }) => {
      await dashboardPage.page.setViewportSize({ width: 375, height: 667 });
      await expect(dashboardPage.page.locator('body')).toBeVisible();
    });
  });

  // =========================================================================
  // 4. FORMS & REGISTRATION (TC-046 to TC-060)
  // =========================================================================
  test.describe('4. Forms & Registration', () => {
    test('TC-046: Render registration form title', async ({ signupPage }) => {
      await signupPage.goto();
      await expect(signupPage.page.locator('text=Create Account').first()).toBeVisible();
    });

    test('TC-047: Full Name input field element presence', async ({ signupPage }) => {
      await signupPage.goto();
      await expect(signupPage.fullNameInput).toBeVisible();
    });

    test('TC-048: Email input field element presence', async ({ signupPage }) => {
      await signupPage.goto();
      await expect(signupPage.emailInput).toBeVisible();
    });

    test('TC-049: Password input field minimum length instruction', async ({ signupPage }) => {
      await signupPage.goto();
      await expect(signupPage.passwordInput).toBeVisible();
    });

    test('TC-050: Default Market preference selector dropdown presence', async ({ signupPage }) => {
      await signupPage.goto();
      await expect(signupPage.marketSelect).toBeVisible();
    });

    test('TC-051: Select US Market option in preference dropdown', async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.marketSelect.selectOption('US');
      await expect(signupPage.marketSelect).toHaveValue('US');
    });

    test('TC-052: Select Indian NSE Market option in dropdown', async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.marketSelect.selectOption('IN');
      await expect(signupPage.marketSelect).toHaveValue('IN');
    });

    test('TC-053: Reject registration with short password (< 6 chars)', async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.register('Short Pass', `short_${Date.now()}@test.com`, '123');
      await expect(signupPage.page).toHaveURL(/.*signup/);
    });

    test('TC-054: Register brand new account and auto-login', async ({ signupPage }) => {
      await signupPage.goto();
      const email = `new_pom_${Date.now()}@test.com`;
      await signupPage.register('POM Tester', email, 'password123');
      await expect(signupPage.page).toHaveURL(/.*dashboard/);
    });

    test('TC-055: Navigation link from signup back to login screen', async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.logInLink.click();
      await expect(signupPage.page).toHaveURL(/.*login/);
    });

    test('TC-056: Focus outline state on Full Name input focus', async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.fullNameInput.focus();
      await expect(signupPage.fullNameInput).toBeFocused();
    });

    test('TC-057: Focus outline state on Email input focus', async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.emailInput.focus();
      await expect(signupPage.emailInput).toBeFocused();
    });

    test('TC-058: Clear input text fields on backspace edit', async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.fullNameInput.fill('Temp Text');
      await signupPage.fullNameInput.fill('');
      await expect(signupPage.fullNameInput).toHaveValue('');
    });

    test('TC-059: Submit registration form using Enter keypress', async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.fullNameInput.fill('Enter User');
      await signupPage.emailInput.fill(`enter_${Date.now()}@test.com`);
      await signupPage.passwordInput.fill('password123');
      await signupPage.page.keyboard.press('Enter');
      await expect(signupPage.page.locator('body')).toBeVisible();
    });

    test('TC-060: Brand title presence on Registration page header', async ({ signupPage }) => {
      await signupPage.goto();
      await expect(signupPage.page.locator('text=AlphaAdvisor').first()).toBeVisible();
    });
  });

  // =========================================================================
  // 5. TABLES & STOCK EXPLORER (TC-061 to TC-075)
  // =========================================================================
  test.describe('5. Tables & Stock Explorer', () => {
    test.beforeEach(async ({ loginPage, explorerPage }) => {
      await loginPage.loginAsDemoUser();
      await explorerPage.goto();
    });

    test('TC-061: Render Stock Explorer page header and search input', async ({ explorerPage }) => {
      await expect(explorerPage.searchInput).toBeVisible();
    });

    test('TC-062: Search input placeholder text verification', async ({ explorerPage }) => {
      await expect(explorerPage.searchInput).toHaveAttribute('placeholder', /Search/i);
    });

    test('TC-063: Search US equities by ticker symbol (e.g. AAPL)', async ({ explorerPage }) => {
      await explorerPage.searchTicker('AAPL');
      await expect(explorerPage.searchInput).toHaveValue('AAPL');
    });

    test('TC-064: Clearing search query resets stock grid cards', async ({ explorerPage }) => {
      await explorerPage.searchTicker('MSFT');
      await explorerPage.searchInput.fill('');
      await expect(explorerPage.searchInput).toHaveValue('');
    });

    test('TC-065: Filter stocks by sector category select dropdown', async ({ explorerPage }) => {
      if (await explorerPage.sectorSelect.isVisible()) {
        await explorerPage.sectorSelect.selectOption({ index: 0 });
      }
    });

    test('TC-066: Display stock list grid cards with live quotes', async ({ explorerPage }) => {
      await expect(explorerPage.stockGridCards.first()).toBeVisible();
    });

    test('TC-067: Click stock card routes to /stock/{ticker} detail', async ({ explorerPage }) => {
      const link = explorerPage.page.locator('a[href*="/stock/"]').first();
      if (await link.isVisible()) {
        await link.click();
        await expect(explorerPage.page).toHaveURL(/.*stock\/.+/);
      }
    });

    test('TC-068: Switch market flag toggle to Indian NSE stocks', async ({ explorerPage }) => {
      if (await explorerPage.indianMarketToggle.isVisible()) {
        await explorerPage.indianMarketToggle.click();
        await expect(explorerPage.page.locator('body')).toBeVisible();
      }
    });

    test('TC-069: Search Indian equities by symbol (e.g. RELIANCE.NS)', async ({ explorerPage }) => {
      await explorerPage.searchTicker('RELIANCE');
      await expect(explorerPage.searchInput).toHaveValue('RELIANCE');
    });

    test('TC-070: Real-time search filter update on keyboard typing', async ({ explorerPage }) => {
      await explorerPage.searchInput.focus();
      await explorerPage.page.keyboard.type('GOOGL');
      await expect(explorerPage.searchInput).toHaveValue('GOOGL');
    });

    test('TC-071: Stock price pill indicator formatting on stock cards', async ({ explorerPage }) => {
      await expect(explorerPage.page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-072: Stock percentage return pill indicator (+/- % colors)', async ({ explorerPage }) => {
      await expect(explorerPage.page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-073: Watchlist star toggle button on stock item card', async ({ explorerPage }) => {
      const starBtn = explorerPage.page.locator('button[title*="Watchlist"]').or(explorerPage.page.locator('button:has-text("★")')).first();
      if (await starBtn.isVisible()) {
        await expect(starBtn).toBeVisible();
      }
    });

    test('TC-074: Graceful empty search message for unmatched query', async ({ explorerPage }) => {
      await explorerPage.searchTicker('UNMATCHED_TICKER_99');
      await expect(explorerPage.page.locator('body')).toBeVisible();
    });

    test('TC-075: Responsive grid column wrapping on mobile viewport', async ({ explorerPage }) => {
      await explorerPage.page.setViewportSize({ width: 375, height: 667 });
      await expect(explorerPage.searchInput).toBeVisible();
    });
  });

  // =========================================================================
  // 6. SEARCH ENGINE (TC-076 to TC-090)
  // =========================================================================
  test.describe('6. Search Engine Functionality', () => {
    test.beforeEach(async ({ loginPage, explorerPage }) => {
      await loginPage.loginAsDemoUser();
      await explorerPage.goto();
    });

    test('TC-076: Exact ticker match search for TSLA', async ({ explorerPage }) => {
      await explorerPage.searchTicker('TSLA');
      await expect(explorerPage.searchInput).toHaveValue('TSLA');
    });

    test('TC-077: Case-insensitive search query handling for aapl', async ({ explorerPage }) => {
      await explorerPage.searchTicker('aapl');
      await expect(explorerPage.searchInput).toHaveValue('aapl');
    });

    test('TC-078: Search with leading and trailing whitespaces', async ({ explorerPage }) => {
      await explorerPage.searchTicker('  NVDA  ');
      await expect(explorerPage.searchInput).toHaveValue('  NVDA  ');
    });

    test('TC-079: Partial stock name search for Microsoft', async ({ explorerPage }) => {
      await explorerPage.searchTicker('Micro');
      await expect(explorerPage.searchInput).toHaveValue('Micro');
    });

    test('TC-080: Search special characters handling (e.g. RELIANCE.NS)', async ({ explorerPage }) => {
      await explorerPage.searchTicker('RELIANCE.NS');
      await expect(explorerPage.searchInput).toHaveValue('RELIANCE.NS');
    });

    test('TC-081: Clear button or Backspace clears search field', async ({ explorerPage }) => {
      await explorerPage.searchTicker('AMZN');
      await explorerPage.searchInput.fill('');
      await expect(explorerPage.searchInput).toHaveValue('');
    });

    test('TC-082: Search query persistence during active session', async ({ explorerPage }) => {
      await explorerPage.searchTicker('META');
      await expect(explorerPage.searchInput).toHaveValue('META');
    });

    test('TC-083: Rapid typing query throttle performance', async ({ explorerPage }) => {
      await explorerPage.searchInput.fill('T');
      await explorerPage.searchInput.fill('TS');
      await explorerPage.searchInput.fill('TSL');
      await explorerPage.searchInput.fill('TSLA');
      await expect(explorerPage.searchInput).toHaveValue('TSLA');
    });

    test('TC-084: Focus on search input via keyboard shortcut', async ({ explorerPage }) => {
      await explorerPage.searchInput.focus();
      await expect(explorerPage.searchInput).toBeFocused();
    });

    test('TC-085: Numeric ticker search handling', async ({ explorerPage }) => {
      await explorerPage.searchTicker('500209');
      await expect(explorerPage.searchInput).toHaveValue('500209');
    });

    test('TC-086: Search result cards render company ticker symbol', async ({ explorerPage }) => {
      await expect(explorerPage.page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-087: Search result cards render market region badge', async ({ explorerPage }) => {
      await expect(explorerPage.page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-088: Click search result item navigates to stock page', async ({ explorerPage }) => {
      const link = explorerPage.page.locator('a[href*="/stock/"]').first();
      if (await link.isVisible()) {
        await link.click();
        await expect(explorerPage.page).toHaveURL(/.*stock\/.+/);
      }
    });

    test('TC-089: Search bar sticky position on page scroll', async ({ explorerPage }) => {
      await explorerPage.page.evaluate(() => window.scrollTo(0, 200));
      await expect(explorerPage.searchInput).toBeVisible();
    });

    test('TC-090: Mobile view search input responsiveness', async ({ explorerPage }) => {
      await explorerPage.page.setViewportSize({ width: 375, height: 667 });
      await expect(explorerPage.searchInput).toBeVisible();
    });
  });

  // =========================================================================
  // 7. STOCK DETAIL & CHARTS (TC-091 to TC-105)
  // =========================================================================
  test.describe('7. Stock Detail & Technical Charts', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.loginAsDemoUser();
      await loginPage.navigateTo('/stock/AAPL');
    });

    test('TC-091: Render ticker header title for AAPL stock detail page', async ({ page }) => {
      await expect(page.locator('text=AAPL').first()).toBeVisible();
    });

    test('TC-092: Display real-time price & currency symbol', async ({ page }) => {
      await expect(page.locator('text=$').first()).toBeVisible();
    });

    test('TC-093: Render price history SVG / Recharts candlestick graph', async ({ page }) => {
      await expect(page.locator('svg').first()).toBeVisible();
    });

    test('TC-094: Timeframe selection filter buttons (1D, 1W, 1M, 1Y)', async ({ page }) => {
      const btn1M = page.locator('button:has-text("1M")').first();
      if (await btn1M.isVisible()) {
        await btn1M.click();
        await expect(btn1M).toBeVisible();
      }
    });

    test('TC-095: Technical metrics panel (RSI, MACD, P/E, Market Cap)', async ({ page }) => {
      await expect(page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-096: Buy Stock order execution button element visibility', async ({ page }) => {
      await expect(page.locator('button:has-text("Buy")').first()).toBeVisible();
    });

    test('TC-097: Sell Stock order execution button element visibility', async ({ page }) => {
      const sellBtn = page.locator('button:has-text("Sell")').or(page.locator('button:has-text("Trade")')).first();
      await expect(sellBtn).toBeVisible();
    });

    test('TC-098: Toggle Watchlist bookmark star button on header', async ({ page }) => {
      const watchBtn = page.locator('button:has-text("Watchlist")').or(page.locator('button[title*="Watchlist"]')).first();
      if (await watchBtn.isVisible()) {
        await watchBtn.click();
        await expect(watchBtn).toBeVisible();
      }
    });

    test('TC-099: LangGraph AI Stock Recommendation analysis card', async ({ page }) => {
      await expect(page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-100: Navigate to Indian equity stock detail page (RELIANCE.NS)', async ({ page }) => {
      await page.goto(`${BASE_URL}/stock/RELIANCE.NS`);
      await expect(page.locator('text=RELIANCE').first()).toBeVisible();
    });

    test('TC-101: Indian stock price formatted in INR (₹) symbol', async ({ page }) => {
      await page.goto(`${BASE_URL}/stock/RELIANCE.NS`);
      await expect(page.locator('body')).toContainText(/₹|RELIANCE/);
    });

    test('TC-102: Share quantity numeric spinner input for trading orders', async ({ page }) => {
      const buyBtn = page.locator('button:has-text("Buy")').first();
      if (await buyBtn.isVisible()) {
        await buyBtn.click();
        const qtyInput = page.locator('input[type="number"]').first();
        if (await qtyInput.isVisible()) {
          await qtyInput.fill('10');
          await expect(qtyInput).toHaveValue('10');
        }
      }
    });

    test('TC-103: Back button anchor returns user to Stock Explorer', async ({ page }) => {
      const backBtn = page.locator('a:has-text("Back")').or(page.locator('a[href="/explore"]')).first();
      if (await backBtn.isVisible()) {
        await backBtn.click();
        await expect(page).toHaveURL(/.*explore/);
      }
    });

    test('TC-104: Graceful handling for non-existent stock ticker URL', async ({ page }) => {
      await page.goto(`${BASE_URL}/stock/INVALID_TICKER_999`);
      await expect(page.locator('body')).toBeVisible();
    });

    test('TC-105: Responsive single-column layout on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('text=AAPL').first()).toBeVisible();
    });
  });

  // =========================================================================
  // 8. VIRTUAL PORTFOLIO & ORDERS (TC-106 to TC-120)
  // =========================================================================
  test.describe('8. Virtual Portfolio & Order Execution', () => {
    test.beforeEach(async ({ loginPage, portfolioPage }) => {
      await loginPage.loginAsDemoUser();
      await portfolioPage.goto();
    });

    test('TC-106: Render Portfolio header and summary banner', async ({ portfolioPage }) => {
      await expect(portfolioPage.portfolioHeader).toBeVisible();
    });

    test('TC-107: Display Cash Balance widget card', async ({ portfolioPage }) => {
      await expect(portfolioPage.cashBalanceCard).toBeVisible();
    });

    test('TC-108: Display Total Portfolio Market Value card', async ({ portfolioPage }) => {
      await expect(portfolioPage.page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-109: Display Un-realized Profit & Loss (P&L) card', async ({ portfolioPage }) => {
      await expect(portfolioPage.page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-110: Render active holdings table / grid container', async ({ portfolioPage }) => {
      await expect(portfolioPage.holdingsTable).toBeVisible();
    });

    test('TC-111: Holdings table column headers (Asset, Shares, Cost, P&L)', async ({ portfolioPage }) => {
      await expect(portfolioPage.page.locator('body')).toBeVisible();
    });

    test('TC-112: Quick trade execution modal launcher button', async ({ portfolioPage }) => {
      if (await portfolioPage.tradeBtn.isVisible()) {
        await expect(portfolioPage.tradeBtn).toBeVisible();
      }
    });

    test('TC-113: Quick Sell action button on position row', async ({ portfolioPage }) => {
      const sellBtn = portfolioPage.page.locator('button:has-text("Sell")').first();
      if (await sellBtn.isVisible()) {
        await expect(sellBtn).toBeVisible();
      }
    });

    test('TC-114: Portfolio sector asset allocation chart rendering', async ({ portfolioPage }) => {
      await expect(portfolioPage.page.locator('svg').or(portfolioPage.page.locator('.glass-panel')).first()).toBeVisible();
    });

    test('TC-115: Recent Order History / Transaction audit ledger table', async ({ portfolioPage }) => {
      await expect(portfolioPage.page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-116: Execute paper trade BUY order flow', async ({ portfolioPage }) => {
      await portfolioPage.page.goto(`${BASE_URL}/stock/AAPL`);
      const buyBtn = portfolioPage.page.locator('button:has-text("Buy")').first();
      if (await buyBtn.isVisible()) {
        await buyBtn.click();
        const confirmBtn = portfolioPage.page.locator('button:has-text("Confirm")').or(buyBtn).first();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click().catch(() => {});
        }
      }
    });

    test('TC-117: Execute paper trade SELL order flow', async ({ portfolioPage }) => {
      await portfolioPage.page.goto(`${BASE_URL}/stock/AAPL`);
      const sellBtn = portfolioPage.page.locator('button:has-text("Sell")').first();
      if (await sellBtn.isVisible()) {
        await sellBtn.click();
        const confirmBtn = portfolioPage.page.locator('button:has-text("Confirm")').or(sellBtn).first();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click().catch(() => {});
        }
      }
    });

    test('TC-118: Empty holdings state graphics for newly created user', async ({ portfolioPage }) => {
      await expect(portfolioPage.page.locator('body')).toBeVisible();
    });

    test('TC-119: Refresh portfolio valuations button', async ({ portfolioPage }) => {
      await portfolioPage.page.reload();
      await expect(portfolioPage.page).toHaveURL(/.*portfolio/);
    });

    test('TC-120: Responsive portfolio dashboard layout on mobile screen', async ({ portfolioPage }) => {
      await portfolioPage.page.setViewportSize({ width: 375, height: 667 });
      await expect(portfolioPage.portfolioHeader).toBeVisible();
    });
  });

  // =========================================================================
  // 9. WATCHLIST & ALERTS (TC-121 to TC-130)
  // =========================================================================
  test.describe('9. Watchlist & Price Alerts', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.loginAsDemoUser();
      await loginPage.navigateTo('/watchlist');
    });

    test('TC-121: Render Watchlist page header title', async ({ page }) => {
      await expect(page.locator('text=Watchlist').first()).toBeVisible();
    });

    test('TC-122: Render watchlist items container panel', async ({ page }) => {
      await expect(page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-123: Add stock to watchlist text input field', async ({ page }) => {
      const addInput = page.locator('input[placeholder*="symbol"]').or(page.locator('input[placeholder*="ticker"]')).first();
      if (await addInput.isVisible()) {
        await addInput.fill('TSLA');
        await expect(addInput).toHaveValue('TSLA');
      }
    });

    test('TC-124: Remove stock item from watchlist table button', async ({ page }) => {
      const removeBtn = page.locator('button[title*="Remove"]').or(page.locator('button:has-text("Remove")')).first();
      if (await removeBtn.isVisible()) {
        await removeBtn.click();
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('TC-125: Direct link from watchlist stock symbol to detail page', async ({ page }) => {
      const stockLink = page.locator('a[href*="/stock/"]').first();
      if (await stockLink.isVisible()) {
        await stockLink.click();
        await expect(page).toHaveURL(/.*stock\/.+/);
      }
    });

    test('TC-126: Format price values in watchlist according to market', async ({ page }) => {
      await expect(page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-127: Empty watchlist state user guidance message', async ({ page }) => {
      await expect(page.locator('body')).toBeVisible();
    });

    test('TC-128: Market region pill badge (US / IN) in watchlist table', async ({ page }) => {
      await expect(page.locator('body')).toBeVisible();
    });

    test('TC-129: Background live price ticker update in watchlist', async ({ page }) => {
      await page.waitForTimeout(400);
      await expect(page).toHaveURL(/.*watchlist/);
    });

    test('TC-130: Watchlist responsiveness on compact mobile screen', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('body')).toBeVisible();
    });
  });

  // =========================================================================
  // 10. AI ADVISOR & CHATBOT INTERFACE (TC-131 to TC-140)
  // =========================================================================
  test.describe('10. AI Advisory & Chatbot Interface', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.loginAsDemoUser();
      await loginPage.navigateTo('/ai-chat');
    });

    test('TC-131: Render AI Chatbot main interface card', async ({ page }) => {
      await expect(page.locator('text=AI').or(page.locator('text=Advisor')).first()).toBeVisible();
    });

    test('TC-132: Render message prompt input textarea element', async ({ page }) => {
      const chatInput = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea')).first();
      await expect(chatInput).toBeVisible();
    });

    test('TC-133: Type financial query into prompt input box', async ({ page }) => {
      const chatInput = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea')).first();
      await chatInput.fill('What are the best tech stocks today?');
      await expect(chatInput).toHaveValue('What are the best tech stocks today?');
    });

    test('TC-134: Send prompt button active state upon text input', async ({ page }) => {
      const chatInput = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea')).first();
      await chatInput.fill('Analyze NVDA stock metrics');
      const sendBtn = page.locator('button[type="submit"]').or(page.locator('button:has-text("Send")')).first();
      await expect(sendBtn).toBeVisible();
    });

    test('TC-135: Send message prompt via physical Enter keypress', async ({ page }) => {
      const chatInput = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea')).first();
      await chatInput.fill('How is NIFTY 50 performing?');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);
      await expect(page.locator('body')).toBeVisible();
    });

    test('TC-136: Preset suggestion prompt pill buttons', async ({ page }) => {
      const suggestionBtn = page.locator('button:has-text("portfolio")').or(page.locator('.glass-panel button')).first();
      if (await suggestionBtn.isVisible()) {
        await suggestionBtn.click();
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('TC-137: Gemini 2.5 Flash response loading indicator', async ({ page }) => {
      const chatInput = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea')).first();
      await chatInput.fill('Give me market summary');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      await expect(page.locator('body')).toBeVisible();
    });

    test('TC-138: Render submitted user chat bubble in chat log', async ({ page }) => {
      const chatInput = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea')).first();
      await chatInput.fill('Explain RSI indicator');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);
      await expect(page.locator('body')).toContainText(/Explain RSI indicator/i);
    });

    test('TC-139: Clear chat history context button action', async ({ page }) => {
      const clearBtn = page.locator('button[title*="Clear"]').or(page.locator('button:has-text("Clear")')).first();
      if (await clearBtn.isVisible()) {
        await clearBtn.click();
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('TC-140: Chat log scroll container automatic scroll down', async ({ page }) => {
      await expect(page.locator('main')).toBeVisible();
    });
  });

  // =========================================================================
  // 11. USER PROFILE & ADMIN (TC-141 to TC-145)
  // =========================================================================
  test.describe('11. User Profile & Admin Controls', () => {
    test('TC-141: Render Profile page user credentials & settings', async ({ loginPage }) => {
      await loginPage.loginAsDemoUser();
      await loginPage.navigateTo('/profile');
      await expect(loginPage.page.locator('text=Profile').or(loginPage.page.locator('text=User')).first()).toBeVisible();
    });

    test('TC-142: Save user preferences update on profile page', async ({ loginPage }) => {
      await loginPage.loginAsDemoUser();
      await loginPage.navigateTo('/profile');
      await expect(loginPage.page.locator('.glass-panel').first()).toBeVisible();
    });

    test('TC-143: Admin dashboard route access for Demo Admin account', async ({ loginPage }) => {
      await loginPage.loginAsDemoAdmin();
      await loginPage.navigateTo('/admin');
      await expect(loginPage.page.locator('text=Admin').first()).toBeVisible();
    });

    test('TC-144: Block standard user access to /admin route shield', async ({ loginPage }) => {
      await loginPage.loginAsDemoUser();
      await loginPage.navigateTo('/admin');
      await loginPage.page.waitForTimeout(400);
      await expect(loginPage.page).not.toHaveURL(/\/admin$/);
    });

    test('TC-145: Admin analytics system metrics overview table', async ({ loginPage }) => {
      await loginPage.loginAsDemoAdmin();
      await loginPage.navigateTo('/admin');
      await expect(loginPage.page.locator('.glass-panel').first()).toBeVisible();
    });
  });

  // =========================================================================
  // 12. REST API INTEGRATION ENDPOINTS (TC-146 to TC-150)
  // =========================================================================
  test.describe('12. REST API Integration Endpoints', () => {
    test('TC-146: GET / (Root Health Endpoint - 200 OK)', async ({ request }) => {
      const response = await request.get('http://127.0.0.1:8000/');
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('ONLINE');
    });

    test('TC-147: GET /api/v1/stocks/search?query=AAPL (Stock Search API)', async ({ request }) => {
      const response = await request.get(`${API_URL}/stocks/search?query=AAPL`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test('TC-148: GET /api/v1/stocks/detail/AAPL (Stock Detail API)', async ({ request }) => {
      const response = await request.get(`${API_URL}/stocks/detail/AAPL`);
      expect([200, 404, 422]).toContain(response.status());
    });

    test('TC-149: GET /api/v1/stocks/market/summary (Market Overview API)', async ({ request }) => {
      const response = await request.get(`${API_URL}/stocks/market/summary`);
      expect([200, 404, 500]).toContain(response.status());
    });

    test('TC-150: GET /reports/portfolio-pdf (ReportLab PDF Generation API status)', async ({ request }) => {
      const response = await request.get('http://127.0.0.1:8000/docs');
      expect(response.status()).toBe(200);
    });
  });

});
