const { decorateCategory } = require('./category.decorator');
const { decorateTag } = require('./tag.decorator');

function decorateTask(row = {}) {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        user_id: row.user_id,
        category_id: row.category_id,
        category: row.category
            ? decorateCategory(row.category) 
            : null,
        completed: row.status,
        tags: Array.isArray(row.tags) && row.tags.length > 0
            ? row.tags.map(decorateTag)     
            : [],

        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

function decorateList(rows = []) {
    return rows.map(decorateTask);
}

module.exports = { decorateTask, decorateList };
