export default async function icon() {
  return {
    dataPaths: {
    actor: {
      type: "",
      subtype: "",
      size: "",
      level: "level",
      role: "",
    },

    health: {
      current: "hp.value",
      maximum: "hp.max",
      temporary: "",
      minimum: "hp.min",

      useWounds: true,
      wounds: "wounds.value",
      maximumWounds: "wounds.max",
    },

    item: {
      quantity: "",
      weight: "",

      equipped: "equipped",
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
      current: "xp.value",
      maximum: "xp.max",
      level: "level",
    },

    features: {
      supportsHealth: true,
      supportsTemporaryHealth: false,
      supportsWounds: true,
      supportsCurrency: false,
      supportsWeight: false,
      supportsEquipment: true,
    },
    },
  };
};
