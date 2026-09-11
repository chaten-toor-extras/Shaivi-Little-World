export const cmsService = {
  async reorderItems(Model, items) {
    const operations = items.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } }
      }
    }));

    if (operations.length > 0) {
      await Model.bulkWrite(operations);
    }
  },

  async getOrCreateSingleton(Model, defaults = {}) {
    let doc = await Model.findOne();
    if (!doc) {
      doc = await Model.create(defaults);
    }
    return doc;
  }
};

