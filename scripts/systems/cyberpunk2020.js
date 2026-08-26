export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "",
    level: "",
    role: "role.value",
  },

  health: {
    current: "",
    maximum: "",
    temporary: "",
    minimum: "",

    useWounds: true,
    wounds: "damage",
    maximumWounds: "",
  },

  item: {
    quantity: "",
    weight: "weight",

    equipped: "equipped",
    attuned: "",

    uses: "shotsLeft",
    maximumUses: "shots",
  },

  currency: {
    base: "eurobucks",

    actor: {
      denominations: {
        eurobucks: "eurobucks",
      },
    },

    item: {
      single: {
        value: "cost",
        denomination: "eurobucks",
      },

      denominations: {},
    },

    denominations: {
      eurobucks: { value: 1 },
    },
  },

  experience: {
    current: "ip",
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
