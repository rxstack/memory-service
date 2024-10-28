import 'reflect-metadata';
import {describe, expect, it, beforeAll, afterAll} from '@jest/globals';
import {DataContainer} from '../src';

describe('MemoryService:DataContainer', () => {
  // Setup
  const container = new DataContainer();

  it('#getCollection', () => {
    expect(container.getCollection('name')).toBeInstanceOf(Map);
  });

  it('#count', () => {
    expect(container.count()).toBe(1);
  });

  it('#purge', async () => {
    await container.purge();
    expect(container.count()).toBe(0);
  });
});
