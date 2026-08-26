export const dataPaths = {
  actor: {
    type: "creatureClass.value",
    subtype: "",
    size: "status.size.value",
    level: "",
    role: "",
  },

  health: {
    current: "status.wounds.value",
    maximum: "status.wounds.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity.value",
    weight: "weight.value",

    equipped: "worn.value",
    attuned: "",

    uses: "",
    maximumUses: "",
  },

  currency: {
    base: "silbertaler",

    actor: {
      denominations: {},
    },

    item: {
      single: {
        value: "price.value",
        denomination: "silbertaler",
      },

      denominations: {},
    },

    denominations: {
      dukaten: { value: 10 },
      silbertaler: { value: 1 },
      heller: { value: 0.1 },
      kreuzer: { value: 0.01 },
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
    supportsWounds: false,
    supportsCurrency: true,
    supportsWeight: true,
    supportsEquipment: true,
  },
};
