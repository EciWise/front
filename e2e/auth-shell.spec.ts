import { expect, Locator, Page, test } from 'playwright/test';

async function mockRuntimeEnv(page: Page): Promise<void> {
  await page.route('**/assets/env.json', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ apiBaseUrl: 'http://localhost:3001' }),
    }),
  );
}

async function mockCompleteIaProfile(page: Page): Promise<void> {
  await page.route('**/ia/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        gender: 1,
        ethnicity: 2,
        parentalEducation: 3,
        studyTimeWeekly: 10,
        absences: 1,
        tutoring: 1,
        parentalSupport: 4,
        extracurricular: 0,
        sports: 1,
        music: 0,
        volunteering: 1,
        maritalStatus: 0,
        applicationMode: 1,
        applicationOrder: 1,
        course: 33,
        previousQualification: 1,
        nacionality: 1,
        motherQualification: 19,
        fatherQualification: 19,
        motherOccupation: 5,
        fatherOccupation: 5,
        displaced: 0,
        educationalSpecialNeeds: 0,
        debtor: 0,
        tuitionFeesUpToDate: 1,
        scholarshipHolder: 0,
        ageAtEnrollment: 19,
        international: 0,
        curricularUnits1stSemCredited: 0,
        curricularUnits1stSemEnrolled: 6,
        curricularUnits1stSemEvaluations: 6,
        curricularUnits1stSemApproved: 5,
      }),
    }),
  );
}

async function seedStudentSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('eciwise.token', 'e2e-token');
    localStorage.setItem(
      'eciwise.session',
      JSON.stringify({
        id: 'student-1',
        name: 'Ana Diaz',
        email: 'ana@escuelaing.edu.co',
        role: 'STUDENT',
        active: true,
        avatarUrl: null,
      }),
    );
  });
}

async function expectInsideViewport(locator: Locator, page: Page): Promise<void> {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  if (!box) {
    return;
  }
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (!viewport) {
    return;
  }
  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.y).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
}

async function fillRegisterStep1(page: Page): Promise<void> {
  await page.locator('input[formcontrolname="nombre"]').fill('Ana');
  await page.locator('input[formcontrolname="apellido"]').fill('Diaz');
  await page.locator('input[formcontrolname="email"]').fill('ana@gmail.com');
  await page.locator('input[formcontrolname="telefono"]').fill('3001234567');
  await page.locator('eci-password-strength-input input').nth(0).fill('Password1');
  await page.locator('eci-password-strength-input input').nth(1).fill('Password1');
  await page.locator('.auth__actions button').last().click();
}

async function chooseSelectOption(page: Page, selectIndex: number, optionIndex: number): Promise<void> {
  const select = page.locator('eci-select').nth(selectIndex);
  await select.locator('.select__trigger').click();
  await select.locator('.select__option').nth(optionIndex).click();
}

test.beforeEach(async ({ page }) => {
  await mockRuntimeEnv(page);
});

test('login y registro renderizan los controles principales sin backend', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page.locator('.auth__card')).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();

  await page.goto('/auth/register');
  await expect(page.locator('.auth__card--wide')).toBeVisible();
  await expect(page.locator('.auth__steps')).toBeVisible();
  await expect(page.locator('eci-password-strength-input input')).toHaveCount(2);
});

test('registro mobile permite hacer scroll hasta el final de la card sin recorte', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-mobile', 'Validacion especifica de viewport mobile');

  await page.goto('/auth/register');
  const auth = page.locator('.auth');
  await auth.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });

  const scroll = await auth.evaluate((node) => ({
    scrollTop: node.scrollTop,
    scrollHeight: node.scrollHeight,
    clientHeight: node.clientHeight,
  }));
  expect(scroll.scrollTop + scroll.clientHeight).toBeGreaterThanOrEqual(scroll.scrollHeight - 2);
  await expectInsideViewport(page.locator('.auth__switch'), page);
});

test('menu de idioma y notificaciones permanecen dentro del viewport autenticado', async ({
  page,
}) => {
  await mockCompleteIaProfile(page);
  await seedStudentSession(page);

  await page.goto('/student');
  await expect(page.locator('eci-top-bar')).toBeVisible();

  await page.locator('.lang-menu__trigger').click();
  await expect(page.locator('.lang-menu__panel')).toBeVisible();
  await expectInsideViewport(page.locator('.lang-menu__panel'), page);
  await page.keyboard.press('Escape');
  await expect(page.locator('.lang-menu__panel')).toHaveCount(0);

  await page.locator('.bell > .icon-button').click();
  await expect(page.locator('.bell__panel')).toBeVisible();
  await expectInsideViewport(page.locator('.bell__panel'), page);
  await page.locator('.bell__backdrop').click();
  await expect(page.locator('.bell__panel')).toHaveCount(0);
});

test('tooltips de datos IA quedan alineados al icono y sin desbordarse', async ({ page }) => {
  await page.goto('/auth/register');
  await fillRegisterStep1(page);

  const trigger = page.locator('.tip__trigger').first();
  await expect(trigger).toBeVisible();
  await trigger.hover();

  const bubble = page.locator('.tip__bubble--visible').first();
  await expect(bubble).toBeVisible();
  await expectInsideViewport(bubble, page);

  const triggerBox = await trigger.boundingBox();
  const bubbleBox = await bubble.boundingBox();
  expect(triggerBox).not.toBeNull();
  expect(bubbleBox).not.toBeNull();
  if (triggerBox && bubbleBox) {
    const triggerCenter = triggerBox.x + triggerBox.width / 2;
    const bubbleCenter = bubbleBox.x + bubbleBox.width / 2;
    expect(Math.abs(triggerCenter - bubbleCenter)).toBeLessThanOrEqual(150);
  }
});

test('registro completo envia payload esperado y redirige sin backend real', async ({ page }) => {
  await mockCompleteIaProfile(page);
  let payload: unknown;
  await page.route('**/auth/register', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'registered-token',
        user: {
          id: 'student-registered',
          email: 'ana@gmail.com',
          nombre: 'Ana',
          apellido: 'Diaz',
          rol: 'estudiante',
        },
      }),
    });
  });

  await page.goto('/auth/register');
  await fillRegisterStep1(page);

  await chooseSelectOption(page, 0, 1);
  await chooseSelectOption(page, 1, 2);
  await chooseSelectOption(page, 2, 3);
  await chooseSelectOption(page, 3, 4);
  await page.locator('.auth__actions button').last().click();

  await page.locator('input[formcontrolname="studyTimeWeekly"]').fill('12');
  await page.locator('input[formcontrolname="absences"]').fill('2');

  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/student$/);
  expect(payload).toMatchObject({
    email: 'ana@gmail.com',
    password: 'Password1',
    nombre: 'Ana',
    apellido: 'Diaz',
    telefono: '3001234567',
    datosIa: {
      gender: 1,
      ethnicity: 2,
      parentalEducation: 3,
      parentalSupport: 4,
      studyTimeWeekly: 12,
      absences: 2,
      tutoring: 0,
      sports: 0,
      volunteering: 0,
    },
  });
});
