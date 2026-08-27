import { dataPaths as a5ePaths } from "./a5e.js";
import { testsInterface as a5eTestsInterface } from "./a5e.js";
import { dataPaths as alienrpgPaths } from "./alienrpg.js";
import { testsInterface as alienrpgTestsInterface } from "./alienrpg.js";
import { dataPaths as anarchyPaths } from "./anarchy.js";
import { testsInterface as anarchyTestsInterface } from "./anarchy.js";
import { dataPaths as arsPaths } from "./ars.js";
import { testsInterface as arsTestsInterface } from "./ars.js";
import { dataPaths as bitdPaths } from "./bitd.js";
import { dataPaths as castlesAndCrusadesPaths } from "./castles-and-crusades.js";
import { testsInterface as castlesAndCrusadesTestsInterface } from "./castles-and-crusades.js";
import { dataPaths as CoC7Paths } from "./CoC7.js";
import { testsInterface as CoC7TestsInterface } from "./CoC7.js";
import { dataPaths as cruciblePaths } from "./crucible.js";
import { testsInterface as crucibleTestsInterface } from "./crucible.js";
import { dataPaths as customSystemBuilderPaths } from "./custom-system-builder.js";
import { dataPaths as cyberpunk2020Paths } from "./cyberpunk2020.js";
import { testsInterface as cyberpunk2020TestsInterface } from "./cyberpunk2020.js";
import { dataPaths as daggerheartPaths } from "./daggerheart.js";
import { testsInterface as daggerheartTestsInterface } from "./daggerheart.js";
import { dataPaths as deltagreenPaths } from "./deltagreen.js";
import { testsInterface as deltagreenTestsInterface } from "./deltagreen.js";
import { dataPaths as demonlordPaths } from "./demonlord.js";
import { testsInterface as demonlordTestsInterface } from "./demonlord.js";
import { dataPaths as dnd4ePaths } from "./dnd4e.js";
import { testsInterface as dnd4eTestsInterface } from "./dnd4e.js";
import { dataPaths as dnd5ePaths } from "./dnd5e.js";
import { testsInterface as dnd5eTestsInterface } from "./dnd5e.js";
import { dataPaths as dsa5Paths } from "./dsa5.js";
import { testsInterface as dsa5TestsInterface } from "./dsa5.js";
import { dataPaths as earthdawn4ePaths } from "./earthdawn4e.js";
import { testsInterface as earthdawn4eTestsInterface } from "./earthdawn4e.js";
import { dataPaths as exaltedthirdPaths } from "./exaltedthird.js";
import { testsInterface as exaltedthirdTestsInterface } from "./exaltedthird.js";
import { dataPaths as falloutPaths } from "./fallout.js";
import { testsInterface as falloutTestsInterface } from "./fallout.js";
import { dataPaths as genesysPaths } from "./genesys.js";
import { dataPaths as gurpsPaths } from "./gurps.js";
import { testsInterface as gurpsTestsInterface } from "./gurps.js";
import { dataPaths as iconPaths } from "./icon.js";
import { dataPaths as impmalPaths } from "./impmal.js";
import { testsInterface as impmalTestsInterface } from "./impmal.js";
import { dataPaths as pbtaPaths } from "./pbta.js";
import { testsInterface as pbtaTestsInterface } from "./pbta.js";
import { dataPaths as pf1Paths } from "./pf1.js";
import { testsInterface as pf1TestsInterface } from "./pf1.js";
import { dataPaths as pf2ePaths } from "./pf2e.js";
import { testsInterface as pf2eTestsInterface } from "./pf2e.js";
import { dataPaths as sfrpgPaths } from "./sfrpg.js";
import { testsInterface as sfrpgTestsInterface } from "./sfrpg.js";
import { dataPaths as shadowdarkPaths } from "./shadowdark.js";
import { testsInterface as shadowdarkTestsInterface } from "./shadowdark.js";
import { dataPaths as starwarsffgPaths } from "./starwarsffg.js";
import { testsInterface as starwarsffgTestsInterface } from "./starwarsffg.js";
import { dataPaths as sw5ePaths } from "./sw5e.js";
import { testsInterface as sw5eTestsInterface } from "./sw5e.js";
import { dataPaths as swadePaths } from "./swade.js";
import { testsInterface as swadeTestsInterface } from "./swade.js";
import { dataPaths as symbaroumPaths } from "./symbaroum.js";
import { testsInterface as symbaroumTestsInterface } from "./symbaroum.js";
import { dataPaths as vaesenPaths } from "./vaesen.js";
import { testsInterface as vaesenTestsInterface } from "./vaesen.js";
import { dataPaths as wfrp4ePaths } from "./wfrp4e.js";
import { testsInterface as wfrp4eTestsInterface } from "./wfrp4e.js";
import { dataPaths as wildtalentsPaths } from "./wildtalents.js";
import { testsInterface as wildtalentsTestsInterface } from "./wildtalents.js";
import { dataPaths as worldbuildingPaths } from "./worldbuilding.js";

