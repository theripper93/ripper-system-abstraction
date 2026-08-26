export const dataPaths = {
  actor: {
    type: "",
    subtype: "type",
    size: "size",
    level: "levelData.level.current",
    role: "",
  },

  health: {
    current: "resources.hitPoints.value",
    maximum: "resources.hitPoints.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "",

    equipped: "equipped",
    attuned: "",

    uses: "resource.value",
    maximumUses: "resource.max",
  },

  currency: {
    base: "coins",

    actor: {
      denominations: {
        coins: "gold.coins",
        handfuls: "gold.handfuls",
        bags: "gold.bags",
        chests: "gold.chests",
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
      coins: { value: 1 },
      handfuls: { value: 10 },
      bags: { value: 100 },
      chests: { value: 1000 },
    },
  },

  experience: {
    current: "",
    maximum: "",
    level: "levelData.level.current",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: true,
    supportsWeight: false,
    supportsEquipment: true,
  },
};
