# The RxStack Memory Service Module

[![Maintainability](https://api.codeclimate.com/v1/badges/9e8e95e4e45995eb5ddf/maintainability)](https://codeclimate.com/github/rxstack/memory-service/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/9e8e95e4e45995eb5ddf/test_coverage)](https://codeclimate.com/github/rxstack/memory-service/test_coverage)
[![Build Status](https://travis-ci.org/rxstack/memory-service.svg?branch=master)](https://travis-ci.org/rxstack/memory-service)

> In-memory data storage that implements [@rxstack/platform adapter API and querying syntax](https://github.com/rxstack/rxstack/tree/master/packages/platform#services).

## Table of content

- [Instalation](#instalation)
- [Setup](#setup)
- [Usage](#usage)
- [Matcher](#matcher)
- [Sorter](#sorter)

## <a name="instalation"></a> Installation

```
npm install @rxstack/memory-service --save

// peer dependencies
npm install --no-save @rxstack/core@^0.7 @rxstack/exceptions@^0.6 @rxstack/platform@^0.7 @rxstack/query-filter@^0.6 @rxstack/security@^0.7 @rxstack/async-event-dispatcher@^0.6 @rxstack/service-registry@^0.6 winston@^3.3.3
```

## <a name="setup"></a>  Setup
`MemoryServiceModule` needs to be registered in the `application`. Let's create the application:

```typescript
import {Application, ApplicationOptions} from '@rxstack/core';
import {MemoryServiceModule} from '@rxstack/memory-service';

export const APP_OPTIONS: ApplicationOptions = {
  imports: [
    MemoryServiceModule
  ],
  providers: [
    // ...
  ]
};

new Application(APP_OPTIONS).start();
```

## <a name="usage"></a>  Usage

First we need to create `model interface` and `InjectionToken`:

```typescript
import {InjectionToken} from 'injection-js';
import {MemoryService} from '@rxstack/memory-service';

export interface Product {
  id: string;
  name: string;
}

export const PRODUCT_SERVICE = new InjectionToken<MemoryService<Product>>('PRODUCT_SERVICE');
```

then register it in the application provides:

```typescript
import {ApplicationOptions} from '@rxstack/core';
import {MemoryService} from '@rxstack/memory-service';

export const APP_OPTIONS: ApplicationOptions = {
  // ...
  providers: [
    {
      provide: PRODUCT_SERVICE,
      useFactory: () => {
        return new MemoryService({ idField: 'id', collection: 'products', defaultLimit: 25 });
      },
      deps: [],
    },
  ]
};
```

[Read more about platform services](https://github.com/rxstack/rxstack/tree/master/packages/platform#services)

## <a name="matcher"></a>  Matcher
`Matcher` is used to filter the entries. If you need a custom matcher then implement `MatherInterface`:

```typescript
import {FilterCallback, MatcherInterface} from '@rxstack/memory-service';
import {Injectable} from 'injection-js';

@Injectable()
export class MyCustomMatcher implements MatcherInterface {

  match(query: {[key: string]: any}): FilterCallback {
    // your custom logic
  }
}
```

and register it in the application providers:

```typescript
import {ApplicationOptions} from '@rxstack/core';
import {MATCHER_TOKEN} from '@rxstack/memory-service';

export const APP_OPTIONS: ApplicationOptions = {
  // ...
  providers: [
    // ...
    { provide: MATCHER_TOKEN, useClass: MyCustomMatcher },
  ]
};
```

> `MyCustomMatcher` will replace the original matcher


## <a name="sorter"></a>  Sorter
`Sorter` is used to sort the entries. If you need a custom sorter then implement `SorterInterface`:

```typescript
import {SorterInterface} from '@rxstack/memory-service';
import {SortInterface} from '@rxstack/query-filter';
import {Injectable} from 'injection-js';

@Injectable()
export class MyCustomSorter implements SorterInterface {

  sort(sort: SortInterface): ComparisonCallback {
    // your custom logic
  }
}
```

and register it in the application providers:

```typescript
import {ApplicationOptions} from '@rxstack/core';
import {SORTER_TOKEN} from '@rxstack/memory-service';

export const APP_OPTIONS: ApplicationOptions = {
  // ...
  providers: [
    // ...
    { provide: SORTER_TOKEN, useClass: MyCustomSorter },
  ]
};
```

> `MyCustomSorter` will replace the original sorter

## License

Licensed under the [MIT license](LICENSE).

