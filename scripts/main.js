import {initConfig} from "./config.js";
import {showWelcome} from "./lib/welcome.js";
import { registerSettings } from "./settings.js";
import "./testsInterfaceCustomElement.js";
import { buildInputs, parse } from "./testsInterfaceCustomElement.js";

export const MODULE_ID = "ripper-system-abstraction";

export const API = {
    buildInputs,
    parse,
};

Hooks.on("init", () => {
    registerSettings();
    const module = game.modules.get(MODULE_ID);
    module.API = API;
});

Hooks.on("ready", () => {
    showWelcome();
    initConfig();
});