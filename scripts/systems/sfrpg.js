export const dataPaths = {
  actor: {
    type: "details.type",
    subtype: "details.subtype",
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
    weight: "bulk",

    equipped: "equipped",
    attuned: "",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "credit",

    actor: {
      denominations: {
        credit: "currency.credit",
        upb: "currency.upb",
      },
    },

    item: {
      single: {
        value: "price",
        denomination: "credit",
      },

      denominations: {},
    },

    denominations: {
      credit: { value: 1 },
      upb: { value: 1 },
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
