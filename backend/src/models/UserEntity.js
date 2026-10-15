const mongoose = require('mongoose');

const ENTITY_TYPES = [
  'PERSON',
  'MERCHANT',
  'SELF_TRANSFER',
  'UNKNOWN',
];

const userEntitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },

    entityKey: {
      type: String,
      required: [true, 'Entity key is required'],
      trim: true,
    },

    displayName: {
      type: String,
      required: [true, 'Entity display name is required'],
      trim: true,
    },

    entityType: {
      type: String,
      enum: {
        values: ENTITY_TYPES,
        message: '{VALUE} is not a valid entity type',
      },
      required: [true, 'Entity type is required'],
    },

    category: {
      type: String,
      default: null,
      trim: true,
    },

    relationship: {
      type: String,
      default: null,
      trim: true,
    },

    known: {
      type: Boolean,
      default: false,
    },

    monitoringEnabled: {
      type: Boolean,
      default: true,
    },

    aliases: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Each user has their own independent entity knowledge.
userEntitySchema.index(
  { user: 1, entityKey: 1 },
  { unique: true }
);

module.exports = mongoose.model('UserEntity', userEntitySchema);