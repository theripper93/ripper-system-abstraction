export default async function worldbuilding() {
  return {
    dataPaths: {
    actor: {
      type: "",
      subtype: "",
      size: "",
      level: "",
      role: "",
    },

    health: {
      current: "health.value",
      maximum: "health.max",
      temporary: "",
      minimum: "health.min",

      wounds: "",
      maximumWounds: "",
    },

    item: {
      quantity: "quantity",
      weight: "weight",

      equipped: "",
      attuned: "",

      uses: "",
      maximumUses: "",

      // other item attributes are user-defined (system.attributes)
      values: {
        weight: {
          label: "ripper-system-abstraction.item.values.weight",
          type: "number",
          applies: (item) => item.type === "item",
          path: "weight",
        },
      },
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
      current: "",
      maximum: "",
      level: "",
    },

    features: {
      supportsHealth: true,
      supportsTemporaryHealth: false,
      supportsWounds: false,
      supportsCurrency: false,
      supportsWeight: true,
      supportsEquipment: false,
    },
    },
  };
};
