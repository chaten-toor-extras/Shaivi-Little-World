import { Secret } from '../models/Secret.js';
import { AppError } from '../utils/AppError.js';

export const secretService = {
  /**
   * Check for circular dependencies in requiresSecretIds.
   * Detects self-reference (A requires A) and multi-step cycles (A -> B -> A).
   * @param {string} targetSecretId - The ID of the secret being created/updated
   * @param {string[]} requiresSecretIds - The list of dependency IDs
   */
  async validateNoCircularDependencies(targetSecretId, requiresSecretIds = []) {
    if (!requiresSecretIds || requiresSecretIds.length === 0) return;

    const targetIdStr = targetSecretId ? String(targetSecretId) : null;

    // 1. Check direct self-reference
    if (targetIdStr && requiresSecretIds.some((id) => String(id) === targetIdStr)) {
      throw new AppError('A secret cannot require itself as a dependency', 400);
    }

    // 2. Transitive cycle detection up to depth 10
    const visited = new Set();
    const queue = [...requiresSecretIds.map(String)];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId || visited.has(currentId)) continue;
      visited.add(currentId);

      if (targetIdStr && currentId === targetIdStr) {
        throw new AppError('Circular dependency detected between secrets', 400);
      }

      const dep = await Secret.findById(currentId).select('conditions.requiresSecretIds').lean();
      if (dep?.conditions?.requiresSecretIds?.length) {
        for (const nextId of dep.conditions.requiresSecretIds) {
          const nextIdStr = String(nextId);
          if (targetIdStr && nextIdStr === targetIdStr) {
            throw new AppError('Circular dependency detected between secrets', 400);
          }
          if (!visited.has(nextIdStr)) {
            queue.push(nextIdStr);
          }
        }
      }
    }
  },

  /**
   * Clones a secret with a unique copy slug.
   * @param {string} id - ID of the secret to duplicate
   */
  async duplicateSecret(id) {
    const original = await Secret.findById(id).lean();
    if (!original) {
      throw new AppError('Secret not found', 404);
    }

    // Generate unique slug
    let baseSlug = `${original.slug}-copy`;
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await Secret.findOne({ slug: uniqueSlug })) {
      counter += 1;
      uniqueSlug = `${baseSlug}-${counter}`;
    }

    const { _id, __v, createdAt, updatedAt, ...copyData } = original;

    const newSecret = await Secret.create({
      ...copyData,
      name: `${original.name} (Copy)`,
      slug: uniqueSlug,
      enabled: false, // Start disabled for safety
      isPublished: false,
    });

    return newSecret;
  },
};

