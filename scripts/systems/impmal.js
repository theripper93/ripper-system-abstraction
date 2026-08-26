export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "combat.size",
    level: "",
    role: ["role.name", "role"],
  },

  health: {
    current: "combat.wounds.value",
    maximum: "combat.wounds.max",
    temporary: "",
    minimum: "",

    useWounds: true,
    wounds: "combat.criticals.value",
    maximumWounds: "combat.criticals.max",
  },

  item: {
    quantity: "quantity",
    weight: "encumbrance.value",

    equipped: "equipped.value",
    attuned: "",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "solars",

    actor: {
      denominations: {
        solars: "solars",
      },
    },

    item: {
      single: {
        value: "cost",
        denomination: "solars",
      },

      denominations: {},
    },

    denominations: {
      solars: { value: 1 },
    },
  },

  experience: {
    current: "xp.total",
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
