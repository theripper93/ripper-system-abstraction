export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "traits.sizemod",
    level: "",
    role: "",
  },

  health: {
    current: "HP.value",
    maximum: "HP.max",
    temporary: "",
    minimum: "HP.min",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "eqt.count",
    weight: "eqt.weight",

    equipped: "eqt.equipped",
    attuned: "",

    uses: "eqt.uses",
    maximumUses: "eqt.maxuses",
  },

  currency: {
    base: "$",

    actor: {
      denominations: {},
    },

    item: {
      single: {
        value: "eqt.cost",
        denomination: "$",
      },

      denominations: {},
    },

    denominations: {
      "$": { value: 1 },
    },
  },

  experience: {
    current: "totalpoints.unspent",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: false,
    supportsWeight: true,
    supportsEquipment: true,
  },
};
