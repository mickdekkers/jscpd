import { IStoreManagerOptions } from '../interfaces/store/store-manager-options.interface';
import { IStoreOptions } from '../interfaces/store/store-options.interface';
import { IStoreValue } from '../interfaces/store/store-value.interface';
import { IStore } from '../interfaces/store/store.interface';
import { FilesStore } from './files';
import { MemoryStore } from './memory';

class StoreManager<T extends IStoreValue> {
  private registeredStores: {
    [name: string]: { new (options: IStoreOptions): IStore<T> };
  } = {
    memory: MemoryStore,
    files: FilesStore
  };

  private stores: { [key: string]: IStore<T> } = {};

  private options: IStoreManagerOptions = {};

  public initialize(options: IStoreManagerOptions = {}) {
    this.options = options;
  }

  public close() {
    Object.values(this.stores).forEach(store => store.close());
  }

  public getStore(name: string): IStore<T> {
    if (!this.has(name)) {
      this.create(name);
    }
    return this.stores[name];
  }

  public has(name: string): boolean {
    return this.stores.hasOwnProperty(name);
  }

  public getRegisteredStore(type: string): { new (options: IStoreOptions): IStore<T> } {
    return this.registeredStores[type];
  }

  public isRegistered(type: string): boolean {
    return this.registeredStores.hasOwnProperty(type);
  }

  public registerStore(type: string, store: { new (options: IStoreOptions): IStore<T> }): void {
    this.registeredStores[type] = store;
  }

  public create(name: string): void {
    if (!this.has(name)) {
      // hashes.javascript
      const [main] = name.split('.');

      const { type, options = {} } = this.options[name] ||
        this.options[main] ||
        this.options['*'] || { type: 'memory' };

      this.stores[name] = new (this.getRegisteredStore(type))({
        ...options,
        name
      });
      this.stores[name].connect();
    }
  }
}

export const StoresManager: StoreManager<any> = new StoreManager<any>();
