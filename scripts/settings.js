import { MODULE_ID } from "./main.js";
import { invalidateUserConfig } from "./userConfig.js";
import { refreshTestsInterfaces } from "./testsInterfaceCustomElement.js";
import { SystemConfigApp } from "./systemConfig.js";
import { RequirementsListApp } from "./requirementsList.js";
import { notifyRequirementsChanged } from "./requirements.js";

const SETTING_CACHE = {};
const DEFAULT_CACHE = false;

export function registerSettings() {
    const settings = {
        manualConfig: {
            scope: "world",
            config: false,
            type: Boolean,
            default: false,
        },
        systemConfig: {
            scope: "world",
            config: false,
            type: Object,
            default: {},
            onChange: () => {
                invalidateUserConfig();
                refreshTestsInterfaces();
                notifyRequirementsChanged();
            },
        },
    };

    game.settings.registerMenu(MODULE_ID, "systemConfigMenu", {
        name: `${MODULE_ID}.settings.systemConfigMenu.name`,
        label: `${MODULE_ID}.settings.systemConfigMenu.label`,
        hint: `${MODULE_ID}.settings.systemConfigMenu.hint`,
        icon: "fa-solid fa-diagram-project",
        type: SystemConfigApp,
        restricted: true,
    });

    game.settings.registerMenu(MODULE_ID, "requirementsListMenu", {
        name: `${MODULE_ID}.settings.requirementsListMenu.name`,
        label: `${MODULE_ID}.settings.requirementsListMenu.label`,
        hint: `${MODULE_ID}.settings.requirementsListMenu.hint`,
        icon: "fa-solid fa-list-check",
        type: RequirementsListApp,
        restricted: true,
    });

    registerSettingsArray(settings);
    invalidateUserConfig();
}

export function getSetting(key) {
    return SETTING_CACHE[key] ?? game.settings.get(MODULE_ID, key);
}

export async function setSetting(key, value) {
    return await game.settings.set(MODULE_ID, key, value);
}

function registerSettingsArray(settings) {
    for (const [key, value] of Object.entries(settings)) {
        if (value.config && (typeof value.config === "function")) {
            const configFn = value.config;
            Object.defineProperty(value, "config", {
                get: () => configFn(),
                set: (value) => { }
            });
        }
        if (!value.name) value.name = `${MODULE_ID}.settings.${key}.name`
        if (!value.hint) value.hint = `${MODULE_ID}.settings.${key}.hint`
        if (value.useCache === undefined) value.useCache = DEFAULT_CACHE;
        if (value.useCache) {
            const unwrappedOnChange = value.onChange;
            value.onChange = (value) => {
                SETTING_CACHE[key] = value;
                if (unwrappedOnChange) unwrappedOnChange(value);
            }
        }
        game.settings.register(MODULE_ID, key, value);
        if(value.useCache) SETTING_CACHE[key] = getSetting(key);
    }
}