export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "",
    level: "",
    role: "",
  },

  health: {
    current: "header.health.value",
    maximum: "header.health.max",
    temporary: "",
    minimum: "",

    useWounds: true,
    wounds: "general.critInj.value",
    maximumWounds: "",
  },

  item: {
    quantity: "attributes.quantity.value",
    weight: "attributes.weight.value",

    equipped: "",
    attuned: "",

    uses: "attributes.rounds.value",
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
    current: "general.xp.value",
    maximum: "general.xp.max",
    level: "",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: true,
    supportsCurrency: false,
    supportsWeight: true,
    supportsEquipment: false,
  },
};
