const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export const dataPaths = {
  actor: {
    type: "creatureClass.value",
    subtype: "",
    size: "status.size.value",
    level: "",
    role: "",
  },

  health: {
    current: "status.wounds.value",
    maximum: "status.wounds.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity.value",
    weight: "weight.value",

    equipped: "worn.value",
    attuned: "",

    uses: "",
    maximumUses: "",
  },

  currency: {
    base: "silbertaler",

    actor: {
      denominations: {},
    },

    item: {
      single: {
        value: "price.value",
        denomination: "silbertaler",
      },

      denominations: {},
    },

    denominations: {
      dukaten: { value: 10 },
      silbertaler: { value: 1 },
      heller: { value: 0.1 },
      kreuzer: { value: 0.01 },
    },
  },

  experience: {
    current: "details.experience.current",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: true,
    supportsWeight: true,
    supportsEquipment: true,
  },
};

class DSA5CheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        label: "Check",
        required: true,
        choices,
      }),
    };
  }
}

class DSA5ModifierInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
        label: "Modifier",
        required: false,
        nullable: true,
        integer: true,
      }),
    };
  }
}

export const testsInterface = {
  buildInputs: () => {
    const choices = {};

    for (const [key, label] of Object.entries(game.dsa5.config.characteristics)) {
      choices[`attribute.${key}`] = game.i18n.localize(label);
    }

    const packId = game.i18n.lang === "de" ? "dsa5.skills" : "dsa5.skillsen";
    const pack = game.packs.get(packId);
    if (pack?.indexed) {
      const index = pack.index instanceof Map ? pack.index.values() : pack.index;
      for (const entry of index) {
        if (entry.type === "skill") choices[`skill.${entry.name}`] = entry.name;
      }
    }

    class CheckInput extends DSA5CheckInput {
      static defineSchema() {
        return {
          value: new fields.StringField({
            label: "Check",
            required: true,
            choices,
          }),
        };
      }
    }

    return {
      check: CheckInput,
      modifier: DSA5ModifierInput,
    };
  },

  processCheck: async (actor, inputs, options = {}) => {
    const rollOptions = {
      bypass: options.fastForward ?? false,
      event: options.event,
    };
    if (inputs.modifier != null) rollOptions.modifier = inputs.modifier;

    let setupData;
    if (inputs.check.startsWith("skill.")) {
      const name = inputs.check.slice("skill.".length);
      let skill = actor.items.find((i) => i.name === name && i.type === "skill");
      if (!skill) {
        const packId = game.i18n.lang === "de" ? "dsa5.skills" : "dsa5.skillsen";
        const pack = game.packs.get(packId);
        if (!pack) throw new Error(`Unknown DSA5 skill: ${name}`);
        const index = pack.index instanceof Map ? pack.index.values() : pack.index;
        const entry = [...index].find((e) => e.type === "skill" && e.name === name);
        if (!entry) throw new Error(`Unknown DSA5 skill: ${name}`);
        skill = await pack.getDocument(entry._id);
      }

      setupData = await actor.setupSkill(skill, rollOptions);
      if (setupData?.testData && rollOptions.bypass) {
        setupData.testData.advancedModifiers = { chars: [0, 0, 0], fws: 0, qls: 0 };
        setupData.testData.testDifficulty = 0;
      }
    } else {
      const key = Object.keys(game.dsa5.config.characteristics).find((k) => {
        const label = game.i18n.localize(game.dsa5.config.characteristics[k]);
        return k === inputs.check || label === inputs.check;
      });
      if (!key) {
        throw new Error(`Unknown DSA5 characteristic: ${inputs.check}`);
      }

      setupData = await actor.setupCharacteristic(key, rollOptions);
    }

    if (!setupData) {
      return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
    }

    const outcome = await actor.basicTest(setupData);
    if (!outcome) {
      return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
    }

    const result = outcome.result;
    const success = result.successLevel > 0;
    const levelOfSuccess = success
      ? result.qualityStep != null
        ? Math.clamp(Math.round((result.qualityStep / 6) * 100), 1, 100)
        : 100
      : 0;

    return {
      canceled: false,
      result: result.characteristics?.[0]?.res ?? null,
      target: result.characteristics?.[0]?.tar ?? null,
      success,
      levelOfSuccess,
      criticalSuccess: result.successLevel > 1,
      criticalFailure: result.successLevel < -1,
    };
  },
};
