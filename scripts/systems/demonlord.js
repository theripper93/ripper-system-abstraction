export const dataPaths = {
  actor: {
    type: "",
    subtype: "isPC",
    size: "characteristics.size",
    level: "level",
    role: "",
  },

  health: {
    current: "characteristics.health.value",
    maximum: "characteristics.health.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "",

    equipped: "wear",
    attuned: "",

    uses: "activatedEffect.uses.value",
    maximumUses: "activatedEffect.uses.max",
  },

  currency: {
    base: "gc",

    actor: {
      denominations: {
        gc: "wealth.gc",
        ss: "wealth.ss",
        cp: "wealth.cp",
        bits: "wealth.bits",
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
      gc: { value: 1 },
      ss: { value: 0.1 },
      cp: { value: 0.01 },
      bits: { value: 0.001 },
    },
  },

  experience: {
    current: "",
    maximum: "",
    level: "level",
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
