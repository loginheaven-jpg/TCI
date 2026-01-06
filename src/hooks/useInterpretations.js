import { useMemo } from 'react';
import {
  TEMPERAMENT_TYPES,
  CHARACTER_TYPES,
  TEMPERAMENT_INTERACTIONS,
  getTemperamentInterpretation,
  getCharacterInterpretation,
  getInteractionInterpretation
} from '../data/interpretations';

export function useInterpretations() {
  const temperamentTypes = useMemo(() => TEMPERAMENT_TYPES, []);
  const characterTypes = useMemo(() => CHARACTER_TYPES, []);
  const interactions = useMemo(() => TEMPERAMENT_INTERACTIONS, []);

  const getTemperament = (typeCode) => {
    return getTemperamentInterpretation(typeCode);
  };

  const getCharacter = (typeCode) => {
    return getCharacterInterpretation(typeCode);
  };

  const getInteraction = (scale1, scale2, level1, level2) => {
    return getInteractionInterpretation(scale1, scale2, level1, level2);
  };

  return {
    temperamentTypes,
    characterTypes,
    interactions,
    getTemperament,
    getCharacter,
    getInteraction
  };
}
