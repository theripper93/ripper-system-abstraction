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
    wounds: "wounds.value",
    maximumWounds: "wounds.max",
  },

  item: {
    quantity: "quantity",
    weight: "encumbrance",

    equipped: "state",
    equippedValue: "equipped",
    unequippedValue: "carried",
    attuned: "",

    uses: "",
    maximumUses: "",
  },

  currency: {
    base: "credits",

    actor: {
      denominations: {
        credits: "currency",
      },
    },

    item: {
      single: {
        value: "price",
        denomination: "credits",
      },

      denominations: {},
    },

    denominations: {
      credits: { value: 1 },
    },
  },

  experience: {
    current: "availableXP",
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
