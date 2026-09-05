const Application = require('@waline/vercel');

module.exports = Application({
  plugins: [],
  async postSave(comment) {
    // Add project-specific post-save hooks here when needed.
  },
});
