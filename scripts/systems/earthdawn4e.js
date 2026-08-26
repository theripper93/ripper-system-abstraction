export const dataPaths = {
  actor: {
    type: "actorType",
    subtype: "",
    size: "",
    level: "",
    role: "",
  },

  health: {
    current: "damage.value",
    maximum: "damage.max",
    temporary: "",
    minimum: "damage.min",

    useWounds: true,
    wounds: "wounds",
    maximumWounds: "",
  },

  item: {
    quantity: "amount",
    weight: "weight",

    equipped: "worn",
    attuned: "isthread",

    uses: "",
    maximumUses: "",
  },

  currency: {
    base: "silver",

    actor: {
      denominations: {
        gold: "money.gold",
        silver: "money.silver",
        copper: "money.copper",
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
      gold: { value: 10 },
      silver: { value: 1 },
      copper: { value: 0.1 },
    },
  },

  experience: {
    current: "legendpointcurrent",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: true,
    supportsCurrency: true,
    supportsWeight: true,
    supportsEquipment: true,
  },
};
