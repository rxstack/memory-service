import 'reflect-metadata';
import {describe, expect, it, beforeAll, afterAll} from '@jest/globals';
import {Sorter} from '../src/sorter';
import {data2} from './mocks/data';

describe('MemoryService:Sorter', () => {
  // Setup
  const sorter = new Sorter();

  it('#sort by price asc', () => {
    const result = data2.sort(sorter.sort({'price': 1}));
    expect(result[0].name).toBe('name3');
  });

  it('#sort by price desc', () => {
    const result = data2.sort(sorter.sort({'price': -1}));
    expect(result[0].name).toBe('name2');
  });

  it('#sort by price desc and name desc', () => {
    const result = data2.sort(sorter.sort({'price': -1, 'name': -1}));
    expect(result[1].name).toBe('name4');
  });
});
