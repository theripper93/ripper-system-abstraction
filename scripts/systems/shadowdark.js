export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "",
    level: "level.value",
    role: "",
  },

  health: {
    current: "attributes.hp.value",
    maximum: "attributes.hp.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "slots.slots_used",

    equipped: "equipped",
    attuned: "",

    uses: "uses.available",
    maximumUses: "uses.max",
  },

  currency: {
    base: "gp",

    actor: {
      denominations: {
        gp: "coins.gp",
        sp: "coins.sp",
        cp: "coins.cp",
      },
    },

    item: {
      single: {
        value: "",
        denomination: "",
      },

      denominations: {
        gp: "cost.gp",
        sp: "cost.sp",
        cp: "cost.cp",
      },
    },

    denominations: {
      cp: { value: 0.01 },
      sp: { value: 0.1 },
      gp: { value: 1 },
    },
  },

  experience: {
    current: "level.xp",
    maximum: "",
    level: "level.value",
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
