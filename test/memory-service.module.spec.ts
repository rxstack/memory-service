import 'reflect-metadata';
import {describe, expect, it, beforeAll, afterAll} from '@jest/globals';
import {Application} from '@rxstack/core';
import {Injector} from 'injection-js';
import {MEMORY_SERVICE_OPTIONS, PRODUCT_SERVICE} from './mocks/MEMORY_SERVICE_OPTIONS';
import {DataContainer, Matcher, MATCHER_TOKEN, MemoryService, Sorter, SORTER_TOKEN} from '../src';

describe('MemoryService:MemoryServiceModule', () => {
  // Setup application
  const app = new Application(MEMORY_SERVICE_OPTIONS);
  let injector: Injector;

  beforeAll(async() =>  {
    await app.start();
    injector = app.getInjector();
  });

  afterAll(async() =>  {
    await app.stop();
  });

  it('#PRODUCT_SERVICE', () => {
    expect(injector.get(PRODUCT_SERVICE)).toBeInstanceOf(MemoryService);
  });

  it('#MATCHER_TOKEN', () => {
    expect(injector.get(MATCHER_TOKEN)).toBeInstanceOf(Matcher);
  });

  it('#SORTER_TOKEN', () => {
    expect(injector.get(SORTER_TOKEN)).toBeInstanceOf(Sorter);
  });

  it('#DataContainer', () => {
    expect(injector.get(DataContainer)).toBeInstanceOf(DataContainer);
  });
});
