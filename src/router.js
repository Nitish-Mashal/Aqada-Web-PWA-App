import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/Login.vue';
import gameArea from './components/gameArea.vue'
import privacypolicy from './components/privacy-policy.vue'
import termscondition from './components/terms-and-conditions.vue'

const routes = [
  {
    path: '/aqada',
    name: 'gameArea',
    component: gameArea,
  },
  {
    path: '/aqada/privacy-policy',
    name: 'privacyPolicy',
    component: privacypolicy,
  },
  {
    path: '/aqada/terms-of-use',
    name: 'termsConditions',
    component: termscondition,
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