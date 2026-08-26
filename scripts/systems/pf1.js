export const dataPaths = {
  actor: {
    type: "traits.creatureTypes",
    subtype: "traits.creatureSubtypes",
    size: "traits.size",
    level: "details.level.value",
    role: "",
  },

  health: {
    current: "attributes.hp.value",
    maximum: "attributes.hp.max",
    temporary: "attributes.hp.temp",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "weight.value",

    equipped: "equipped",
    attuned: "",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "gp",

    actor: {
      denominations: {
        pp: "currency.pp",
        gp: "currency.gp",
        sp: "currency.sp",
        cp: "currency.cp",
      },
    },

    item: {
      single: {
        value: "price",
        denomination: "gp",
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
    current: "details.xp.value",
    maximum: "details.xp.max",
    level: "details.level.value",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: true,
    supportsWounds: false,
    supportsCurrency: true,
    supportsWeight: true,
    supportsEquipment: true,
  },
};
