import 'reflect-metadata';
import {describe, expect, it, beforeAll, afterAll} from '@jest/globals';
import {MemoryService} from '../src/memory-service';
import {data1} from './mocks/data';
import {BadRequestException, Exception} from '@rxstack/exceptions';
import * as _ from 'lodash';
import {Application} from '@rxstack/core';
import {MEMORY_SERVICE_OPTIONS, PRODUCT_SERVICE} from './mocks/MEMORY_SERVICE_OPTIONS';
import {Injector} from 'injection-js';
import {DataContainer} from '../src';

describe('MemoryService:Impl', () => {
  // Setup application
  const app = new Application(MEMORY_SERVICE_OPTIONS);
  let injector: Injector;
  let service: MemoryService<any>;

  beforeAll(async() =>  {
    await app.start();
    injector = app.getInjector();
    service = injector.get(PRODUCT_SERVICE);
  });

  afterAll(async() =>  {
    await app.stop();
  });

  beforeEach(async () => {
    await injector.get(DataContainer).purge();
  });

  it('#insertOne', async () => {
    const data = _.omit(data1[0], 'id');
    const product = await service.insertOne(data);
    expect(typeof product.id).toBe('string');
  });

  it('#insertOne should throw an exception if record exists', async () => {
    const data = _.cloneDeep(data1[0]);
    const product = await service.insertOne(data);
    expect(product.id).toBe('product-1');
    let exception: Exception;
    try {
      await service.insertOne(data);
    } catch (e) {
      exception = e;
    }
    expect(exception).toBeInstanceOf(BadRequestException);
  });


  it('#insertMany', async () => {
    await service.insertMany(_.cloneDeep(data1));
    const result = await service.count();
    expect(result).toBe(3);
  });


  it('#updateOne', async () => {
    await service.insertMany(_.cloneDeep(data1));
    await service.updateOne('product-1', Object.assign(_.cloneDeep(data1[0]) , {
      'name': 'replaced'
    }));
    const result = await service.findOne({'id': {'$eq': 'product-1'}})
    expect(result.id).toBe('product-1');
    expect(result.name).toBe('replaced');
  });


  it('#updateOne with patch', async () => {
    await service.insertMany(_.cloneDeep(data1));
    await service.updateOne('product-1', {
      'name': 'patched'});
    const result = await service.findOne({'id': {'$eq': 'product-1'}});
    expect(result.id).toBe('product-1');
    expect(result.name).toBe('patched');
  });

  it('#updateOne should throw an exception if record does not exists', async () => {
    let exception: Exception;
    try {
      await service.updateOne('unknown', {});
    } catch (e) {
      exception = e;
    }
    expect(exception).toBeInstanceOf(BadRequestException);
  });

  it('#updateMany', async () => {
    await service.insertMany(_.cloneDeep(data1));
    const cnt = await service.updateMany({ 'price': {'$gt': 1} }, {
      'name': 'patched'
    });
    expect(cnt).toBe(3);
    const products = await service.findMany();
    products.forEach(p => expect(p.name).toBe('patched'));
  });

  it('#removeOne', async () => {
    await service.insertMany(_.cloneDeep(data1));
    await service.removeOne('product-1');
    const result = await service.findOne({'id': { '$eq': 'product-1' }});
    expect(!!result).toBeFalsy();
  });


  it('#removeMany', async () => {
    await service.insertMany(_.cloneDeep(data1));
    const cnt = await service.removeMany({ 'price': {'$gt': 1}});
    expect(cnt).toBe(3);
    const productsCnt = await service.count();
    expect(productsCnt).toBe(0);
  });

  it('#findMany', async () => {
    await service.insertMany(data1);
    const result = await service.findMany();
    expect(result.length).toBe(3);
  });

  it('#findMany with query', async () => {
    await service.insertMany(data1);
    const result = await service.findMany({'where': {'tags': {'$in': 'tag2'}}, limit: 10, skip: 0});
    expect(result.length).toBe(2);
  });

  it('#count', async () => {
    await service.insertMany(data1);
    const result = await service.count();
    expect(result).toBe(3);
  });

  it('#count with query', async () => {
    await service.insertMany(data1);
    const result = await service.count({'tags': {'$in': 'tag2'}});
    expect(result).toBe(2);
  });

  it('#findOne', async () => {
    await service.insertMany(data1);
    const result = await service.findOne({'name': {'$eq': 'name1'}});
    expect(result.name).toBe('name1');
  });

  it('#find', async () => {
    await service.insertMany(data1);
    const result = await service.find('product-1');
    expect(result.id).toBe('product-1');
  });
});
