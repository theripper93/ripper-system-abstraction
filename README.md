# TheRipper93 System Abstraction

A library module for abstracting various system concepts, such as Hp, currency and more.

This module uses Agentic workflows to parse, crawl, analyze and test game systems.

## Support by system

- 🟢 **Yes**: implemented. 🟡 **Some**: partly (e.g. a value without its maximum, a few of the actor details, or the generic check). 🔴 **No**: not implemented, usually because the system has no such data.
- Actor info: type, size, level. Health: current and maximum hit points, or a wounds track. Uses: current and maximum. Item values: modifiable item values (`item.listValues`), 🟢 with three or more. Checks: 🟡 means the generic roll formula + DC interface. Advantage: 🟡 means a boon/bane added instead of rolling twice.

| Name | System | Actor info | Health | Temp. health | Wounds | Experience | Currency | Item price | Quantity | Weight | Equipment | Attunement | Uses | Item values | Spell items | Checks | Advantage |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Level Up: Advanced 5th Edition | `a5e` | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 |
| Alien Evolved | `alienrpg` | 🔴 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟡 | 🟢 | 🔴 | 🟢 | 🔴 |
| Anarchy | `anarchy` | 🔴 | 🟢 | 🔴 | 🔴 | 🟡 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 | 🔴 | 🟡 | 🔴 | 🟢 | 🔴 |
| Advanced Roleplaying System (ARS) | `ars` | 🟡 | 🟢 | 🟢 | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| Blades in the Dark | `bitd` | 🔴 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🟡 | 🔴 | 🟢 | 🔴 |
| Cairn 2e | `cairn2e` | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| Castles & Crusades: The Role Playing Game | `castles-and-crusades` | 🟢 | 🟢 | 🔴 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 |
| Call of Cthulhu 7th Edition | `CoC7` | 🟡 | 🟢 | 🔴 | 🔴 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| Crucible | `crucible` | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟡 |
| Custom System Builder | `custom-system-builder` | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 |
| Cyberpunk 2020 | `cyberpunk2020` | 🔴 | 🟢 | 🔴 | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| Daggerheart | `daggerheart` | 🟢 | 🟢 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 |
| Delta Green: The Role-Playing Game | `deltagreen` | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 |
| Shadow of the Demon Lord | `demonlord` | 🟡 | 🟢 | 🔴 | 🔴 | 🔴 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🟡 |
| DnD 4th Edition | `dnd4e` | 🟢 | 🟢 | 🟢 | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| Dungeons & Dragons Fifth Edition | `dnd5e` | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 |
| Dragonbane / Drakar och Demoner | `dragonbane` | 🟡 | 🟢 | 🔴 | 🔴 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟡 | 🟢 | 🔴 | 🟢 | 🟢 |
| Das Schwarze Auge/The Dark Eye (5th Edition) | `dsa5` | 🟡 | 🟢 | 🔴 | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| Earthdawn 4th Edition | `earthdawn4e` | 🟡 | 🟢 | 🔴 | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| Exalted Third Edition | `exaltedthird` | 🟡 | 🟢 | 🟢 | 🔴 | 🟡 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 |
| Fallout: The Roleplaying Game | `fallout` | 🟡 | 🟢 | 🔴 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| GURPS 4e Game Aid (Unofficial) | `gurps` | 🟡 | 🟢 | 🔴 | 🔴 | 🟡 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| Warhammer 40,000: Imperium Maledictum | `impmal` | 🟡 | 🟢 | 🔴 | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 |
| Powered by the Apocalypse | `pbta` | 🔴 | 🟡 | 🔴 | 🟡 | 🟡 | 🔴 | 🔴 | 🟢 | 🟢 | 🔴 | 🔴 | 🟡 | 🟡 | 🔴 | 🟢 | 🟢 |
| Pathfinder Second Edition | `pf2e` | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 |
| Starfinder First Edition | `sfrpg` | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| Shadowdark RPG | `shadowdark` | 🟡 | 🟢 | 🔴 | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 |
| Shadowrun 5th Edition | `shadowrun5e` | 🟡 | 🟢 | 🔴 | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| Star Wars FFG | `starwarsffg` | 🔴 | 🟢 | 🔴 | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 |
| Savage Worlds Adventure Edition | `swade` | 🟡 | 🟢 | 🔴 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| Vaesen | `vaesen` | 🔴 | 🟡 | 🔴 | 🟡 | 🟡 | 🔴 | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 |
| Warhammer Fantasy Roleplay 4th Edition | `wfrp4e` | 🟡 | 🟢 | 🔴 | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| Wild Talents | `wildtalents` | 🔴 | 🟢 | 🔴 | 🟢 | 🟡 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 |
| Simple World-Building | `worldbuilding` | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🟢 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 | 🟡 | 🔴 |
| Warhammer 40,000: Wrath & Glory | `wrath-and-glory` | 🟢 | 🟢 | 🔴 | 🟢 | 🟡 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |

