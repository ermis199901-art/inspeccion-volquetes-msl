const router      = require('express').Router();
const ctrl        = require('../controllers/usuarioController');
const requireAuth  = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');

router.use(requireAuth, requireAdmin);

router.get('/',     ctrl.list);
router.post('/',    ctrl.create);
router.put('/:id',  ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
