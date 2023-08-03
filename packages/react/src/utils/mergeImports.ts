import { ValueOf } from '@/typings';
import { Imports } from '@/weave';
import mergeWith from 'lodash/mergeWith.js';

function customizer(origin: undefined | ValueOf<Imports>, other: ValueOf<Imports>) {
  if (!origin) {
    return [...other];
  } else {
    const originAsNames = origin.map(({ asName }) => asName);
    return [...origin, ...other.filter(({ asName }) => !originAsNames.includes(asName))];
  }
}

export default function mergeImports(origin: Imports, other: Imports) {
  return mergeWith(origin, other, customizer);
}
