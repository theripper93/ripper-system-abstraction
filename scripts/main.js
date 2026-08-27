import {initConfig} from "./config.js";
import {showWelcome} from "./lib/welcome.js";
import { registerSettings } from "./settings.js";
import "./testsInterfaceCustomElement.js";
import { buildInputs, parse, processCheck } from "./testsInterfaceCustomElement.js";

export const MODULE_ID = "ripper-system-abstraction";

export const API = {
    buildInputs,
    parse,
    processCheck,
};

Hooks.on("init", () => {
    registerSettings();
    const module = game.modules.get(MODULE_ID);
    module.API = API;
});

Hooks.on("ready", () => {
    showWelcome();
    initConfig();
    openTestsDebugDialog();
});

async function openTestsDebugDialog() {
    const content = document.createElement("div");
    content.innerHTML = `
        <div class="ripper-tests-debug">
            <div class="form-group">
                <label>Actor</label>
                <select id="ripper-tests-actor"></select>
            </div>
            <tests-interface id="ripper-tests-element"></tests-interface>
            <label>Serialized value</label>
            <div class="ripper-tests-result" id="ripper-tests-value"></div>
            <label>Result</label>
            <div class="ripper-tests-result" id="ripper-tests-result">Ready</div>
        </div>`;

    const dialog = new foundry.applications.api.DialogV2({
        content,
        buttons: [
            {
                action: "run",
                label: "Run Check",
                icon: "fa-solid fa-dice-d20",
                default: true,
                callback: (event, button, dlg) => runCheck(dlg),
            },
        ],
    });

    await dialog.render(true);
    initTestsDialog(dialog.element);
}

function initTestsDialog(root) {
    const select = root.querySelector("#ripper-tests-actor");
    const element = root.querySelector("tests-interface");

    for (const actor of game.actors) {
        const option = document.createElement("option");
        option.value = actor.id;
        option.textContent = actor.name;
        select.append(option);
    }

    const controlled = canvas?.tokens?.controlled?.[0]?.actor;
    if (controlled) select.value = controlled.id;
    else if (select.options.length) select.selectedIndex = 0;

    element.actorId = select.value || null;

    select.addEventListener("change", () => {
        element.actorId = select.value || null;
    });

    element.addEventListener("change", (event) => {
        const valueElement = root.querySelector("#ripper-tests-value");
        valueElement.textContent = event.detail?.value ?? "";
    });
}

async function runCheck(dialog) {
    const root = dialog.element;
    const select = root.querySelector("#ripper-tests-actor");
    const element = root.querySelector("tests-interface");
    const resultElement = root.querySelector("#ripper-tests-result");

    const actor = game.actors.get(select.value);
    if (!actor) {
        resultElement.textContent = "No actor selected.";
        return;
    }

    const value = element.value;
    if (!value) {
        resultElement.textContent = "No inputs configured.";
        return;
    }

    resultElement.textContent = "Rolling...";
    try {
        const result = await API.processCheck(actor, value);
        console.log("ripper-system-abstraction | Check result:", result);
        resultElement.textContent = result
            ? (result.result ?? result.formula ?? String(result))
            : "Check complete (no result returned).";
    } catch (err) {
        console.error("ripper-system-abstraction | Check failed:", err);
        resultElement.textContent = `Error: ${err.message}`;
    }
}