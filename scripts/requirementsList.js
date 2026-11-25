import { describeRequirementSource, getRequirements, isRequirementSatisfied, neededByLines, onRequirementsChanged, requirementLabel, requirements } from "./requirements.js";
import { getUserConfig } from "./userConfig.js";

const MODULE_ID = "ripper-system-abstraction";
const I18N = `${MODULE_ID}.requirementsList`;
const SYSTEM_CONFIG_ID = `${MODULE_ID}-system-config`;

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

const SECTIONS = { actor: "actor", health: "health", item: "item", experience: "experience", currency: "currency", checks: "checks" };

function escapeLines(lines) {
  return lines.map((line) => foundry.utils.escapeHTML(line)).join("<br>");
}

function featureLabel(id) {
  const section = SECTIONS[id.split(".")[0]];
  const label = game.i18n.localize(requirementLabel(id));
  if (id === "checks") return label;
  const sectionLabel = section ? game.i18n.localize(`${MODULE_ID}.systemConfig.tabs.${section}`) : "";
  return sectionLabel ? `${sectionLabel}: ${label}` : label;
}

function dependsOnRsa(module) {
  try {
    return Array.from(module.relationships?.requires ?? []).some((entry) => entry?.id === MODULE_ID);
  } catch {
    return false;
  }
}

export class RequirementsListApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: `${MODULE_ID}-requirements-list`,
    classes: [`${MODULE_ID}-requirements-list`],
    window: {
      title: `${I18N}.title`,
      icon: "fa-solid fa-list-check",
      contentClasses: ["standard-form"],
      resizable: true,
    },
    position: { width: 640, height: 560 },
    actions: {
      openSystemConfig: RequirementsListApp.#onOpenSystemConfig,
    },
  };

  static PARTS = {
    body: { template: `modules/${MODULE_ID}/templates/requirements-list.hbs`, scrollable: [""] },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /** Open the list, bringing an open one to front. */
  static open() {
    const existing = foundry.applications.instances.get(this.DEFAULT_OPTIONS.id);
    if (existing) {
      existing.render({ force: true });
      existing.bringToFront?.();
      return existing;
    }
    return new this().render({ force: true });
  }

  static refresh() {
    const existing = foundry.applications.instances.get(this.DEFAULT_OPTIONS.id);
    if (existing?.rendered) existing.render();
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const config = getUserConfig();
    const registry = getRequirements();
    const modules = [];
    for (const [moduleId, entries] of Object.entries(registry)) {
      const module = game.modules.get(moduleId);
      if (!module?.active || !entries.length) continue;
      const rows = entries.map((entry) => {
        const satisfied = isRequirementSatisfied(entry.id, config);
        const line = neededByLines([{ title: module.title, reason: entry.reason, optional: entry.optional }]);
        let icon = "fa-solid fa-check rsa-ok";
        let tooltip = escapeLines([describeRequirementSource(entry.id, config)]);
        if (!satisfied) {
          icon = entry.optional ? "fa-solid fa-circle-info rsa-needed rsa-optional" : "fa-solid fa-triangle-exclamation rsa-needed";
          tooltip = escapeLines(line);
        }
        return { feature: featureLabel(entry.id), optional: entry.optional, reason: entry.reason || "-", icon, tooltip };
      });
      modules.push({ id: moduleId, title: module.title ?? moduleId, rows });
    }
    modules.sort((a, b) => a.title.localeCompare(b.title, game.i18n.lang));
    const undeclared = game.modules
      .filter((module) => module.active && module.id !== MODULE_ID && !(module.id in registry) && dependsOnRsa(module))
      .map((module) => game.i18n.format(`${I18N}.undeclared`, { module: module.title ?? module.id }))
      .sort((a, b) => a.localeCompare(b, game.i18n.lang));
    return Object.assign(context, {
      modules,
      undeclared,
      empty: !modules.length && !undeclared.length,
      buttons: [{ type: "button", action: "openSystemConfig", icon: "fa-solid fa-diagram-project", label: `${I18N}.openSystemConfig` }],
    });
  }

  static #onOpenSystemConfig() {
    try {
      const existing = foundry.applications.instances.get(SYSTEM_CONFIG_ID);
      if (existing) {
        existing.render({ force: true });
        existing.bringToFront?.();
        return;
      }
      const type = game.settings.menus.get(`${MODULE_ID}.systemConfigMenu`)?.type;
      if (type) new type().render({ force: true });
    } catch (err) {
      console.warn("[Ripper System Abstraction] Could not open the system configuration:", err);
    }
  }
}

requirements.openList = () => RequirementsListApp.open();
onRequirementsChanged(() => RequirementsListApp.refresh());
