export function rootLevelId(categoryId, rootCategoryId, categoriesById) {
    let category = categoriesById[categoryId];
    while (
        category &&
        category.parentId &&
        category.parentId !== rootCategoryId
    ) {
        category = categoriesById[category.parentId];
    }
    return category &&
        (category.parentId == rootCategoryId || category.id == rootCategoryId)
        ? category.id
        : null;
}
