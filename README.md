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
