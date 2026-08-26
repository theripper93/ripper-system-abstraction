export const dataPaths = {
  actor: {
    type: "infos.type",
    subtype: "",
    size: "characteristics.siz.value",
    level: "",
    role: "",
  },

  health: {
    current: "attribs.hp.value",
    maximum: "attribs.hp.max",
    temporary: "",
    minimum: "",

    useWounds: false,
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
};
