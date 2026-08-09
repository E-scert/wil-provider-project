require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const studentsRoutes = require('./routes/students.routes');
const companiesRoutes = require('./routes/companies.routes');
const programsRoutes = require('./routes/programs.routes');
const applicationsRoutes = require('./routes/applications.routes');
const institutionsRoutes = require('./routes/institutions.routes');
const superadminRoutes = require('./routes/superadmin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serves uploaded CVs at /uploads/cvs/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/programs', programsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/institutions', institutionsRoutes);
app.use('/api/admin', superadminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
});

// Central error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`WIL Hub API listening on http://localhost:${PORT}`);
});
