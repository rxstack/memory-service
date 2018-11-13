import {ServiceInterface, UpdateOneOptions} from '@rxstack/platform';
import {QueryInterface, SortInterface} from '@rxstack/query-filter';
import {Injectable, Injector} from 'injection-js';
import {MATCHER_TOKEN, MatcherInterface, MemoryServiceOptions, SORTER_TOKEN, SorterInterface} from './interfaces';
import * as _ from 'lodash';
import {DataContainer} from './data-container';
import {BadRequestException} from '@rxstack/exceptions';
import {InjectorAwareInterface} from '@rxstack/core';

const uuid = require('uuid/v4');

@Injectable()
export class MemoryService<T> implements ServiceInterface<T>, InjectorAwareInterface {

  protected injector: Injector;

  constructor(public options: MemoryServiceOptions) { }

  setInjector(injector: Injector): void {
    this.injector = injector;
  }

  async insertOne(data: Object): Promise<T> {
    const id = data[this.options.idField] || uuid();
    this.assertObject(id, true);
    const obj = _.extend({}, data, { [this.options.idField]: id }) as T;
    this.getCollection().set(id, obj);
    return obj;
  }

  async insertMany(data: Object[]): Promise<T[]> {
    const promises: Promise<T>[] = [];
    data.forEach(data => promises.push(this.insertOne(data)));
    return Promise.all(promises);
  }

  async updateOne(id: any, data: Object, options?: UpdateOneOptions): Promise<T> {
    this.assertObject(id, false);
    let resource: T;
    if (options && options.patch) {
      resource = _.extend(this.getCollection().get(id), _.omit(data, this.options.idField)) as T;
    } else {
      resource = _.extend({}, data, { [this.options.idField]: id }) as T;
    }
    this.getCollection().set(id, resource);
    return resource;
  }

  async updateMany(criteria: Object, data: Object): Promise<number> {
    const promises: Promise<T>[] = [];
    const resources = await this.findMany({where: criteria, skip: 0, limit: this.options.defaultLimit});
    resources.forEach(
      resource => promises.push(this.updateOne(resource[this.options.idField], data, { patch: true }))
    );
    const result = await Promise.all(promises);
    return result.length;
  }

  async removeOne(id: any): Promise<void> {
    this.assertObject(id, false);
    this.getCollection().delete(id);
  }

  async removeMany(criteria: Object): Promise<number> {
    const promises: Promise<void>[] = [];
    const resources = await this.findMany({where: criteria, skip: 0, limit: this.options.defaultLimit});
    resources.forEach(
      resource => promises.push(this.removeOne(resource[this.options.idField]))
    );
    const result = await Promise.all(promises);
    return result.length;
  }

  async count(criteria?: Object): Promise<number> {
    return this.getFilteredAndSortedResult(criteria).length;
  }

  async findOne(criteria: Object, sort?: SortInterface): Promise<T> {
    return _.first(this.getFilteredAndSortedResult(criteria, sort));
  }

  async findMany(query?: QueryInterface): Promise<T[]> {
    query = Object.assign({}, query);
    return this.getFilteredAndSortedResult(query.where, query.sort)
      .slice(query.skip)
      .slice(0, query.limit)
    ;
  }

  protected getCollection(): Map<string, T> {
    return this.injector.get(DataContainer).getCollection<T>(this.options.collectionName);
  }

  protected getMather(): MatcherInterface {
    return this.injector.get(MATCHER_TOKEN);
  }

  protected getSorter(): SorterInterface {
    return this.injector.get(SORTER_TOKEN);
  }

  private getFilteredAndSortedResult(criteria?: Object, sort?: SortInterface): T[] {
    return Array
      .from(this.getCollection().values())
      .filter(this.getMather().match(criteria))
      .sort(this.getSorter().sort(sort))
    ;
  }

  private assertObject(id: any, ifExists: boolean): void {
    let message: string;
    if (ifExists && this.getCollection().has(id)) {
      message = `Record with ${id} already exists.`;
    } else if (!ifExists && !this.getCollection().has(id)) {
      message = `Record with ${id} does not exist.`;
    }
    if (message) {
      throw new BadRequestException(message);
    }
  }
}