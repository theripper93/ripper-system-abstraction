const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export default async function CoC7() {
  try {
    const skillPack = game.packs?.get?.("CoC7.skills");
    if (skillPack && !skillPack.indexed) await skillPack.getIndex();
  } catch (err) {}

  class CoC7CheckInput extends DataModel {
    static defineSchema() {
      return {
        value: new fields.StringField({
          label: "ripper-system-abstraction.tests.Check",
          required: true,
          choices,
        }),
      };
    }
  }

  class CoC7DCInput extends DataModel {
    static defineSchema() {
      return {
        value: new fields.NumberField({
          label: "ripper-system-abstraction.tests.Difficulty",
          required: false,
          nullable: true,
          integer: true,
          min: 0,
        }),
      };
    }
  }

  const SUCCESS_LEVEL_MAP = { 4: 100, 3: 75, 2: 50, 1: 25, 0: 0, "-99": 0 };

  function normalizeCheck(check) {
    if (!check) {
      return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
    }

    const success = check.isSuccess;
    const level = SUCCESS_LEVEL_MAP[check.successLevel] ?? 0;

    return {
      canceled: false,
      result: check.total,
      target: null,
      success,
      levelOfSuccess: level,
      criticalSuccess: check.isCritical === true,
      criticalFailure: check.isFumble === true,
    };
  }

  return {
    dataPaths: {
  actor: {
    type: "infos.type",
    subtype: "",
    size: "characteristics.siz.value",
    level: "",
    role: "",
  },

  health: {
    current: "attribs.hp.value",
    maximum: "attribs.hp.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "weight",

    equipped: "",
    attuned: "",

    uses: "",
    maximumUses: "",
  },

  currency: {
    base: "",

    actor: {
      denominations: {},
    },

    item: {
      single: {
        value: "",
        denomination: "",
      },

      denominations: {},
    },

    denominations: {},
  },

  experience: {
    current: "",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: false,
    supportsWeight: true,
    supportsEquipment: false,
  },
    },
    testsInterface: {
  buildInputs: () => {
    const choices = {};
    const group = {
      characteristic: game.i18n.localize("ripper-system-abstraction.tests.Characteristic"),
      attribute: game.i18n.localize("ripper-system-abstraction.tests.Attribute"),
      skill: game.i18n.localize("ripper-system-abstraction.tests.Skill"),
    };

    const characterSchema = CONFIG.Actor.dataModels.character?.schema;
    const characteristicFields = Object.values(characterSchema?.get("characteristics")?.fields ?? {});
    for (const field of characteristicFields) {
      choices[`characteristic.${field.name}`] = { label: game.i18n.localize(field.hint), group: group.characteristic };
    }

    const attribFields = Object.values(characterSchema?.get("attribs")?.fields ?? {});
    for (const field of attribFields) {
      if (!["lck", "san"].includes(field.name)) continue;
      choices[`attribute.${field.name}`] = { label: game.i18n.localize(field.hint), group: group.attribute };
    }

    const pack = game.packs.get("CoC7.skills");
    if (pack?.indexed) {
      const index = pack.index instanceof Map ? pack.index.values() : pack.index;
      for (const entry of index) {
        if (entry.type === "skill") choices[`skill.${entry.name}`] = { label: entry.name, group: group.skill };
      }
    }

    class CheckInput extends CoC7CheckInput {
      static defineSchema() {
        return {
          value: new fields.StringField({
            label: "ripper-system-abstraction.tests.Check",
            required: true,
            choices,
          }),
        };
      }
    }

    return {
      check: CheckInput,
      dc: CoC7DCInput,
    };
  },

  processCheck: async (actor, inputs, options = {}) => {
    const [type, key] = inputs.check.split(".");
    const difficulty = inputs.dc == null ? 1 : Math.clamp(inputs.dc, 1, 4);
    const checkOptions = { difficulty, event: options.event };

    let check;
    switch (type) {
      case "characteristic":
        check = await actor.characteristicCheck(key, options.fastForward ?? false, checkOptions);
        break;

      case "attribute":
        check = await actor.attributeCheck(key, options.fastForward ?? false, checkOptions);
        break;

      case "skill":
        check = await actor.skillCheck(key, options.fastForward ?? false, checkOptions);
        break;

      default:
        throw new Error(`Unsupported CoC7 check type: ${type}`);
    }

    return normalizeCheck(check);
  },
},
  };
};
