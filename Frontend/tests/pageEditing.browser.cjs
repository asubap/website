// Run against Vite: node tests/pageEditing.browser.cjs
// Install Playwright separately or set PLAYWRIGHT_MODULE to its module directory.
// All authentication and page-content requests are isolated test doubles. No real
// accounts, sessions, or database rows are changed by this browser test.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const origin = process.env.TEST_FRONTEND_URL || 'http://localhost:5173';
const output = process.env.TEST_OUTPUT_DIR || path.join(__dirname, '..', 'test-results', 'page-editing');
const rows = new Map();
let failNextSave = false;

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  async function createContext(role) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.route('**/src/context/auth/authProvider.tsx', route => route.fulfill({
      contentType: 'application/javascript',
      body: `const role = ${JSON.stringify(role)}; const session = role ? {access_token: 'test-token', user: {email: 'test@example.test'}} : null;
        export function AuthProvider({children}) { return children; }
        export function useAuth() { return {role, session, isAuthenticated: !!role, loading: false, authError: null, setSession(){}, setRole(){}, setAuthError(){}}; }`,
    }));
    await context.route('**/links?*', route => route.fulfill({ json: [{ link: 'https://example.com/apply' }] }));
    await context.route('**/page-content/*', async route => {
      const slug = new URL(route.request().url()).pathname.split('/').pop();
      const current = rows.get(slug) || { content: null, version: 0 };
      if (route.request().method() === 'GET') return route.fulfill({ json: current });
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204 });
      if (role !== 'e-board') return route.fulfill({ status: 403, json: { error: 'Forbidden' } });
      if (failNextSave) { failNextSave = false; return route.fulfill({ status: 503, json: { error: 'Changes could not be saved. Please try again later.' } }); }
      const draft = route.request().postDataJSON();
      if (draft.version !== current.version) return route.fulfill({ status: 409, json: { error: 'Another admin saved this page. Copy your edits, cancel, and reload before trying again.' } });
      const saved = { content: draft.content, version: current.version + 1 };
      rows.set(slug, saved);
      return route.fulfill({ json: saved });
    });
    return context;
  }
  try {
    const visitor = await createContext(null);
    const publicPage = await visitor.newPage();
    await publicPage.goto(`${origin}/about`);
    await publicPage.getByRole('heading', { name: 'About Us', exact: true }).waitFor();
    assert.equal(await publicPage.getByRole('button', { name: 'Edit page', exact: true }).count(), 0);
    await publicPage.screenshot({ path: path.join(output, 'about-public.png'), fullPage: true });
    const member = await createContext('general-member');
    const memberPage = await member.newPage();
    await memberPage.goto(`${origin}/membership`);
    await memberPage.getByRole('heading', { name: 'Membership Process', exact: true }).waitFor();
    assert.equal(await memberPage.getByRole('button', { name: 'Edit page', exact: true }).count(), 0);

    const admin = await createContext('e-board');
    const page = await admin.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/membership`);
    await page.getByRole('button', { name: 'Edit page', exact: true }).click();
    await page.getByLabel('Page title', { exact: true }).fill('Join our chapter');
    await page.getByLabel('Step 1, requirement 1', { exact: true }).fill('Updated membership requirement.');
    await page.screenshot({ path: path.join(output, 'membership-editing.png'), fullPage: true });
    await page.getByRole('button', { name: 'Save changes', exact: true }).first().click();
    await page.getByRole('heading', { name: 'Join our chapter', exact: true }).waitFor();
    await page.reload();
    await page.getByRole('heading', { name: 'Join our chapter', exact: true }).waitFor();
    await publicPage.goto(`${origin}/membership`);
    await publicPage.getByRole('heading', { name: 'Join our chapter', exact: true }).waitFor();
    await publicPage.getByText('Updated membership requirement.', { exact: true }).first().waitFor();

    await page.getByRole('button', { name: 'Edit page', exact: true }).click();
    await page.getByLabel('Page title', { exact: true }).fill('Discard me');
    await page.getByRole('button', { name: 'Cancel', exact: true }).first().click();
    await page.getByRole('heading', { name: 'Join our chapter', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Edit page', exact: true }).click();
    await page.getByLabel('Page title', { exact: true }).fill('Keep this failed draft');
    failNextSave = true;
    await page.getByRole('button', { name: 'Save changes', exact: true }).first().click();
    await page.getByRole('alert').first().waitFor();
    assert.equal(await page.getByLabel('Page title', { exact: true }).inputValue(), 'Keep this failed draft');
    await page.getByRole('button', { name: 'Cancel', exact: true }).first().click();

    const other = await admin.newPage();
    await other.goto(`${origin}/membership`);
    await other.getByRole('button', { name: 'Edit page', exact: true }).click();
    await page.getByRole('button', { name: 'Edit page', exact: true }).click();
    await page.getByLabel('Page title', { exact: true }).fill('First admin wins');
    await page.getByRole('button', { name: 'Save changes', exact: true }).first().click();
    await page.getByRole('heading', { name: 'First admin wins', exact: true }).waitFor();
    await other.getByLabel('Page title', { exact: true }).fill('Stale admin draft');
    await other.getByRole('button', { name: 'Save changes', exact: true }).first().click();
    await other.getByRole('alert').first().waitFor();
    assert.match(await other.getByRole('alert').first().innerText(), /Another admin/);
    assert.equal(await other.getByLabel('Page title', { exact: true }).inputValue(), 'Stale admin draft');
    await other.getByRole('button', { name: 'Cancel', exact: true }).first().click();

    await page.goto(`${origin}/about`);
    await page.getByRole('button', { name: 'Edit page', exact: true }).click();
    await page.getByLabel('Page title', { exact: true }).fill('About our chapter');
    const introduction = page.getByRole('group', { name: 'Introduction', exact: true }).frameLocator('iframe').locator('body');
    await introduction.waitFor({ timeout: 45000 });
    await introduction.fill('Edited introduction from the inline page editor.');
    await page.screenshot({ path: path.join(output, 'about-editing.png'), fullPage: true });
    await page.getByRole('button', { name: 'Save changes', exact: true }).first().click();
    await page.getByRole('heading', { name: 'About our chapter', exact: true }).waitFor();
    await publicPage.goto(`${origin}/about`);
    await publicPage.getByText('Edited introduction from the inline page editor.', { exact: true }).waitFor();
    await publicPage.setViewportSize({ width: 390, height: 844 });
    await publicPage.screenshot({ path: path.join(output, 'about-mobile.png'), fullPage: true });
    assert.ok(await publicPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.goto(`${origin}/membership`);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Edit page', exact: true }).click();
    await page.screenshot({ path: path.join(output, 'membership-editing-mobile.png'), fullPage: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    assert.deepEqual(errors, []);
    console.log('PASS: permissions, save/reload/public visibility, cancel, failed-save draft retention, conflict protection, rich text, mobile layout.');
    console.log(`Screenshots: ${output}`);
  } catch (error) {
    for (const [index, context] of browser.contexts().entries()) {
      for (const [pageIndex, page] of context.pages().entries()) {
        await page.screenshot({ path: path.join(output, `failure-${index}-${pageIndex}.png`) }).catch(() => {});
      }
    }
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