export const systems = {
  a5e: a5ePaths,
  alienrpg: alienrpgPaths,
  anarchy: anarchyPaths,
  ars: arsPaths,
  bitd: bitdPaths,
  "castles-and-crusades": castlesAndCrusadesPaths,
  CoC7: CoC7Paths,
  crucible: cruciblePaths,
  "custom-system-builder": customSystemBuilderPaths,
  cyberpunk2020: cyberpunk2020Paths,
  daggerheart: daggerheartPaths,
  deltagreen: deltagreenPaths,
  demonlord: demonlordPaths,
  dnd4e: dnd4ePaths,
  dnd5e: dnd5ePaths,
  dsa5: dsa5Paths,
  earthdawn4e: earthdawn4ePaths,
  exaltedthird: exaltedthirdPaths,
  fallout: falloutPaths,
  genesys: genesysPaths,
  gurps: gurpsPaths,
  icon: iconPaths,
  impmal: impmalPaths,
  pbta: pbtaPaths,
  pf1: pf1Paths,
  pf2e: pf2ePaths,
  sfrpg: sfrpgPaths,
  shadowdark: shadowdarkPaths,
  starwarsffg: starwarsffgPaths,
  sw5e: sw5ePaths,
  swade: swadePaths,
  symbaroum: symbaroumPaths,
  vaesen: vaesenPaths,
  wfrp4e: wfrp4ePaths,
  wildtalents: wildtalentsPaths,
  worldbuilding: worldbuildingPaths,
};

const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

class DefaultFormulaInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        label: "Formula",
        required: true,
        blank: false,
      }),
    };
  }
}

class DefaultDCInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
        label: "DC",
        required: false,
        nullable: true,
        integer: true,
        min: 0,
      }),
    };
  }
}

export const defaultTestsInterface = {
  buildInputs: () => ({
    formula: DefaultFormulaInput,
    dc: DefaultDCInput,
  }),

  processCheck: async (actor, inputs, options = {}) => {
    const roll = await new foundry.dice.Roll(inputs.formula, actor.getRollData?.()).evaluate();
    await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }) });

    const target = Number.isNumeric(inputs.dc) ? inputs.dc : null;
    const success = target != null ? roll.total >= target : null;

    return {
      canceled: false,
      result: roll.total,
      target,
      success,
      levelOfSuccess: success == null ? null : success ? 100 : 0,
      criticalSuccess: false,
      criticalFailure: false,
    };
  },
};

export const testsInterfaces = {
  a5e: a5eTestsInterface ?? defaultTestsInterface,
  alienrpg: alienrpgTestsInterface ?? defaultTestsInterface,
  anarchy: anarchyTestsInterface ?? defaultTestsInterface,
  ars: arsTestsInterface ?? defaultTestsInterface,
  bitd: defaultTestsInterface,
  "castles-and-crusades":
    castlesAndCrusadesTestsInterface ?? defaultTestsInterface,
  CoC7: CoC7TestsInterface ?? defaultTestsInterface,
  crucible: crucibleTestsInterface ?? defaultTestsInterface,
  "custom-system-builder": defaultTestsInterface,
  cyberpunk2020: cyberpunk2020TestsInterface ?? defaultTestsInterface,
  daggerheart: daggerheartTestsInterface ?? defaultTestsInterface,
  deltagreen: deltagreenTestsInterface ?? defaultTestsInterface,
  demonlord: demonlordTestsInterface ?? defaultTestsInterface,
  dnd4e: dnd4eTestsInterface ?? defaultTestsInterface,
  dnd5e: dnd5eTestsInterface ?? defaultTestsInterface,
  dsa5: dsa5TestsInterface ?? defaultTestsInterface,
  earthdawn4e: earthdawn4eTestsInterface ?? defaultTestsInterface,
  exaltedthird: exaltedthirdTestsInterface ?? defaultTestsInterface,
  fallout: falloutTestsInterface ?? defaultTestsInterface,
  genesys: defaultTestsInterface,
  gurps: gurpsTestsInterface ?? defaultTestsInterface,
  icon: defaultTestsInterface,
  impmal: impmalTestsInterface ?? defaultTestsInterface,
  pbta: pbtaTestsInterface ?? defaultTestsInterface,
  pf1: pf1TestsInterface ?? defaultTestsInterface,
  pf2e: pf2eTestsInterface ?? defaultTestsInterface,
  sfrpg: sfrpgTestsInterface ?? defaultTestsInterface,
  shadowdark: shadowdarkTestsInterface ?? defaultTestsInterface,
  starwarsffg: starwarsffgTestsInterface ?? defaultTestsInterface,
  sw5e: sw5eTestsInterface ?? defaultTestsInterface,
  swade: swadeTestsInterface ?? defaultTestsInterface,
  symbaroum: symbaroumTestsInterface ?? defaultTestsInterface,
  vaesen: vaesenTestsInterface ?? defaultTestsInterface,
  wfrp4e: wfrp4eTestsInterface ?? defaultTestsInterface,
  wildtalents: wildtalentsTestsInterface ?? defaultTestsInterface,
  worldbuilding: defaultTestsInterface,
};
