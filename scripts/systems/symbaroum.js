export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "",
    level: "",
    role: "",
  },

  health: {
    current: "health.toughness.value",
    maximum: "health.toughness.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "number",
    weight: "",

    equipped: "state",
    attuned: "",

    uses: "",
    maximumUses: "",
  },

  currency: {
    base: "thaler",

    actor: {
      denominations: {
        thaler: "money.thaler",
        shilling: "money.shilling",
        orteg: "money.orteg",
      },
    },

    item: {
      single: {
        value: "",
        denomination: "",
      },

      denominations: {},
    },

    denominations: {
      thaler: { value: 1 },
      shilling: { value: 0.1 },
      orteg: { value: 0.01 },
    },
  },

  experience: {
    current: "experience.total",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: true,
    supportsWeight: false,
    supportsEquipment: true,
  },
};
