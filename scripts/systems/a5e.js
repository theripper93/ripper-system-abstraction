export const dataPaths = {
  actor: {
    type: "",
    subtype: "details.creatureTypes",
    size: "traits.size",
    level: "details.level",
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
    weight: "weight",

    equipped: "equippedState",
    attuned: "attuned",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "gp",

    actor: {
      denominations: {
        cp: "currency.cp",
        sp: "currency.sp",
        ep: "currency.ep",
        gp: "currency.gp",
        pp: "currency.pp",
      },
    },

    item: {
      single: {
        value: "price.value",
        denomination: "price.denomination",
      },

      denominations: {},
    },

    denominations: {
      cp: { value: 0.01 },
      sp: { value: 0.1 },
      ep: { value: 0.5 },
      gp: { value: 1 },
      pp: { value: 10 },
    },
  },

  experience: {
    current: "details.xp",
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
