const MAX_SHOWN = 200;

let current = null;

function close() {
  game.tooltip?.deactivate?.();
  if (!current) return;
  current.element.remove();
  document.removeEventListener("pointerdown", current.onOutside, true);
  current.anchor.focus?.();
  current = null;
}

/**
 * Open a filterable list of paths under a button, filling `input` with the
 * picked path. Escape or a click outside closes it without changes.
 *
 * @param {HTMLButtonElement} button
 * @param {HTMLInputElement} input
 * @param {string[]} paths
 */
export function openPathPicker(button, input, paths) {
  try {
    game.tooltip?.deactivate?.();
    const reopened = current?.anchor === button;
    close();
    if (reopened || !paths?.length) return;

    const application = button.closest(".application");
    const theme = Array.from(application?.classList ?? []).filter((c) => c === "themed" || c.startsWith("theme-"));
    const element = document.createElement("div");
    element.className = ["application", "rsa-path-picker", ...theme].join(" ");
    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = game.i18n.localize("ripper-system-abstraction.systemConfig.picker.filter");
    search.value = input.value.trim().replace(/^system\./, "");
    const list = document.createElement("ol");
    list.className = "scrollable";
    list.setAttribute("role", "listbox");
    element.append(search, list);

    let active = 0;
    let shown = [];
    const highlight = () => {
      list.querySelectorAll("li").forEach((li, i) => li.classList.toggle("active", i === active));
      list.children[active]?.scrollIntoView({ block: "nearest" });
    };
    const pick = (path) => {
      input.value = path;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      close();
      input.focus();
    };
    const filter = () => {
      const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      shown = paths.filter((path) => terms.every((term) => path.toLowerCase().includes(term))).slice(0, MAX_SHOWN);
      list.replaceChildren(...shown.map((path) => {
        const li = document.createElement("li");
        li.textContent = path;
        li.setAttribute("role", "option");
        li.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          pick(path);
        });
        return li;
      }));
      if (!shown.length) {
        const li = document.createElement("li");
        li.className = "empty";
        li.textContent = game.i18n.localize("ripper-system-abstraction.systemConfig.picker.none");
        list.append(li);
      }
      active = 0;
      highlight();
    };
    search.addEventListener("input", filter);
    search.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!shown.length) return;
        active = (active + (event.key === "ArrowDown" ? 1 : -1) + shown.length) % shown.length;
        highlight();
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (shown[active]) pick(shown[active]);
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
    });

    const onOutside = (event) => {
      if (!element.contains(event.target) && event.target !== button) close();
    };
    document.body.append(element);
    const rect = input.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const width = Math.max(260, buttonRect.right - rect.left);
    const below = window.innerHeight - rect.bottom;
    element.style.left = `${Math.max(4, Math.min(rect.left, window.innerWidth - width - 4))}px`;
    element.style.width = `${width}px`;
    if (below < 240 && rect.top > below) {
      element.style.bottom = `${window.innerHeight - rect.top + 2}px`;
      element.style.maxHeight = `${Math.min(320, rect.top - 8)}px`;
    } else {
      element.style.top = `${rect.bottom + 2}px`;
      element.style.maxHeight = `${Math.min(320, below - 8)}px`;
    }
    document.addEventListener("pointerdown", onOutside, true);
    current = { element, anchor: button, onOutside };
    filter();
    search.focus();
  } catch (err) {
    console.warn("[Ripper System Abstraction] Could not open the path list:", err);
    close();
  }
}

export { close as closePathPicker };
