export const dataPaths = {
  actor: {
    type: "details.type.value",
    subtype: "details.type.subtype",
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

    equipped: "equipped",
    attuned: "attunement",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "gc",

    actor: {
      denominations: {
        gc: "currency.gc",
      },
    },

    item: {
      single: {
        value: "price",
        denomination: "gc",
      },

      denominations: {},
    },

    denominations: {
      gc: { value: 1 },
    },
  },

  experience: {
    current: "details.xp.value",
    maximum: "details.xp.max",
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
