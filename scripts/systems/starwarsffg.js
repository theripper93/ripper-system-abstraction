export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "",
    level: "",
    role: "",
  },

  health: {
    current: "",
    maximum: "",
    temporary: "",
    minimum: "",

    useWounds: true,
    wounds: "stats.wounds.value",
    maximumWounds: "stats.wounds.max",
  },

  item: {
    quantity: "quantity.value",
    weight: "encumbrance.value",

    equipped: "equippable.equipped",
    attuned: "",

    uses: "",
    maximumUses: "",
  },

  currency: {
    base: "credits",

    actor: {
      denominations: {
        credits: "stats.credits.value",
      },
    },

    item: {
      single: {
        value: "price.value",
        denomination: "credits",
      },

      denominations: {},
    },

    denominations: {
      credits: { value: 1 },
    },
  },

  experience: {
    current: "experience.available",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: true,
    supportsCurrency: true,
    supportsWeight: true,
    supportsEquipment: true,
  },
};
