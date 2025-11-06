const decorateTag = (tag = {}) => ({
  id: tag.tag_id || tag.id,
  name: tag.tag_name || tag.name
});

function decorateListTags(rows = []) { return rows.map(decorateTag); }
module.exports = { decorateTag, decorateListTags };
