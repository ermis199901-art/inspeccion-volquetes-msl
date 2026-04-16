const router      = require('express').Router();
const ctrl        = require('../controllers/inspeccionController');
const requireAuth = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');

router.use(requireAuth);

router.get('/volquetes',               ctrl.getVolquetes);
router.get('/dia/:fecha',              ctrl.getDia);
router.get('/historial/:volquete',     ctrl.historial);
router.get('/:volquete/:fecha',        ctrl.getOne);
router.post('/',                       ctrl.save);
router.delete('/:volquete/:fecha', requireAdmin, ctrl.remove);

module.exports = router;
