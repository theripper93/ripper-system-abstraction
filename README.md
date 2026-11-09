# TheRipper93 System Abstraction

A library module for abstracting various system concepts, such as Hp, currency and more.

This module uses Agentic workflows to parse, crawl, analyze and test game systems.

## Support by system

- 🟢 **Yes**: implemented. 🟡 **Some**: partly (e.g. a value without its maximum, a few of the actor details, or the generic check). 🔴 **No**: not implemented, usually because the system has no such data.
- Actor info: type, size, level. Health: current and maximum hit points, or a wounds track. Uses: current and maximum. Item values: modifiable item values (`item.listValues`), 🟢 with three or more. Checks: 🟡 means the generic roll formula + DC interface. Advantage: 🟡 means a boon/bane added instead of rolling twice.

| System | Actor info | Health | Temp. health | Wounds | Experience | Currency | Item price | Quantity | Weight | Equipment | Attunement | Uses | Item values | Spell items | Checks | Advantage |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `a5e` | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 |
| `alienrpg` | 🔴 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟡 | 🟢 | 🔴 | 🟢 | 🔴 |
| `anarchy` | 🔴 | 🟢 | 🔴 | 🔴 | 🟡 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 | 🔴 | 🟡 | 🔴 | 🟢 | 🔴 |
| `ars` | 🟡 | 🟢 | 🟢 | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| `bitd` | 🔴 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🟡 | 🔴 | 🟢 | 🔴 |
| `cairn2e` | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| `castles-and-crusades` | 🟢 | 🟢 | 🔴 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 |
| `CoC7` | 🟡 | 🟢 | 🔴 | 🔴 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| `crucible` | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟡 |
| `custom-system-builder` | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 |
| `cyberpunk2020` | 🔴 | 🟢 | 🔴 | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| `daggerheart` | 🟢 | 🟢 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 |
| `deltagreen` | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 |
| `demonlord` | 🟡 | 🟢 | 🔴 | 🔴 | 🔴 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🟡 |
| `dnd4e` | 🟢 | 🟢 | 🟢 | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| `dnd5e` | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 |
| `dragonbane` | 🟡 | 🟢 | 🔴 | 🔴 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟡 | 🟢 | 🔴 | 🟢 | 🟢 |
| `dsa5` | 🟡 | 🟢 | 🔴 | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| `earthdawn4e` | 🟡 | 🟢 | 🔴 | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| `exaltedthird` | 🟡 | 🟢 | 🟢 | 🔴 | 🟡 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 |
| `fallout` | 🟡 | 🟢 | 🔴 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| `gurps` | 🟡 | 🟢 | 🔴 | 🔴 | 🟡 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| `impmal` | 🟡 | 🟢 | 🔴 | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 |
| `pbta` | 🔴 | 🟡 | 🔴 | 🟡 | 🟡 | 🔴 | 🔴 | 🟢 | 🟢 | 🔴 | 🔴 | 🟡 | 🟡 | 🔴 | 🟢 | 🟢 |
| `pf2e` | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 |
| `sfrpg` | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| `shadowdark` | 🟡 | 🟢 | 🔴 | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 |
| `shadowrun5e` | 🟡 | 🟢 | 🔴 | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| `swade` | 🟡 | 🟢 | 🔴 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| `vaesen` | 🔴 | 🟡 | 🔴 | 🟡 | 🟡 | 🔴 | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 |
| `wfrp4e` | 🟡 | 🟢 | 🔴 | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| `wildtalents` | 🔴 | 🟢 | 🔴 | 🟢 | 🟡 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 |
| `worldbuilding` | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🟢 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 | 🟡 | 🔴 |
| `wrath-and-glory` | 🟢 | 🟢 | 🔴 | 🟢 | 🟡 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
