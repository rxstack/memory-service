import {ServiceInterface} from '@rxstack/platform';
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
    this.assertObjectNotExist(id);
    const obj = _.extend({}, data, { [this.options.idField]: id }) as T;
    this.getCollection().set(id, obj);
    return _.cloneDeep(obj);
  }

  async insertMany(data: Object[]): Promise<T[]> {
    const promises: Promise<T>[] = [];
    data.forEach(data => promises.push(this.insertOne(data)));
    return _.cloneDeep(Promise.all(promises));
  }

  async updateOne(id: any, data: Object): Promise<void> {
    this.assertObjectExist(id);
    const resource = _.merge(this.getCollection().get(id), _.omit(data, this.options.idField));
    this.getCollection().set(id, resource);
  }

  async updateMany(criteria: Object, data: Object): Promise<number> {
    const resources = await this.findMany({where: criteria, skip: 0, limit: this.options.defaultLimit});
    for (let i = 0; i < resources.length; i++) {
      await this.updateOne(resources[i][this.options.idField], data);
    }
    return resources.length;
  }

  async removeOne(id: any): Promise<void> {
    this.assertObjectExist(id);
    this.getCollection().delete(id);
  }

  async removeMany(criteria: Object): Promise<number> {
    const resources = await this.findMany({where: criteria, skip: 0, limit: this.options.defaultLimit});
    for (let i = 0; i < resources.length; i++) {
      await this.removeOne(resources[i][this.options.idField]);
    }
    return resources.length;
  }

  async count(criteria?: Object): Promise<number> {
    return this.getFilteredAndSortedResult(criteria).length;
  }

  async find(id: any): Promise<T> {
    return _.cloneDeep(this.getCollection().get(id));
  }

  async findOne(criteria: Object): Promise<T> {
    return _.cloneDeep(_.first(this.getFilteredAndSortedResult(criteria)));
  }

  async findMany(query?: QueryInterface): Promise<T[]> {
    query = Object.assign({where: {}, limit: this.options.defaultLimit, skip: 0, sort: null}, query);
    const result = this.getFilteredAndSortedResult(query.where, query.sort)
      .slice(query.skip)
      .slice(0, query.limit)
    ;
    return _.cloneDeep(result);
  }

  protected getCollection(): Map<string, T> {
    return this.injector.get(DataContainer).getCollection<T>(this.options.collection);
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

  private assertObjectExist(id: any): void {
    if (!this.getCollection().has(id)) {
      throw new BadRequestException(`Record with ${id} does not exist.`);
    }
  }

  private assertObjectNotExist(id: any): void {
    if (this.getCollection().has(id)) {
      throw new BadRequestException(`Record with ${id} already exists.`);
    }
  }
}