export default function resolveShortcut(resolveMap) {
  return Object.keys(resolveMap).reduce((map, fieldName) => ({
    ...map, [fieldName]: { resolve: resolveMap[fieldName] },
  }), {});
}
