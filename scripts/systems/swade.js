export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "stats.size",
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
    weight: "weight",

    equipped: "equipStatus",
    attuned: "",

    uses: "",
    maximumUses: "",
  },

  currency: {
    base: "$",

    actor: {
      denominations: {
        "$": "details.currency",
      },
    },

    item: {
      single: {
        value: "price",
        denomination: "$",
      },

      denominations: {},
    },

    denominations: {
      "$": { value: 1 },
    },
  },

  experience: {
    current: "advances.value",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: false,
    supportsTemporaryHealth: false,
    supportsWounds: true,
    supportsCurrency: true,
    supportsWeight: true,
    supportsEquipment: true,
  },
};
