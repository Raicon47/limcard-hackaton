import { createRouter, createWebHistory } from 'vue-router'
import UserRegister from '@/pages/users/Register.vue'
import UserLogin from '@/pages/users/Login.vue'
import Home from '@/pages/Home.vue'
import UserDashboard from '@/pages/users/Dashboard.vue'
import { supabase } from '@/lib/supabase'
import UserWallet from '@/pages/users/UserWallet.vue'
import Card from '@/pages/card/Cards.vue'
import UserCards from '@/pages/users/UserCards.vue'
import CategoryPage from '@/components/CategoryPage.vue'
import CustomizeCard from '@/components/CustomizeCard.vue'
import SendCard from '@/components/SendCard.vue'
import ViewCard from '@/components/ViewCard.vue'

const routes = [
  { 
    path: '/', 
    name: 'home', 
    component: Home,
   props: true// Marked as accessible to guests
  },
  // Card routes
  {
    path: '/cards',
    name: 'cards',
    component: Card,
    props: true // Marked as accessible to guests
  },

  // Card routes

  // User routes
  {
    path: '/customize/:cardId',
    name: 'Customize-card',
    component: CustomizeCard,
    props: true
  },
  {
   path: '/send/',
   name: 'Send-card',
   component: SendCard,
   props: true
  },
  {
  path: '/card/:slug',
  name: 'ViewCard',
  component: ViewCard,
  props: true,
  meta: { public: true }
  },
  {
    path: '/category/:slug',
    name: 'CategoryPage',
    component: CategoryPage,
    props: true
  },
  { 
    path: '/user/register', 
    name: 'user-register', 
    component: UserRegister,
    meta: { forGuests: true }
  },
  { 
    path: '/user/login', 
    name: 'user-login', 
    component: UserLogin,
    meta: { forGuests: true }
  },
   {
    path: '/user/verify',
    name: 'user-verify',
     component: () => import('@/pages/users/Verify.vue'),
    meta: { requiresAuth: true, role: 'user' }
   },
  {
    path: '/user/dashboard',
    name: 'user-dashboard',
    component: UserDashboard,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/user/wallet',
    name: 'user-wallet',
    component: UserWallet,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/user/cards',
    name: 'user-cards',
    component: UserCards,
    meta: { requiresAuth: true, role: 'user' }
  },
  // User routes
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Enhanced Navigation Guard
router.beforeEach(async (to, from, next) => {
  // ✅ Allow public routes without auth
  if (to.meta.public) {
    return next()
  }

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  const type = user?.user_metadata?.type

  // 1. Prevent authenticated users from accessing guest routes
  if (to.meta.forGuests && user) {
    return next(`/${type}/dashboard`)
  }

  // 2. Redirect unauthenticated users trying to access protected routes
  if (to.meta.requiresAuth && !user) {
    if (to.path.startsWith('/business')) {
      return next('/business/login')
    }
    return next('/user/login')
  }

  // 3. Role-based redirection
  if (to.meta.role && to.meta.role !== type) {
    return next(`/${type}/dashboard`)
  }

  // 4. Prevent cross-role access
  if (to.path.startsWith('/business') && type === 'user') {
    return next('/user/dashboard')
  }

  if (to.path.startsWith('/user') && type === 'business') {
    return next('/business/dashboard')
  }

  next()
})

export default router