export const dataPaths = {
  actor: {
    type: "",
    subtype: "details.type",
    size: "details.size",
    level: "details.level",
    role: "",
  },

  health: {
    current: "attributes.hp.value",
    maximum: "attributes.hp.max",
    temporary: "attributes.temphp.value",
    minimum: "attributes.hp.min",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "weight",

    equipped: "equipped",
    attuned: "attuned",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "gp",

    actor: {
      denominations: {
        ad: "currency.ad",
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
      ad: { value: 10000 },
      pp: { value: 100 },
      gp: { value: 1 },
      sp: { value: 0.1 },
      cp: { value: 0.01 },
    },
  },

  experience: {
    current: "details.exp",
    maximum: "",
    level: "details.level",
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
