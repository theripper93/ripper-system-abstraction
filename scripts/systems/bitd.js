export default async function bitd() {
  return {
    dataPaths: {
    actor: {
      type: "",
      subtype: "",
      size: "",
      level: "",
      role: "playbook",
    },

    health: {
      current: "",
      maximum: "",
      temporary: "",
      minimum: "",

      useWounds: false,
      wounds: "",
      maximumWounds: "",
    },

    item: {
      quantity: "",
      weight: "loadout",

      equipped: "equipped",
      attuned: "",

      uses: "uses.used",
      maximumUses: "uses.max",
    },

    currency: {
      base: "coin",

      actor: {
        denominations: {
          coin: "coins.value",
        },
      },

      item: {
        single: {
          value: "price",
          denomination: "coin",
        },

        denominations: {},
      },

      denominations: {
        coin: { value: 1 },
      },
    },

    experience: {
      current: "exp.value",
      maximum: "exp.max",
      level: "",
    },

    features: {
      supportsHealth: false,
      supportsTemporaryHealth: false,
      supportsWounds: false,
      supportsCurrency: true,
      supportsWeight: true,
      supportsEquipment: true,
    },
    },
  };
};
