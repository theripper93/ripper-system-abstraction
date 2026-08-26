export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "",
    level: "",
    role: "",
  },

  health: {
    current: "monitors.physical.value",
    maximum: "monitors.physical.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
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
    current: "counters.karma.value",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: false,
    supportsWeight: false,
    supportsEquipment: false,
  },
};
