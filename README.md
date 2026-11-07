# TheRipper93 System Abstraction

A library module for abstracting various system concepts, such as Hp, currency and more.

This module uses Agentic workflows to parse, crawl, analyze and test game systems.

## Supported Systems

| System | ID |
| --- | --- |
| Level Up Advanced 5e | `a5e` |
| Alien RPG | `alienrpg` |
| Anarchy | `anarchy` |
| Advanced Roleplaying System (ARS) | `ars` |
| Blades in the Dark | `bitd` |
| Cairn 2e | `cairn2e` |
| Castles & Crusades | `castles-and-crusades` |
| Call of Cthulhu 7th Edition | `CoC7` |
| Crucible | `crucible` |
| Custom System Builder | `custom-system-builder` |
| Cyberpunk 2020 | `cyberpunk2020` |
| Daggerheart | `daggerheart` |
| Delta Green | `deltagreen` |
| Shadow of the Demon Lord | `demonlord` |
| D&D 4th Edition | `dnd4e` |
| D&D 5th Edition | `dnd5e` |
| The Dark Eye 5 (DSA5) | `dsa5` |
| Earthdawn 4th Edition | `earthdawn4e` |
| Exalted 3rd Edition | `exaltedthird` |
| Fallout 2d20 | `fallout` |
| GURPS | `gurps` |
| Warhammer 40,000: Imperium Maledictum | `impmal` |
| Powered by the Apocalypse | `pbta` |
| Pathfinder 2e | `pf2e` |
| Starfinder | `sfrpg` |
| Shadowdark | `shadowdark` |
| Shadowrun 5e | `shadowrun5e` |
| Star Wars FFG | `starwarsffg` |
| Savage Worlds Adventure Edition | `swade` |
| Vaesen | `vaesen` |
| Warhammer Fantasy Roleplay 4e | `wfrp4e` |
| Wild Talents | `wildtalents` |
| Simple Worldbuilding | `worldbuilding` |

Systems not listed above fall back to a generic implementation (roll formula + DC checks).

## Support by system

What each adapter implements, checked live on Foundry v14.370 (2026-11-07): an actor and items built from each system's own compendiums, run through the API tests (`debug.runAPITests`).

- 🟢 **Yes**: implemented. 🟡 **Some**: partly (e.g. a value without its maximum, a few of the actor details, or the generic check). 🔴 **No**: not implemented, usually because the system has no such data.
- Actor info: type, size, level. Health: current and maximum hit points, or a wounds track. Uses: current and maximum. Item values: modifiable item values (`item.listValues`), 🟢 with three or more. Checks: 🟡 means the generic roll formula + DC interface. Advantage: 🟡 means a boon/bane added instead of rolling twice.
- Star Wars FFG (`starwarsffg`) has no v14 release, so it isn't listed.

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
| `vaesen` | 🔴 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 | 🔴 |
| `wfrp4e` | 🟡 | 🟢 | 🔴 | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 | 🔴 |
| `wildtalents` | 🔴 | 🟡 | 🔴 | 🟢 | 🟡 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 |
| `worldbuilding` | 🔴 | 🟢 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🟢 | 🟢 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 | 🟡 | 🔴 |
