const Fragment = require('../models/fragmentModel');


exports.createFragment = async (req, res) => {
  try {
    const fragment = new Fragment(req.body);
    await fragment.save();
    res.status(201).json({ data: fragment }); 
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.getAllFragments = async (req, res) => {
  try {
    const fragments = await Fragment.find();
    res.status(200).json(fragments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFragmentById = async (req, res) => {
  try {
    const { fragmentId } = req.params;
    const fragment = await Fragment.findById(fragmentId);
    if (!fragment) {
      return res.status(404).json({ message: 'Fragment not found' });
    }
    res.status(200).json(fragment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFragment = async (req, res) => {
  try {
    const { fragmentId } = req.params;
    const fragment = await Fragment.findByIdAndUpdate(fragmentId, req.body, { new: true });
    if (!fragment) {
      return res.status(404).json({ message: 'Fragment not found' });
    }
    res.status(200).json(fragment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteFragment = async (req, res) => {
  try {
    const { fragmentId } = req.params;
    const fragment = await Fragment.findByIdAndDelete(fragmentId);
    if (!fragment) {
      return res.status(404).json({ message: 'Fragment not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
