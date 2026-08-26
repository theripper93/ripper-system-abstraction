export const dataPaths = {
  actor: {
    type: "details.exalt",
    subtype: "details.caste",
    size: "",
    level: "essence.value",
    role: "",
  },

  health: {
    current: "health.value",
    maximum: "health.max",
    temporary: "health.levels.temp.value",
    minimum: "health.min",

    useWounds: true,
    wounds: ["health.bashing", "health.lethal", "health.aggravated"],
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "",

    equipped: "equipped",
    attuned: "attunement",

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
    current: "experience.standard.remaining",
    maximum: "",
    level: "essence.value",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: true,
    supportsWounds: true,
    supportsCurrency: false,
    supportsWeight: false,
    supportsEquipment: true,
  },
};
