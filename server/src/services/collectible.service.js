import { Collectible } from '../models/Collectible.js';
import { Secret } from '../models/Secret.js';
import { AppError } from '../utils/AppError.js';

export const collectibleService = {
  /**
   * Reorder collectibles by array of IDs.
   */
  async reorder(orderedIds) {
    if (!Array.isArray(orderedIds)) {
      throw new AppError('orderedIds must be an array', 400);
    }

    const updates = orderedIds.map((id, index) =>
      Collectible.findByIdAndUpdate(id, { order: index })
    );

    await Promise.all(updates);
    return Collectible.find().sort({ order: 1 });
  },

  /**
   * Check if any Secret references this collectible before deletion.
   */
  async checkSecretReferences(collectibleId) {
    const referencingSecrets = await Secret.find({
      'reveal.collectibleId': collectibleId,
    }).select('name slug');

    return referencingSecrets;
  },

  /**
   * Clean up secret references when a collectible is deleted.
   */
  async cleanupSecretReferences(collectibleId) {
    await Secret.updateMany(
      { 'reveal.collectibleId': collectibleId },
      {
        $set: {
          'reveal.type': 'MESSAGE',
          'reveal.collectibleId': null,
        },
      }
    );
  },
};

