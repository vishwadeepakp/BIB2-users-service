const StoreProfile = require('../models/StoreProfile.js');

exports.saveOrUpdateStoreProfile = async (userId, profileData) => {
  try {
    // 1. Data mapping (Front-end payloads)
    const storePayload = {
      userId,
      storeName: profileData.storeName,
      tagline: profileData.tagline || null,
      merchantName: profileData.merchantName,
      phone: profileData.phone,
      email: profileData.email || null,
      businessType: profileData.businessType || 'retail',
      addressLine1: profileData.addressLine1,
      addressLine2: profileData.addressLine2 || null,
      landmark: profileData.landmark || null,
      city: profileData.city,
      state: profileData.state || 'Maharashtra',
      stateCode: profileData.stateCode || '27',
      pincode: profileData.pincode,
      gstin: profileData.gstin || null,
      pan: profileData.pan || null,
      upiId: profileData.upiId || null,
      bankName: profileData.bankName || null,
      accountNo: profileData.accountNo || null,
      ifsc: profileData.ifsc || null,
      branch: profileData.branch || null,
      storeImage: profileData.storeImage || null,
    };

    // 2. Check existing record for logged-in user
    let store = await StoreProfile.findOne({ where: { userId } });

    if (store) {
      // Update existing record
      await store.update(storePayload);
      return { isNew: false, store };
    } else {
      // Create new record
      store = await StoreProfile.create(storePayload);
      return { isNew: true, store };
    }
  } catch (error) {
    throw new Error(`Store Service Error: ${error.message}`);
  }
};

exports.getStoreProfileByUserId = async (userId) => {
  try {
    const store = await StoreProfile.findOne({ where: { userId } });
    return store;
  } catch (error) {
    throw new Error(`Fetch Store Error: ${error.message}`);
  }
};
