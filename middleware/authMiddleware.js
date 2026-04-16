const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_cambiar_en_produccion';

module.exports = function requireAuth(req, res, next) {
  const token = req.cookies.insp_token;
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesión expirada. Por favor vuelva a iniciar sesión.' });
  }
};
