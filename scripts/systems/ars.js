export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "attributes.size",
    level: "",
    role: "",
  },

  health: {
    current: "attributes.hp.value",
    maximum: "attributes.hp.max",
    temporary: "attributes.hp.temp.hp.value",
    minimum: "attributes.hp.min",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "weight",

    equipped: "location.state",
    attuned: "",

    uses: "charges.value",
    maximumUses: "charges.max",
  },

  currency: {
    base: "gp",

    actor: {
      denominations: {
        pp: "currency.pp",
        ep: "currency.ep",
        gp: "currency.gp",
        sp: "currency.sp",
        cp: "currency.cp",
      },
    },

    item: {
      single: {
        value: "cost.value",
        denomination: "cost.currency",
      },

      denominations: {},
    },

    denominations: {
      cp: { value: 0.005 },
      sp: { value: 0.05 },
      ep: { value: 0.5 },
      gp: { value: 1 },
      pp: { value: 5 },
    },
  },

  experience: {
    current: "details.xp",
    maximum: "",
    level: "",
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
