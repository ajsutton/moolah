export default function (object, ...forbiddenProps) {
    const result = {};
    Object.entries(object)
        .filter(([key]) => !forbiddenProps.includes(key))
        .forEach(([key, value]) => (result[key] = value));
    return result;
}
