import { data } from "./data.js";
import { health } from "./health.js";
import { currency } from "./currency.js";
import { item } from "./item.js";
import { actor } from "./actor.js";
import { experience } from "./experience.js";
import { features } from "./features.js";

/**
 * The agnostic API. Provides semantic operations over the system adapters'
 * declarative `dataPaths`, with no system-specific paths in this layer.
 */
export const api = {
  data,
  health,
  currency,
  item,
  actor,
  experience,
  features,
};
