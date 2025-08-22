const Project = require('../models/Project');

exports.createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('members', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
