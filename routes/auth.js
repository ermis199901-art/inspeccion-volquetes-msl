const router     = require('express').Router();
const ctrl       = require('../controllers/authController');
const requireAuth = require('../middleware/authMiddleware');

router.post('/login',           ctrl.login);
router.post('/logout',          ctrl.logout);
router.get('/me',   requireAuth, ctrl.me);
router.put('/password', requireAuth, ctrl.changePassword);

module.exports = router;
