export const dataPaths = {
  actor: {
    type: "type.value",
    subtype: "",
    size: "size.value",
    level: "level.value",
    role: "",
  },

  health: {
    current: "hitPoints.value",
    maximum: "hitPoints.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity.value",
    weight: "weight.value",

    equipped: "equipped.value",
    attuned: "",

    uses: "",
    maximumUses: "",
  },

  currency: {
    base: "gp",

    actor: {
      denominations: {
        pp: "money.pp.value",
        gp: "money.gp.value",
        sp: "money.sp.value",
        cp: "money.cp.value",
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
      pp: { value: 10 },
      gp: { value: 1 },
      sp: { value: 0.1 },
      cp: { value: 0.01 },
    },
  },

  experience: {
    current: "xp.value",
    maximum: "xp.next",
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
