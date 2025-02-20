import 'reflect-metadata';
import {describe, expect, it, beforeAll, afterAll} from '@jest/globals';
import {Matcher} from '../src/matcher';
import {data1} from './mocks/data';

describe('MemoryService:Matcher', () => {
  // Setup
  const matcher = new Matcher();

  it('#eq', () => {
    const result = data1.filter(matcher.match({'name': {'$eq':  'name1'}}));
    expect(result.length).toBe(1);
  });

  it('#eq', () => {
    const result = data1.filter(matcher.match({'name': {'$eq':  'name1'}}));
    expect(result.length).toBe(1);
  });

  it('#ne', () => {
    const result = data1.filter(matcher.match({'name': {'$ne':  'name1'}}));
    expect(result.length).toBe(2);
  });

  it('#gte', () => {
    const result = data1.filter(matcher.match({'price': {'$gte':  10.20}}));
    expect(result.length).toBe(2);
  });

  it('#gt', () => {
    const result = data1.filter(matcher.match({'price': {'$gt':  10.20}}));
    expect(result.length).toBe(1);
  });

  it('#lte', () => {
    const result = data1.filter(matcher.match({'price': {'$lte':  10.20}}));
    expect(result.length).toBe(2);
  });

  it('#lt', () => {
    const result = data1.filter(matcher.match({'price': {'$lt':  10.20}}));
    expect(result.length).toBe(1);
  });

  it('#in with string', () => {
    const result = data1.filter(matcher.match({'name': {'$in':  '2'}}));
    expect(result.length).toBe(1);
  });

  it('#in with array', () => {
    const result = data1.filter(matcher.match({'tags': {'$in':  'tag2'}}));
    expect(result.length).toBe(2);
  });

  it('#nin with string', () => {
    const result = data1.filter(matcher.match({'name': {'$nin':  2}}));
    expect(result.length).toBe(2);
  });

  it('#nin with array', () => {
    const result = data1.filter(matcher.match({'tags': {'$nin':  'tag1'}}));
    expect(result.length).toBe(2);
  });

  it('#or', () => {
    const result = data1.filter(matcher.match({'$or': [
        { 'name': {'$eq': 'name1'}},
        { 'name': {'$eq': 'name2'}}
      ] }));
    expect(result.length).toBe(2);
  });

  it('#none', () => {
    const result = data1.filter(matcher.match({'name': {'$none':  'name1'}}));
    expect(result.length).toBe(0);
  });
});
