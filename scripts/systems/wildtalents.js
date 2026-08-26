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
    wounds: "silhouette",
    maximumWounds: "",
  },

  item: {
    quantity: "",
    weight: "",

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
    current: "xp",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: false,
    supportsTemporaryHealth: false,
    supportsWounds: true,
    supportsCurrency: false,
    supportsWeight: false,
    supportsEquipment: false,
  },
};
