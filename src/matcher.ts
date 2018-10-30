import * as _ from 'lodash';
import {FilterCallback, MatcherInterface} from './interfaces';
import {FilterType} from '@rxstack/query-filter';
import {Injectable} from 'injection-js';

interface OperatorType {
  operator: FilterType;
  callback: Function;
  positive: boolean;
}

@Injectable()
export class Matcher implements MatcherInterface {

  protected _filters: Map<FilterType, { (key: string, value: any): FilterCallback }> = new Map();

  constructor() {
    this.getOperatorTypes().forEach(item => this._filters.set(
      item['operator'],
      (key: string, value: any) => (current: any) => item['positive'] === item['callback'](current[key], value)
    ));
  }

  match(query: {[key: string]: any}): FilterCallback {
    return (item: any): boolean => {
      return query && _.isObject(query['$or']) ?
        _.isObject(query['$or']) && _.some(query['$or'], or => this.match(or)(item)) :
        this.resolveQuery(query, item);
    };
  }

  private resolveQuery(query: {[key: string]: any}, item: any): boolean {
    return _.every<{[key: string]: any}>(query, (value: any, key: string) => {
      return _.isObject(value) && _.every(value, (target: any, filterType: FilterType) => {
        return this._filters.has(filterType) && this._filters.get(filterType)(key, target)(item);
      });
    });
  }

  private getOperatorTypes(): OperatorType[] {
    return [
      { operator: '$in', callback: _.includes, positive: true },
      { operator: '$nin', callback: _.includes,  positive: false },
      { operator: '$lt', callback: _.lt, positive: true },
      { operator: '$lte', callback: _.lte, positive: true },
      { operator: '$gt', callback: _.gt,  positive: true },
      { operator: '$gte', callback: _.gte, positive: true },
      { operator: '$ne', callback: _.isEqual, positive: false },
      { operator: '$eq', callback: _.isEqual, positive: true }
    ];
  }
}