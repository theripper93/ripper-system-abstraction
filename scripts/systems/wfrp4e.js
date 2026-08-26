export const dataPaths = {
  actor: {
    type: "",
    subtype: "details.species.subspecies",
    size: "details.size.value",
    level: "",
    role: "",
  },

  health: {
    current: "status.wounds.value",
    maximum: "status.wounds.max",
    temporary: "",
    minimum: "",

    useWounds: true,
    wounds: "status.criticalWounds.value",
    maximumWounds: "status.criticalWounds.max",
  },

  item: {
    quantity: "quantity.value",
    weight: "encumbrance.value",

    equipped: "equipped.value",
    attuned: "",

    uses: "loaded.amt",
    maximumUses: "loaded.max",
  },

  currency: {
    base: "bp",

    actor: {
      denominations: {},
    },

    item: {
      single: {
        value: "coinValue.value",
        denomination: "bp",
      },

      denominations: {
        gc: "price.gc",
        ss: "price.ss",
        bp: "price.bp",
      },
    },

    denominations: {
      bp: { value: 1 },
      ss: { value: 12 },
      gc: { value: 240 },
    },
  },

  experience: {
    current: "details.experience.current",
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
