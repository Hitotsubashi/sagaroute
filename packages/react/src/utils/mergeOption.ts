import { RoutingOption } from '..';
import mergeWith from 'lodash/mergeWith.js';

export function isObject(arg: any) {
  return Object.prototype.toString.call(arg) === '[object Object]';
}

function isFn(arg: any) {
  return Object.prototype.toString.call(arg) === '[object Function]';
}

function customizer(input: any, config: any, key: string): any {
  if (
    isObject(input) &&
    isObject(config) &&
    ['hooks', 'gather', 'weave', 'print', 'parse', 'inject', 'write'].includes(key)
  ) {
    return mergeWith(input, config, customizer);
  } else if (['before', 'after', 'beforeEach', 'afterEach'].includes(key)) {
    input = Array.isArray(input) ? input : isFn(input) || isObject(input) ? [input] : [];
    config = Array.isArray(config) ? config : isFn(config) || isObject(config) ? [config] : [];
    const result = input.concat(config);
    switch (result.length) {
      case 0:
        return undefined;
      case 1:
        return result.pop();
      default:
        return result;
    }
  } else {
    return input !== undefined ? input : config;
  }
}

export default function mergeOption(
  inputOption: RoutingOption,
  configFileOption: RoutingOption,
): RoutingOption {
  return mergeWith(inputOption, configFileOption, customizer);
}
