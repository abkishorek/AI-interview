const User = require('../models/User');

// @desc    Get user profile with stats
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        experienceLevel: user.experienceLevel,
        interests: user.interests,
        languages: user.languages,
        readinessScore: user.readinessScore,
        technicalScore: user.technicalScore,
        hrScore: user.hrScore,
        codingScore: user.codingScore,
        streak: user.streak,
        weakTopics: user.weakTopics,
        strongTopics: user.strongTopics,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, targetRole, experienceLevel, interests, languages } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (targetRole) fieldsToUpdate.targetRole = targetRole;
    if (experienceLevel) fieldsToUpdate.experienceLevel = experienceLevel;
    if (interests) fieldsToUpdate.interests = interests;
    if (languages) fieldsToUpdate.languages = languages;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        experienceLevel: user.experienceLevel,
        interests: user.interests,
        languages: user.languages,
        readinessScore: user.readinessScore,
        streak: user.streak,
      },
    });
  } catch (error) {
    next(error);
  }
};
