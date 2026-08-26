export const dataPaths = {
  actor: {
    type: "traits.value",
    subtype: "",
    size: "traits.size.value",
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
    weight: "bulk.value",

    equipped: "equipped.carryType",
    attuned: "equipped.invested",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "cp",

    actor: {
      denominations: {},
    },

    item: {
      single: {
        value: "",
        denomination: "",
      },

      denominations: {
        cp: "price.value.cp",
        sp: "price.value.sp",
        gp: "price.value.gp",
        pp: "price.value.pp",
      },
    },

    denominations: {
      cp: { value: 1 },
      sp: { value: 10 },
      gp: { value: 100 },
      pp: { value: 1000 },
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
