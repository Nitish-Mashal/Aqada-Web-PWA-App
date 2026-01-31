import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/Login.vue';
import gameArea from './components/gameArea.vue'

const routes = [
  {
    path: '/aqada',
    name: 'gameArea',
    component: gameArea,
  },


];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }

    } else {
      return {
        top: 0
      }
    }
  }
});
router.beforeEach((_to, from, next) => {
  next();
});

export default router;