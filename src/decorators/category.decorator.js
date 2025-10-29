function decorateCategory(row = {}) {
  return { id: row.id, name: row.name, user_id: row.user_id, created_at: row.created_at, updated_at: row.updated_at };
}
function decorateList(rows = []) { return rows.map(decorateCategory); }
module.exports = { decorateCategory, decorateList };
