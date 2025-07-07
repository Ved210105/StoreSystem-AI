import mongoose from 'mongoose';

const arAssetSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['glb', 'gltf'], required: true },
  hotspots: [{ type: Object }],
});

export default mongoose.model('ARAsset', arAssetSchema); 