import resolveShortcut from '../resolveShortcut';

describe('resolveShortcut()', () => {
  it('should work', () => {
    const resolve = () => {};
    expect(resolveShortcut({ field: resolve })).toEqual({ field: { resolve } });
  });
});
