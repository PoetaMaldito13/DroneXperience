import { chromium, expect } from "@playwright/test";
import fs from "node:fs";
import { fixtures } from "../test/fixtures.js";
import { pool } from "../src/config/database.js";
const f = await fixtures();
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const report = { checks: [], errors: [], warnings: [], screenshots: [] };
page.on("pageerror", (e) => report.errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "warning") report.warnings.push(m.text());
});
const base = "http://127.0.0.1:5173";
async function step(name, run) {
  await run();
  report.checks.push(name);
  console.info("PASS " + name);
}
async function screenshot(name) {
  const path = "artifacts/" + name + ".png";
  await page.screenshot({ path, fullPage: true });
  report.screenshots.push(path);
}
async function select(label, search, name) {
  const input = page.getByRole("combobox", { name: label, exact: true });
  await input.fill(search);
  await page.getByRole("option", { name, exact: true }).click();
}
async function next() {
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
}
async function goto(path) {
  await page.goto(base + path);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByLabel("Cargando información")).toHaveCount(0);
}
try {
  await step("Dashboard real y navegación de todos los módulos", async () => {
    await goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Resumen operacional" }),
    ).toBeVisible();
    for (const name of [
      "Drones",
      "Clientes",
      "Empresas",
      "Empleados",
      "Pilotos",
      "Certificaciones",
      "Arriendos",
      "Inspecciones",
      "Accesorios",
      "Aseguradoras",
      "Seguros",
      "Proveedores",
      "Operadores",
      "Configuración",
    ]) {
      await page
        .getByRole("navigation")
        .getByRole("link", { name, exact: true })
        .click();
      await expect(page.getByLabel("Cargando información")).toHaveCount(0);
      await expect(page.locator("main")).not.toContainText(
        "No se pudo acceder",
      );
    }
  });
  await step(
    "Crear dron recreativo, profesional y editar desde la UI",
    async () => {
      for (const type of ["Recreativo", "Profesional"]) {
        await goto("/drones/nuevo");
        await page
          .getByLabel("Identificador", { exact: true })
          .fill("QA-UI-" + type + "-" + f.stamp);
        await page.getByLabel("Marca", { exact: true }).fill("QA Aero");
        await page.getByLabel("Modelo", { exact: true }).fill("UI Explorer");
        await page.getByLabel("Color", { exact: true }).fill("Gris");
        await page
          .getByLabel("Año de fabricación", { exact: true })
          .fill("2026");
        if (type === "Profesional") {
          await page.getByRole("combobox", { name: "Tipo de dron" }).click();
          await page
            .getByRole("option", { name: "Profesional", exact: true })
            .click();
        }
        const field =
          type === "Recreativo"
            ? "Autonomía de batería (min)"
            : "Resolución de cámara (MP)";
        await page
          .getByLabel(field, { exact: true })
          .fill(type === "Recreativo" ? "35" : "48");
        await expect(
          page.getByLabel(
            type === "Recreativo"
              ? "Resolución de cámara (MP)"
              : "Autonomía de batería (min)",
            { exact: true },
          ),
        ).toHaveCount(0);
        await page
          .getByRole("button", { name: "Guardar", exact: true })
          .click();
        await page.waitForURL(/\/drones\/\d+$/);
        const id = page.url().split("/").at(-1);
        f.droneIds.push(id);
        await page
          .getByRole("link", { name: "Editar dron", exact: true })
          .click();
        await page
          .getByLabel("Modelo", { exact: true })
          .fill("UI Explorer Editado");
        await page
          .getByRole("button", { name: "Guardar", exact: true })
          .click();
        await page.waitForURL(/\/drones\/\d+$/);
        await expect(page.locator("main")).toContainText("UI Explorer Editado");
      }
    },
  );
  await step("Crear cliente individual y empresa desde la UI", async () => {
    for (const company of [false, true]) {
      await goto(company ? "/empresas" : "/clientes");
      await page
        .getByRole("button", {
          name: company ? "Nueva empresa" : "Nuevo cliente",
          exact: true,
        })
        .click();
      const dialog = page.getByRole("dialog");
      if (company) {
        await dialog.getByLabel("RUT", { exact: true }).fill("UIE" + f.stamp);
        await dialog
          .getByLabel("Razón social", { exact: true })
          .fill("QA UI Empresa " + f.stamp);
      } else {
        await dialog.getByLabel("RUN", { exact: true }).fill("UIP" + f.stamp);
        await dialog
          .getByLabel("Nombres", { exact: true })
          .fill("QA UI Persona");
        await dialog
          .getByLabel("Apellido paterno", { exact: true })
          .fill("Prueba");
        await dialog
          .getByLabel("Apellido materno", { exact: true })
          .fill("Temporal");
      }
      await dialog
        .getByLabel("Dirección", { exact: true })
        .fill("Dirección QA");
      await dialog.getByLabel("Comuna", { exact: true }).fill("Santiago");
      await dialog.getByLabel("Región", { exact: true }).fill("Metropolitana");
      await dialog
        .getByLabel("Teléfonos", { exact: true })
        .fill("+56 9 QA " + f.stamp);
      await dialog
        .getByRole("button", { name: "Guardar", exact: true })
        .click();
      await page.waitForURL(company ? /\/empresas\/\d+$/ : /\/clientes\/\d+$/);
      f.customerIds.push(page.url().split("/").at(-1));
      await expect(page.locator("main")).toContainText("+56 9 QA " + f.stamp);
    }
  });
  await step(
    "Empresa muestra operadores y piloto muestra certificaciones",
    async () => {
      await goto("/empresas/" + f.ids.company.cliente_id);
      await expect(page.locator("main")).toContainText("QA Operador");
      await goto("/pilotos/" + f.ids.employee.empleado_id);
      await expect(page.locator("main")).toContainText("VLOS");
      await goto("/empleados/" + f.ids.employee.empleado_id);
      await expect(page.locator("main")).toContainText("$1.100.000");
    },
  );
  await step(
    "Wizard exige seguros y accesorios; guarda el arriendo real",
    async () => {
      await goto("/arriendos/nuevo");
      await next();
      await expect(page.getByRole("alert")).toContainText(
        "Selecciona un cliente.",
      );
      await select("Cliente", "QA Daniela", "QA Daniela Prueba Temporal");
      await next();
      await select(
        "Dron disponible",
        f.ids.drone.identificador,
        f.ids.drone.identificador,
      );
      await next();
      await select(
        "Piloto certificado",
        "QA Nicolás",
        "QA Nicolás Prueba Temporal",
      );
      await next();
      await page.getByLabel("Inicio", { exact: true }).fill("2030-05-11T10:00");
      await page
        .getByLabel("Devolución programada", { exact: true })
        .fill("2030-05-11T18:00");
      await page
        .getByLabel("Costo total acordado (CLP, opcional)", { exact: true })
        .fill("145000");
      await next();
      await next();
      await expect(page.getByRole("alert").last()).toContainText(
        "Selecciona al menos un seguro",
      );
      await select("Agregar seguro", "QA Cobertura", "QA Cobertura de vuelo");
      await next();
      await next();
      await expect(page.getByRole("alert").last()).toContainText(
        "Selecciona al menos un accesorio",
      );
      await select("Agregar accesorio", "QA Batería", "QA Batería adicional");
      await page.getByLabel("Cantidad", { exact: true }).fill("2");
      await next();
      await expect(page.locator("main")).toContainText("$145.000");
      await screenshot("wizard-review-1440");
      await page
        .getByRole("button", { name: "Guardar arriendo", exact: true })
        .click();
      await page.waitForURL(/\/arriendos\/\d+$/);
      f.rentalIds.push(page.url().split("/").at(-1));
    },
  );
  await step(
    "Inspección, confirmación, vuelo, devolución y timeline desde la UI",
    async () => {
      await page
        .getByRole("button", { name: "Registrar inspección", exact: true })
        .click();
      const dialog = page.getByRole("dialog");
      await dialog
        .getByLabel("Estado de la carcasa", { exact: true })
        .fill("Carcasa íntegra, sin daños.");
      await dialog
        .getByLabel("Estado de las aspas", { exact: true })
        .fill("Aspas completas, sin fisuras.");
      await dialog
        .getByRole("button", { name: "Guardar", exact: true })
        .click();
      await expect(dialog).toHaveCount(0);
      for (const name of ["Confirmar arriendo", "Iniciar vuelo"]) {
        await page.getByRole("button", { name, exact: true }).click();
        await page
          .getByRole("dialog")
          .getByRole("button", { name: "Confirmar", exact: true })
          .click();
        await expect(page.getByRole("dialog")).toHaveCount(0);
      }
      await page
        .getByRole("button", { name: "Registrar inspección", exact: true })
        .click();
      await page
        .getByRole("dialog")
        .getByLabel("Estado de la carcasa", { exact: true })
        .fill("Sin daños nuevos.");
      await page
        .getByRole("dialog")
        .getByLabel("Estado de las aspas", { exact: true })
        .fill("Sin daños nuevos.");
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Guardar", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await page
        .getByRole("button", { name: "Finalizar arriendo", exact: true })
        .click();
      await page
        .getByRole("dialog")
        .getByLabel("Devolución real", { exact: true })
        .fill("2030-05-11T17:30");
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Confirmar", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(page.locator("main")).toContainText("Finalizado");
      await expect(page.locator("main")).toContainText("Historial de estados");
      await screenshot("rental-detail-1440");
    },
  );
  await step(
    "Revisión visual y responsive 1366, 1440, 1920, tablet y móvil",
    async () => {
      await goto("/dashboard");
      for (const [width, height] of [
        [1366, 768],
        [1440, 900],
        [1920, 1080],
        [820, 1180],
        [390, 844],
      ]) {
        await page.setViewportSize({ width, height });
        await screenshot("dashboard-" + width);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        );
        expect(overflow, "overflow " + width).toBe(false);
        if (width < 1200) {
          await page
            .getByRole("button", { name: "Abrir navegación", exact: true })
            .click();
          await page
            .getByRole("navigation")
            .getByRole("link", { name: "Drones", exact: true })
            .click();
          await expect(
            page.getByRole("heading", { name: "Drones", exact: true }),
          ).toBeVisible();
          await goto("/dashboard");
        }
      }
      await page.setViewportSize({ width: 1440, height: 900 });
      await page
        .getByRole("button", { name: "Contraer menú", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Expandir menú", exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Cambiar tema", exact: true })
        .click();
      await screenshot("dashboard-dark-1440");
      await page
        .getByRole("button", { name: "Cambiar tema", exact: true })
        .click();
    },
  );
  await step("Editar arriendo de empresa conserva operador y relaciones", async () => {
    const rental = await f.create("arriendos", {
      ...f.ids.rentalBody,
      cliente_id: f.ids.company.cliente_id,
      operador_id: f.ids.operator.operador_id,
    });
    f.rentalIds.push(rental.arriendo_id);
    await goto("/arriendos/" + rental.arriendo_id + "/editar");
    await expect(page.getByRole("combobox", {name: "Operador autorizado (opcional)", exact:true})).toHaveValue("QA Operador");
    for (let i=0;i<6;i++) await next();
    await expect(page.locator("main")).toContainText("QA Operador");
    await page.getByRole("button",{name:"Guardar arriendo",exact:true}).click();
    await page.waitForURL(new RegExp("/arriendos/" + rental.arriendo_id + "$"));
    await expect(page.locator("main")).toContainText("QA Operador");
    await page.getByRole("button",{name:"Cancelar arriendo",exact:true}).click();
    await page.getByRole("dialog").getByRole("button",{name:"Confirmar",exact:true}).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("main")).toContainText("Cancelado");
  });
  await step("Edición de catálogos y tabla de drones", async () => {
    await goto("/empleados/"+f.ids.employee.empleado_id);
    await page.getByRole("button",{name:"Editar",exact:true}).click();
    await page.getByRole("dialog").getByLabel("Cargo",{exact:true}).fill("Piloto de operaciones");
    await page.getByRole("dialog").getByRole("button",{name:"Guardar",exact:true}).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("main")).toContainText("Piloto de operaciones");
    await goto("/seguros/"+f.ids.insurance.seguro_id);
    await page.getByRole("button",{name:"Editar",exact:true}).click();
    await expect(page.getByRole("dialog").getByRole("combobox",{name:"Aseguradora",exact:true})).toHaveValue("QA Aseguradora "+f.stamp);
    await page.getByRole("dialog").getByLabel("Costo (CLP)",{exact:true}).fill("17500");
    await page.getByRole("dialog").getByRole("button",{name:"Guardar",exact:true}).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("main")).toContainText("$17.500");
    await goto("/drones");
    await expect(page.getByRole("table")).toBeVisible();
    await screenshot("drones-table-1440");
  });
  await step("Error API legible y recuperación", async () => {
    await page.route("**/api/drones?*", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message:
            "Servicio temporalmente no disponible. Inténtalo nuevamente.",
        }),
      }),
    );
    await goto("/drones");
    await expect(page.getByRole("alert")).toContainText(
      "Servicio temporalmente no disponible",
    );
    await page.unroute("**/api/drones?*");
    await page.getByRole("button", { name: "Reintentar", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
  expect(report.errors).toEqual([]);
  expect(report.warnings).toEqual([]);
} catch (error) {
  report.failure = error.message;
  await screenshot("qa-failure");
  process.exitCode = 1;
  console.error(error.message);
} finally {
  await browser.close();
  await f.cleanup();
  await pool.end();
  fs.writeFileSync(
    "artifacts/browser-qa.json",
    JSON.stringify(report, null, 2),
  );
  console.info(JSON.stringify(report, null, 2));
}
