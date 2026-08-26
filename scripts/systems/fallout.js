export const dataPaths = {
  actor: {
    type: "",
    subtype: "category",
    size: "",
    level: "level.value",
    role: "",
  },

  health: {
    current: "health.value",
    maximum: "health.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "weight",

    equipped: "equipped",
    attuned: "",

    uses: "",
    maximumUses: "",
  },

  currency: {
    base: "caps",

    actor: {
      denominations: {
        caps: "currency.caps",
      },
    },

    item: {
      single: {
        value: "cost",
        denomination: "caps",
      },

      denominations: {},
    },

    denominations: {
      caps: { value: 1 },
    },
  },

  experience: {
    current: "level.currentXP",
    maximum: "level.nextLevelXP",
    level: "level.value",
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