## System configuration (for GMs)

When a system is missing from the table above, or its support lacks something you need, you can fill the gaps yourself: **Game Settings > Configure Settings > TheRipper93's System Abstraction > System Abstraction Configuration > Configure** (GM only).

- **Tabs** (Actor, Health, Items, Currency, Experience, Checks) list every value modules can ask RSA for. A small number next to a tab name counts the fields still missing there; **Show only missing fields** hides everything else.
- **What the system already provides** is shown as a quiet one-line entry with the system path (or "built in"). Leave it alone, or press **Override** to map it somewhere else; an overridden field shows the path it replaces and a reset button.
- **Missing fields** and fields you mapped show the editor. Hover a field's name for a description.
- **System path** reads the value from the document's system data (e.g. `attributes.hp.value`; the list button next to the field browses the system's known data paths, and you can also type any path). **Stored by RSA** keeps the value in RSA's own flags instead: owners then edit it per document with the **System Abstraction Configuration** button in the Actor or Item sheet header.
- **Creature Type** can also be set to **Stored by RSA**: owners then type creature types on each actor with the sheet header button, and they are added to the ones the system gives. This replaces the old "Enable Manual Configuration" setting; worlds that had it on keep working as before.
- **Currency**: list the system's coins with the + button: a name, an optional abbreviation (initials are used when left empty), what each is worth compared to the main coin (1 = main coin) and where actors keep it; then where items keep their price and in which coin.
- **Checks**: on systems without built-in checks, named checks (a label and a roll formula using the actor's roll data) are offered in the check dialog of modules using RSA.
- A **yellow warning triangle** marks a field another module needs that is not set up yet (hover it to see which module); it also appears on the tab and next to **System Abstraction Configuration** in the module settings. An **info circle** marks a field a module can use but does not need. **Show Requirements** (in the same settings section) lists each module and which features it uses, with their status.
- **Save Changes** applies the configuration at once. The window's header menu (⋮) has **Export** (downloads it as JSON), **Import** (loads a JSON file into the form for you to review and save) and **Reset All** (clears the form, applied on Save).

### For module developers

The configuration is exposed as `game.modules.get("ripper-system-abstraction").API.config`: `fields` and `currencyFields` (the configurable fields), `get()`, `set(config)` (GM only), `clear()`, `sanitize(value)`, `describeField(id)` (what the built-in adapter provides), `getAdapterCurrency()`, `getAdapterOptions()`, `readFieldValue(document, id)` and `isExtraTypesEnabled(config?)`. The regular API getters and setters already use the configuration; nothing else is needed to support it. When the GM maps the creature type to a system path, `actor.getAllTypes()` also lists the values world actors hold there, read when it is called.

#### Declaring what your module needs

Modules can declare which RSA features they rely on, so GMs see a yellow symbol on what is still missing. Register from the hook RSA fires once at ready (after the system adapter is loaded, before `API.ready` resolves); nothing runs when RSA is missing or disabled:

```js
Hooks.once("ripper-system-abstraction.registerRequirements", (requirements) => {
    requirements.register("my-module", [
        "item.quantity",
        { id: "currency", reason: "shop purchases" },
        { id: "checks", optional: true },
    ]);
});
```

Ids: any configurable field id (`health.current`, `item.quantity`, ... see `API.config.fields`), plus `currency` (actors hold at least one coin), `currency.itemPrice` (items have a price) and `checks` (the system's own checks or at least one named check). `optional` entries show an info circle instead of the warning triangle (and nothing in the module settings); `reason` is added to the tooltip. Registering again replaces the module's list. `API.requirements` also has `get()`, `getMissing(config?, { optional? })` (required entries by default, optional ones with `optional: true`), `isSatisfied(id, config?)` and `openList()` (the Module Requirements window GMs open from the settings).
