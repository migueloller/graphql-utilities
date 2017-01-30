export const expectTypesEqual = (a = {}, b = {}) => {
  expect(a.name).toBe(b.name);
  expect(a.description).toBe(b.description);
  expect(a.resolveType).toBe(b.resolveType);
  expect(a.isTypeOf).toBe(b.isTypeOf);
  expect(a.getFields && a.getFields()).toEqual(b.getFields && b.getFields());
  expect(a.getInterfaces && a.getInterfaces()).toEqual(b.getInterfaces && b.getInterfaces());
};

export const expectSchemasEqual = (a, b) => {
  if (a.getQueryType) {
    if (b.getQueryType) expectTypesEqual(a.getQueryType(), b.getQueryType());
    else expect(a.getQueryType).toEqual(b.getQueryType);
  }
  if (a.getMutationType) {
    if (b.getMutationType) expectTypesEqual(a.getMutationType(), b.getMutationType());
    else expect(a.getMutationType).toEqual(b.getMutationType);
  }
  if (a.getSubscriptionType) {
    if (b.getSubscriptionType) expectTypesEqual(a.getSubscriptionType(), b.getSubscriptionType());
    else expect(a.getSubscriptionType).toEqual(b.getSubscriptionType);
  }
  if (a.getTypeMap) {
    if (b.getTypeMap) {
      const aTypes = Object.values(a.getTypeMap());
      Object.values(b.getTypeMap()).forEach((value, i) => expectTypesEqual(value, aTypes[i]));
      expectTypesEqual(a.getTypeMap(), b.getTypeMap());
    } else expect(a.getTypeMap).toEqual(b.getTypeMap);
  }
  expect(a.getDirectives && a.getDirectives()).toEqual(b.getDirectives && b.getDirectives());
};
