export class LocalStorageAdapter {
  async save(key: string, data: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(data));
  }

  async load(key: string): Promise<any> {
    const data = localStorage.getItem(key);
    if (!data) throw new Error(`No data found for key: ${key}`);
    return JSON.parse(data);
  }

  async list(): Promise<Array<{key: string, name: string, date: Date}>> {
    return Object.keys(localStorage)
      .filter(key => key.startsWith('project-'))
      .map(key => ({
        key,
        name: key.replace('project-', ''),
        date: new Date(parseInt(key.split('-')[1]))
      }));
  }
}
